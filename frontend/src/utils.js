/**
 * Route path mapping for page names
 * Maps page names to their actual routes
 */
const pageRoutes = {
    // Public pages
    'Home': '/',
    'Vehicles': '/vehicles',
    'VehicleDetails': '/vehicles',
    'Login': '/login',
    'Register': '/register',
    'DealerSignup': '/dealer-signup',

    // Protected pages
    'Favorites': '/favorites',
    'MyQuotes': '/my-quotes',
    'Dashboard': '/dashboard',

    // Role-specific pages
    'DealerDashboard': '/dealer/dashboard',
    'AdminDashboard': '/admin/dashboard',
};

/**
 * Create URL for a page with optional query params
 * @param {string} pageName - Name of the page (e.g., 'Vehicles', 'Home')
 * @returns {string} - URL path
 */
export const createPageUrl = (pageName) => {
    if (!pageName) return '/';

    // Handle query params (e.g., 'Vehicles?make=Toyota')
    let baseName = pageName;
    let queryString = '';

    if (pageName.includes('?')) {
        const [path, query] = pageName.split('?');
        baseName = path;
        queryString = `?${query}`;
    }

    // Check if we have a mapping for this page
    const route = pageRoutes[baseName];
    if (route) {
        return route + queryString;
    }

    // Fallback: convert to lowercase kebab-case
    const fallbackPath = '/' + baseName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

    return fallbackPath + queryString;
};

/**
 * Format currency for display - Uses KSH (Kenyan Shilling) by default
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: KES for Kenya Shilling)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
    if (amount === null || amount === undefined) return '-';

    // Format with KES symbol
    if (currency === 'KES') {
        return 'KSH ' + new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '-';
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Parse API errors into user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const parseApiError = (error) => {
    if (error.isNetworkError) {
        return 'Unable to connect to server. Please check your connection.';
    }
    if (error.isValidation && error.errors) {
        const errors = error.errors;
        if (typeof errors === 'string') return errors;
        if (errors.detail) return errors.detail;
        if (errors.non_field_errors) return errors.non_field_errors[0];
        const firstField = Object.keys(errors)[0];
        if (firstField && Array.isArray(errors[firstField])) {
            return `${firstField}: ${errors[firstField][0]}`;
        }
    }
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    return error.message || 'An unexpected error occurred.';
};
