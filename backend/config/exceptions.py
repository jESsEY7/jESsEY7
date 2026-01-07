"""
Custom exception handler for REST Framework
Provides consistent error response format
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error response format
    and logs errors appropriately.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get the view name for logging
    view = context.get('view', None)
    view_name = view.__class__.__name__ if view else 'Unknown'
    
    if response is not None:
        # Log the error
        if response.status_code >= 500:
            logger.error(f"Server error in {view_name}: {exc}", exc_info=True)
        elif response.status_code >= 400:
            logger.warning(f"Client error in {view_name}: {exc}")
        
        # Standardize error format
        error_response = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_error_message(response),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data}
            }
        }
        response.data = error_response
    else:
        # Handle unexpected exceptions
        logger.exception(f"Unhandled exception in {view_name}: {exc}")
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 500,
                    'message': 'An unexpected error occurred. Please try again later.',
                    'details': {}
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response


def get_error_message(response):
    """Extract a human-readable error message from the response."""
    status_messages = {
        400: 'Bad request',
        401: 'Authentication required',
        403: 'Permission denied',
        404: 'Resource not found',
        405: 'Method not allowed',
        429: 'Too many requests',
        500: 'Internal server error',
    }
    
    # Try to get specific message from response data
    if isinstance(response.data, dict):
        if 'detail' in response.data:
            return str(response.data['detail'])
        if 'message' in response.data:
            return str(response.data['message'])
    
    return status_messages.get(response.status_code, 'An error occurred')
