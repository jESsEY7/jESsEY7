import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute component that handles authentication and role-based access
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected content
 * @param {string} [props.requiredRole] - Optional role required to access (e.g., 'dealer', 'admin')
 * @param {string[]} [props.allowedRoles] - Optional array of allowed roles
 */
export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // Check role-based access
    const userRole = user.role || user.user_type || 'buyer';

    // If specific role required
    if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full text-center">
                    <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page. This area requires {requiredRole} privileges.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    // If allowed roles array provided
    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = allowedRoles.includes(userRole) || userRole === 'admin';
        if (!hasAccess) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                        <p className="text-gray-600 mb-6">
                            Your account type doesn't have access to this feature.
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                        >
                            Go to Home
                        </a>
                    </div>
                </div>
            );
        }
    }

    return children;
}
