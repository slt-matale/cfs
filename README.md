# 🤖 SLTMobitel Customer Feedback System

An AI-powered customer feedback collection and analytics platform built for **SLTMobitel**. Customers interact with a chatbot-style interface to submit ratings and comments, while administrators access a rich analytics dashboard featuring sentiment analysis, visual charts, AI-generated summaries, and Word-document report exports.

---

## ✨ Features

### Customer Chatbot
- Conversational, step-by-step feedback collection
- Rates **waiting time**, **staff knowledge**, **office environment**, and **parking**
- Captures service type (SLT / Mobitel / Both), phone number, and free-text comments
- Real-time sentiment classification (Positive / Neutral / Negative)

### Admin Dashboard
- Secure username/password login
- KPI cards — total, positive, neutral, and negative feedback counts with percentages
- Interactive **Chart.js** visualisations:
  - Sentiment distribution (doughnut)
  - Service usage (doughnut)
  - Waiting-time, staff, and office-environment ratings (bar)
  - Weekly feedback trend (line)
- Full AI-generated summary report with key findings and recommendations
- Scrollable feedback data table with all records
- **One-click Word export** — download the AI summary report or raw feedback data as `.docx` files

### Backend API
- RESTful endpoints built with **FastAPI**
- Rule-based sentiment analysis on ratings + keyword matching on comments
- Optional Hugging Face Transformers sentiment model (`analysis.py`)
- Supabase integration for persistent storage
- CORS enabled for cross-origin frontend access

---

## 🏗️ Architecture

```
┌──────────────────────────┐       HTTPS        ┌──────────────────────────┐
│   Frontend (Static)      │  ◄──────────────►  │   Backend (FastAPI)      │
│                          │                    │                          │
│  index.html   (chatbot)  │                    │  /questions              │
│  pages/login.html        │                    │  /feedback     POST      │
│  pages/dashboard.html    │                    │  /login        POST      │
│  assets/css + js         │                    │  /dashboard-data         │
│                          │                    │  /ai-summary             │
│  Hosted on GitHub Pages  │                    │  /download-ai-summary    │
│                          │                    │  /download-customer-     │
│                          │                    │    feedback              │
│                          │                    │                          │
│                          │                    │  Hosted on Render (free) │
└──────────────────────────┘                    └────────────┬─────────────┘
                                                             │
                                                             │  Supabase SDK
                                                             ▼
                                                ┌──────────────────────────┐
                                                │   Supabase (Postgres)    │
                                                │   customer_feedback tbl  │
                                                │   Free tier              │
                                                └──────────────────────────┘
```

| Layer        | Technology              | Hosting                  |
| ------------ | ----------------------- | ------------------------ |
| **Frontend** | HTML / CSS / JavaScript | GitHub Pages (free)      |
| **Backend**  | Python · FastAPI        | Render Free Web Service  |
| **Database** | PostgreSQL              | Supabase (free tier)     |
| **Charts**   | Chart.js (CDN)          | —                        |
| **Exports**  | python-docx             | Generated server-side    |

---

## 📁 Project Structure

```
cfs/
├── index.html                     # Chatbot entry page
├── pages/
│   ├── login.html                 # Admin login page
│   └── dashboard.html             # Analytics dashboard
├── assets/
│   ├── css/
│   │   ├── style.css              # Chatbot styles
│   │   ├── login.css              # Login page styles
│   │   └── dashboard.css          # Dashboard styles
│   └── js/
│       ├── config.js              # API base URL configuration
│       ├── script.js              # Chatbot logic
│       ├── login.js               # Login form handler
│       └── dashboard.js           # Dashboard charts & data
├── backend/
│   ├── __init__.py
│   ├── app.py                     # FastAPI application & routes
│   ├── chatbot.py                 # Question definitions
│   ├── database.py                # Supabase client setup
│   ├── analysis.py                # HuggingFace sentiment model
│   ├── ai_summary.py              # AI summary generator
│   └── requirements.txt           # Python dependencies
├── .github/
│   └── workflows/
│       └── pages.yml              # GitHub Pages deploy workflow
├── .env.example                   # Environment variable template
├── Dockerfile                     # Docker build (HF Spaces)
├── render.yaml                    # Render Blueprint config
├── LICENSE                        # MIT License
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- A [Supabase](https://supabase.com) project (free tier)
- A `customer_feedback` table in Supabase with the following columns:

  | Column       | Type        | Notes                        |
  | ------------ | ----------- | ---------------------------- |
  | `id`         | `int8`      | Primary key, auto-increment  |
  | `service`    | `text`      |                              |
  | `phone`      | `text`      |                              |
  | `waiting`    | `text`      |                              |
  | `staff`      | `text`      |                              |
  | `office`     | `text`      |                              |
  | `parking`    | `text`      |                              |
  | `comment`    | `text`      |                              |
  | `sentiment`  | `text`      |                              |
  | `created_at` | `timestamptz` | Default: `now()`           |

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/slt-matale/cfs.git
   cd cfs
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your Supabase credentials:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Install Python dependencies**

   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Start the backend**

   ```bash
   uvicorn backend.app:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`.

5. **Open the frontend**

   Update `assets/js/config.js` to point at your local backend:

   ```js
   const API_BASE_URL = "http://127.0.0.1:8000";
   ```

   Then open `index.html` directly in your browser.

---

## ☁️ Deployment

### Backend → Render (Free Tier)

1. Push this repo to GitHub.
2. On [render.com](https://render.com), click **New +** → **Web Service** and connect this repository.
   - Render will auto-detect `render.yaml` and pre-fill the build/start commands, or set them manually:
     - **Build command:** `pip install -r backend/requirements.txt`
     - **Start command:** `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
