# Customer Feedback Bot

A chatbot-style customer feedback collector with an admin dashboard,
sentiment tallying, and Word-document export. Static frontend + FastAPI
backend + Supabase for storage.

## Architecture

- **Frontend** (`index.html`, `pages/`, `assets/`) — plain HTML/CSS/JS,
  deployed for free on **GitHub Pages**.
- **Backend** (`backend/`) — FastAPI, deployed for free on **Render**
  (Free Web Service plan).
- **Database** — Supabase (free tier).

## Deploying the backend (Render)

1. Push this repo to GitHub.
2. On [render.com](https://render.com), click **New +** → **Web Service**,
   connect this repo. (Render will detect `render.yaml` automatically and
   pre-fill the build/start commands — or set them manually:
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
3. Choose the **Free** instance type.
4. Under **Environment**, add:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — your Supabase anon/public API key
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — optional, override the default
     `admin` / `admin123` dashboard login
5. Deploy. Render gives you a URL like
   `https://customer-feedback-bot-api.onrender.com`.

**Note:** the free Render web service spins down after 15 minutes of no
traffic and takes about a minute to wake up on the next request. This is
normal free-tier behavior, not a bug — and unlike Render's free Postgres
add-on (which expires after 30 days), the free **web service** itself does
not expire. Since this project uses Supabase for the database, Render's
Postgres expiry doesn't come into play at all.

## Deploying the frontend (GitHub Pages)

1. Open `assets/js/config.js` and set `API_BASE_URL` to your Render URL
   from above.
2. Push to GitHub. The included `.github/workflows/pages.yml` deploys
   automatically.
3. Enable Pages under repo **Settings → Pages**, source: **GitHub Actions**.

## Local development

```bash
cp .env.example .env   # fill in your Supabase credentials
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload
```

Then open `index.html` directly (with `assets/js/config.js` pointed at
`http://127.0.0.1:8000`).
