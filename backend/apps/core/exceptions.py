"""
Custom DRF exception handler so every error from the API has a consistent shape:
{
  "success": false,
  "message": "...",
  "errors": {...}
}
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('django.request')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        message = "Request failed."
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
            else:
                # Field validation errors - grab the first message for a friendly summary
                for key, value in response.data.items():
                    first = value[0] if isinstance(value, list) and value else value
                    message = f"{key}: {first}"
                    break

        response.data = {
            'success': False,
            'message': message,
            'errors': response.data,
        }
        return response

    # Unhandled exception -> log it, return generic 500 (never leak internals)
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return Response(
        {
            'success': False,
            'message': 'Something went wrong on our end. Please try again.',
            'errors': {},
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
