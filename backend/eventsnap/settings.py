"""
EventSnap AI - Django Settings
Production-ready configuration with environment-based switching.
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# CORE
# =========================================================
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-please')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,.onrender.com',
    cast=Csv()
)

# =========================================================
# APPLICATIONS
# =========================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'django_extensions',

    # Local apps
    'apps.accounts',
    'apps.events',
    'apps.photos',
    'apps.faceai',
    'apps.core',
]

# Cloudinary is optional - only enabled if credentials provided
USE_CLOUDINARY = config('USE_CLOUDINARY', default=False, cast=bool)
if USE_CLOUDINARY:
    INSTALLED_APPS += ['cloudinary_storage', 'cloudinary']

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'eventsnap.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'eventsnap.wsgi.application'
ASGI_APPLICATION = 'eventsnap.asgi.application'

# =========================================================
# DATABASE (MySQL)
# =========================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

AUTH_USER_MODEL = 'accounts.User'

# =========================================================
# PASSWORD VALIDATION
# =========================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =========================================================
# I18N
# =========================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# =========================================================
# STATIC & MEDIA
# =========================================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

if USE_CLOUDINARY:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
        'API_KEY': config('CLOUDINARY_API_KEY', default=''),
        'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================================================
# REST FRAMEWORK
# =========================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 24,
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '120/minute',
    },
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# =========================================================
# CORS
# =========================================================
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv()
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://*.onrender.com',
    cast=Csv()
)

# =========================================================
# FACE AI CONFIGURATION
# =========================================================
FACE_AI_CONFIG = {
    # InsightFace model pack. 'buffalo_l' is the standard high-accuracy pack.
    'MODEL_NAME': config('FACE_MODEL_NAME', default='buffalo_l'),
    # ctx_id = -1 forces CPU. Set to 0 to use GPU if onnxruntime-gpu is installed.
    'CTX_ID': config('FACE_CTX_ID', default=-1, cast=int),
    'DET_SIZE': (640, 640),
    # Cosine similarity threshold above which two faces are considered a match.
    # InsightFace buffalo_l embeddings: 0.45-0.50 is a reasonable starting threshold.
    'MATCH_THRESHOLD': config('FACE_MATCH_THRESHOLD', default=0.45, cast=float),
    # Minimum face detection confidence to bother generating an embedding
    'MIN_DET_SCORE': config('FACE_MIN_DET_SCORE', default=0.55, cast=float),
}

# Where insightface stores its downloaded model weights
INSIGHTFACE_HOME = config('INSIGHTFACE_HOME', default=str(BASE_DIR / '.insightface'))
os.environ.setdefault('INSIGHTFACE_HOME', INSIGHTFACE_HOME)

# =========================================================
# DEFAULT PRIMARY KEY
# =========================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {'format': '[{asctime}] {levelname} {name}: {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'verbose'},
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
    'loggers': {
        'apps.faceai': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
        'django.request': {'handlers': ['console'], 'level': 'ERROR', 'propagate': False},
    },
}

FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')
