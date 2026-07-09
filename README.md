# EventSnap AI

> Find your event photos instantly using AI face recognition.

One selfie. Thousands of event photos. AI finds only yours.

---

## How it works

1. An organizer creates an event and receives a unique QR code
2. Guests scan the QR code at the venue
3. Each guest registers/logs in and captures a single selfie
4. InsightFace compares the selfie's 512-d face embedding against every face in every uploaded event photo
5. Each guest sees **only** the photos containing their own face — never anyone else's

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Bootstrap 5, Framer Motion, Lucide React, react-hook-form |
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Database | MySQL 8+ |
| AI | InsightFace 0.7.3 (buffalo_l ONNX model), OpenCV, numpy |
| Storage (dev) | Local media files |
| Storage (prod) | Cloudinary |
| QR Code | Python qrcode library |
| Deployment | Frontend → Vercel, Backend → Render |

---

## Project structure

```
eventsnap-ai/
├── backend/
│   ├── apps/
│   │   ├── accounts/      # Custom User model, JWT auth, register/login
│   │   ├── events/        # Event CRUD, QR generation
│   │   ├── photos/        # Photo upload, gallery, "my photos"
│   │   ├── faceai/        # InsightFace engine, embeddings, matching
│   │   └── core/          # Shared utilities, permissions, dashboard
│   ├── eventsnap/         # Django project settings, URLs, WSGI
│   ├── media/             # Uploaded photos, selfies, QR images (dev)
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/           # Axios client + per-domain API methods
    │   ├── components/    # Navbar, Footer, AuthLayout, ResolvingGrid, etc.
    │   ├── context/       # AuthContext (JWT), ThemeContext (dark/light)
    │   ├── pages/         # All pages (landing, auth, attendee flow, admin)
    │   │   ├── admin/     # Admin dashboard, event management, upload, analytics
    │   │   └── landing/   # Hero, Features, HowItWorks, Gallery, FAQ, Pricing
    │   └── styles/        # Global CSS design tokens
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## Local setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/eventsnap-ai.git
cd eventsnap-ai
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install all dependencies
# NOTE: This will take a few minutes — insightface, onnxruntime, and
# opencv are large packages. See the dependency notes below.
pip install -r requirements.txt

# Copy environment file and configure your MySQL credentials
cp .env.example .env
# Edit .env — at minimum set DB_NAME, DB_USER, DB_PASSWORD

# Create the MySQL database
mysql -u root -p -e "CREATE DATABASE eventsnap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
python manage.py migrate

# Create an admin user and a demo event (optional but recommended)
python manage.py seed_demo

# Start the development server
python manage.py runserver
```

The backend will be at `http://localhost:8000`.

> **First run:** On the first request that triggers face detection, InsightFace will
> download the `buffalo_l` model pack (~280 MB) from GitHub Releases to
> `backend/.insightface/models/buffalo_l/`. This is a one-time download.
> Subsequent runs load the cached models in ~2–3 seconds.

### 3. Frontend setup

```bash
cd frontend

npm install

# Copy environment file (default points to localhost:8000 via the Vite proxy)
cp .env.example .env

# Start the dev server
npm run dev
```

The frontend will be at `http://localhost:5173`.

> The Vite dev server is configured to proxy `/api/*` and `/media/*` requests
> to `http://localhost:8000`, so you don't need to worry about CORS during
> development. Both servers must be running at the same time.

---

## Dependency notes (AI packages)

The AI stack has strict version compatibility requirements between packages:

| Package | Version constraint | Why |
|---|---|---|
| `numpy` | `>=2.0.0` | InsightFace's transitive deps pull in numpy 2.x |
| `onnxruntime` | `>=1.20.0` | `1.17.3` was compiled against numpy 1.x and breaks under numpy 2.x |
| `opencv-python-headless` | `>=4.10.0.84` | Must be a numpy-2-compatible build |
| `insightface` | `0.7.3` | Pinned — newer versions may change embedding format |

**If you hit `numpy.core.multiarray failed to import` or `_ARRAY_API not found`:**
This is the onnxruntime + numpy version mismatch. Run:
```bash
pip install --upgrade onnxruntime
pip install --upgrade opencv-python-headless
```

**GPU acceleration (optional):**
Replace `onnxruntime` with `onnxruntime-gpu` and set `FACE_CTX_ID=0` in `.env`.
This requires CUDA 11.8+ and the matching CUDNN version.

---

## Running the demo flow end-to-end

After running `python manage.py seed_demo`:

1. Go to `http://localhost:5173/login`
2. Log in as `admin@eventsnap.ai` / `Admin@12345`
3. Go to `/admin/dashboard` → open the "EventSnap Demo Wedding" event
4. **Upload Photos tab**: upload some group photos containing faces
5. Wait for AI processing to complete (watch `processed_photos` count update)
6. **QR Code tab**: copy the join URL
7. Open an incognito window, go to that URL
8. Register as a new attendee
9. On the Face Scan page, capture a selfie (or upload a photo)
10. You will be redirected to "My Photos" with your matched gallery

