import axios from 'axios';

/**
 * Centralized Axios client with:
 * - Configurable base URL from environment
 * - Request interceptor for auth token injection
 * - Response interceptor for 401 handling and token refresh
 * - Enhanced error handling for network vs server errors
 */

// Get API URL from environment, with fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
    console.log('[API Client] Base URL:', baseURL);
}

const client = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if using cookies for auth
});

// Request interceptor - inject auth token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in dev mode
        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor - handle errors and token refresh
client.interceptors.response.use(
    (response) => {
        // Log successful responses in dev mode
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}:`, response.status);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log errors with full details in dev mode
        if (import.meta.env.DEV) {
            console.error('[API Error]', {
                url: originalRequest?.url,
                method: originalRequest?.method,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                code: error.code
            });
        }

        // Handle network errors (no response)
        if (!error.response) {
            const networkError = new Error(
                error.code === 'ERR_NETWORK'
                    ? 'Unable to connect to server. Please check if the backend is running.'
                    : error.code === 'ECONNABORTED'
                        ? 'Request timed out. Please try again.'
                        : 'Network error. Please check your connection.'
            );
            networkError.isNetworkError = true;
            networkError.originalError = error;
            return Promise.reject(networkError);
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return client(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    client.defaults.headers.common['Authorization'] = `Bearer ${access}`;

                    processQueue(null, access);
                    isRefreshing = false;

                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;

                    // Clear tokens and redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    // Only redirect if not already on login/register page
                    if (!window.location.pathname.includes('/login') &&
                        !window.location.pathname.includes('/register')) {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                }
            } else {
                isRefreshing = false;
                // No refresh token - redirect to login
                if (!window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            const forbiddenError = new Error('You do not have permission to perform this action.');
            forbiddenError.isForbidden = true;
            forbiddenError.originalError = error;
            return Promise.reject(forbiddenError);
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
            const notFoundError = new Error('The requested resource was not found.');
            notFoundError.isNotFound = true;
            notFoundError.originalError = error;
            return Promise.reject(notFoundError);
        }

        // Handle validation errors (400)
        if (error.response?.status === 400) {
            const validationError = new Error('Validation error');
            validationError.isValidation = true;
            validationError.errors = error.response.data;
            validationError.originalError = error;
            return Promise.reject(validationError);
        }

        // Handle server errors (500+)
        if (error.response?.status >= 500) {
            const serverError = new Error('Server error. Please try again later.');
            serverError.isServerError = true;
            serverError.originalError = error;
            return Promise.reject(serverError);
        }

        return Promise.reject(error);
    }
);

/**
 * Helper to extract user-friendly error message
 */
export const getErrorMessage = (error) => {
    if (error.isNetworkError) {
        return error.message;
    }
    if (error.isValidation && error.errors) {
        // Extract first validation error
        const errors = error.errors;
        if (typeof errors === 'string') return errors;
        if (errors.detail) return errors.detail;
        if (errors.non_field_errors) return errors.non_field_errors[0];
        // Get first field error
        const firstField = Object.keys(errors)[0];
        if (firstField && Array.isArray(errors[firstField])) {
            return `${firstField}: ${errors[firstField][0]}`;
        }
        return 'Please check your input and try again.';
    }
    if (error.isForbidden) {
        return error.message;
    }
    if (error.isServerError) {
        return error.message;
    }
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred.';
};

/**
 * Health check function to verify API is reachable
 */
export const checkApiHealth = async () => {
    try {
        // Try to hit a simple endpoint
        await client.get('/vehicles/', { params: { limit: 1 }, timeout: 5000 });
        return { ok: true };
    } catch (error) {
        return {
            ok: false,
            error: error.isNetworkError ? 'Server unreachable' : error.message
        };
    }
};

export default client;
