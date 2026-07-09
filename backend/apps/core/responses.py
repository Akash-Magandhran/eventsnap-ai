"""
Small helper so every successful API response also has a consistent envelope:
{
  "success": true,
  "message": "...",
  "data": {...}
}
"""
from rest_framework.response import Response


def api_response(data=None, message="Success", status=200):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data,
        },
        status=status,
    )