---

## API reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new account |
| POST | `/api/auth/login/` | Log in, receive JWT tokens |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET/PATCH | `/api/auth/profile/` | Get or update profile |
| POST | `/api/auth/forgot-password/` | Request a password reset token |
| POST | `/api/auth/reset-password/` | Reset password with token |
| POST | `/api/auth/token/refresh/` | Refresh an access token |

### Events (admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events/dashboard/` | Admin dashboard summary stats |
| GET | `/api/events/` | List admin's events |
| POST | `/api/events/` | Create event (auto-generates QR) |
| GET/PATCH/DELETE | `/api/events/<id>/` | Event detail, update, or delete |
| POST | `/api/events/<id>/regenerate-qr/` | Regenerate QR code |
| GET | `/api/events/<id>/attendees/` | List attendees |
| GET | `/api/events/<id>/analytics/` | Event analytics data |
| GET | `/api/events/join/<slug>/` | Public event lookup (no auth required) |
| POST | `/api/events/join/<slug>/confirm/` | Attendee confirms joining event |

### Photos

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/photos/upload/<event_id>/` | Upload event photos (multipart, multiple files) |
| GET | `/api/photos/event/<event_id>/` | List all photos for an event (admin) |
| GET | `/api/photos/my-photos/<event_id>/` | Attendee's matched photos for an event |
| DELETE | `/api/photos/<id>/` | Delete a photo (admin) |

### Face AI

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/faceai/selfie/<event_id>/` | Upload selfie and trigger face matching |
| POST | `/api/faceai/reprocess/<event_id>/` | Re-run face detection on all event photos (admin) |

All protected endpoints require `Authorization: Bearer <access_token>` header.

---

## Configuration

Key `.env` settings in `backend/.env.example`:

```bash
# Django
SECRET_KEY=...          # Generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DEBUG=True              # Set to False in production

# MySQL
DB_NAME=eventsnap_db
DB_USER=root
DB_PASSWORD=yourpassword

# Face AI tuning
FACE_MATCH_THRESHOLD=0.45   # Cosine similarity threshold: raise to be stricter, lower to be more permissive
FACE_MIN_DET_SCORE=0.55     # Minimum face detection confidence
FACE_CTX_ID=-1              # -1 = CPU, 0 = first GPU

# Cloudinary (production storage)
USE_CLOUDINARY=False        # Set to True and fill in credentials for production
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Match threshold tuning

The `FACE_MATCH_THRESHOLD` setting controls how strict the face matching is:

- **Too low (e.g. 0.25)**: More photos match — but you may see false positives (other people's photos appearing in your gallery)
- **Too high (e.g. 0.65)**: Fewer false positives — but you may miss some of your own photos (especially in dim lighting or partial profiles)
- **Recommended starting point**: `0.45` for well-lit indoor events; `0.40` for challenging outdoor/dim events

InsightFace's `buffalo_l` model is very accurate; with good selfie quality you can usually run at `0.50` without issues.

---

## Security notes

- All passwords are hashed via Django's PBKDF2-SHA256 (never stored plaintext)
- JWT access tokens expire after 60 minutes; refresh tokens after 7 days
- Refresh token blacklisting is enabled — logout invalidates the token server-side
- Each user can only query their own face matches — the backend enforces this at the database query level, not just in the UI
- File uploads are validated as images before processing
- Rate limiting: 60 requests/minute for anonymous, 120/minute for authenticated users

---

## Deployment

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on Render, connect your repo
3. Set **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
4. Set **Start Command**: `gunicorn eventsnap.wsgi:application --bind 0.0.0.0:$PORT`
5. Add all environment variables from `.env.example` with production values
6. Set `DEBUG=False`, `USE_CLOUDINARY=True`, and configure Cloudinary credentials
7. Add your Render domain to `ALLOWED_HOSTS`

> **Render free tier note**: The buffalo_l model weights (~280MB) will be downloaded
> on first startup. On Render free tier the disk is ephemeral, meaning the model
> re-downloads on each cold start. Consider Render's paid persistent disk, or
> pre-download the model and commit the zip to a Cloudinary asset.

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set the **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy — Vercel auto-detects Vite

### Database → PlanetScale or Railway

For production MySQL, use PlanetScale (serverless MySQL, generous free tier) or Railway. Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_PORT` accordingly.

---

## Development tips

**Run both servers with one command (using concurrently):**
```bash
# From the root of the project
npm install -g concurrently
concurrently "cd backend && python manage.py runserver" "cd frontend && npm run dev"
```

**Force re-processing all photos in an event:**
```
POST /api/faceai/reprocess/<event_id>/
```
Useful after adjusting `FACE_MATCH_THRESHOLD` or uploading new model weights.

**Django admin panel:**
Available at `http://localhost:8000/admin/` — useful for inspecting FaceEmbedding and FaceMatch records during debugging.

---

## License

MIT — do whatever you want with it. Attribution appreciated but not required.
