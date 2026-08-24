---
title: Customer Feedback System API
emoji: 💬
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Customer Feedback Bot — Backend API

FastAPI backend for the Customer Feedback Bot. Deployed on Hugging Face
Spaces (free CPU tier) using the included `Dockerfile`.

## Required Secrets

Set these under **Settings → Variables and secrets** on this Space:

| Name | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/public API key |
| `ADMIN_USERNAME` | (optional) dashboard login username, defaults to `admin` |
| `ADMIN_PASSWORD` | (optional) dashboard login password, defaults to `admin123` |

## Frontend

The static frontend (`index.html`, `pages/`, `assets/`) is deployed
separately via GitHub Pages. See `assets/js/config.js` — set
`API_BASE_URL` there to this Space's URL, e.g.
`https://YOUR_USERNAME-customer-feedback-bot.hf.space`.

## Notes

- Free Hugging Face Spaces hardware sleeps after a period of inactivity
  and wakes up on the next request (a few seconds' delay). This is
  expected behavior on the free tier, not a bug.