3. Choose the **Free** instance type.
4. Under **Environment**, add these variables:

   | Variable         | Value                          |
   | ---------------- | ------------------------------ |
   | `SUPABASE_URL`   | Your Supabase project URL      |
   | `SUPABASE_KEY`   | Your Supabase anon/public key  |
   | `ADMIN_USERNAME` | Custom admin username           |
   | `ADMIN_PASSWORD` | Custom admin password           |

5. Deploy. Render will give you a URL like `https://cfs-xxxx.onrender.com`.

> **Note:** The free Render web service spins down after 15 minutes of inactivity and takes ~1 minute to wake on the next request. This is normal free-tier behaviour. Since the database is hosted on Supabase (not Render Postgres), there is no 30-day expiry concern.

### Frontend → GitHub Pages

1. Update `assets/js/config.js` with your Render backend URL:

   ```js
   const API_BASE_URL = "https://your-service.onrender.com";
   ```

2. Push to the `main` branch. The included GitHub Actions workflow (`.github/workflows/pages.yml`) deploys automatically.
3. Enable Pages in the repo: **Settings → Pages → Source: GitHub Actions**.

### Alternative: Docker / Hugging Face Spaces

A `Dockerfile` is included for containerised deployments. The image exposes port **7860** (the default for Hugging Face Spaces Docker SDK).

```bash
docker build -t cfs .
docker run -p 7860:7860 \
  -e SUPABASE_URL=... \
  -e SUPABASE_KEY=... \
  cfs
```

---

## 📡 API Reference

| Method | Endpoint                          | Description                                    |
| ------ | --------------------------------- | ---------------------------------------------- |
| `GET`  | `/`                               | Health check                                   |
| `GET`  | `/questions`                      | Returns the chatbot question list               |
| `POST` | `/feedback`                       | Submit a feedback entry (JSON body)             |
| `POST` | `/login`                          | Admin authentication                            |
| `GET`  | `/dashboard-data`                 | Aggregated analytics & all feedback records     |
| `GET`  | `/ai-summary`                     | AI-generated summary with findings & recommendations |
| `GET`  | `/download-ai-summary`            | Download AI summary as a `.docx` file           |
| `GET`  | `/download-customer-feedback`     | Download all feedback data as a `.docx` file    |
| `GET`  | `/test-supabase`                  | Test Supabase connectivity                      |

### Example: Submit Feedback

```bash
curl -X POST https://your-api.onrender.com/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "service": "SLT",
    "phone": "0771234567",
    "waiting": "Good",
    "staff": "Excellent",
    "office": "Average",
    "parking": "Good",
    "comment": "Friendly and helpful staff"
  }'
```

---

## 🛠️ Tech Stack

| Category      | Technologies                                                      |
| ------------- | ----------------------------------------------------------------- |
| Frontend      | HTML5, CSS3, Vanilla JavaScript                                   |
| Backend       | Python 3.11, FastAPI, Uvicorn                                     |
| Database      | Supabase (PostgreSQL)                                             |
| Charting      | Chart.js                                                          |
| Exports       | python-docx                                                       |
| AI/NLP        | Rule-based sentiment + HuggingFace Transformers (optional)         |
| CI/CD         | GitHub Actions (Pages deployment)                                  |
| Containerisation | Docker                                                         |

---

## 🔧 Environment Variables

| Variable         | Required | Default     | Description                   |
| ---------------- | -------- | ----------- | ----------------------------- |
| `SUPABASE_URL`   | ✅       | —           | Supabase project URL          |
| `SUPABASE_KEY`   | ✅       | —           | Supabase anon/public API key  |
| `ADMIN_USERNAME` | ❌       | `admin`     | Dashboard login username      |
| `ADMIN_PASSWORD` | ❌       | `admin123`  | Dashboard login password      |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**Copyright © 2026 SLT Matale**
