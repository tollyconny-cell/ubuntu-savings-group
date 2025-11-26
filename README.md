# Ubuntu Savings Group - Deploy package (with automation)

This package contains a backend (Node/Express) and a frontend (React) for the Ubuntu Savings Group stokvel site,
plus GitHub Actions for Heroku, a Railway template, and helper scripts.

## What I added
- Frontend reads backend URL from `REACT_APP_BACKEND_URL` or `window.__BACKEND_URL__` at runtime.
- Frontend reads Stripe publishable key from `REACT_APP_STRIPE_PUBLISHABLE_KEY` or `window.__STRIPE_PUBLISHABLE_KEY__`.
- GitHub Actions workflow to auto-deploy backend to Heroku on push to `main`.
- `set-keys.sh` script to set Heroku config vars quickly.
- `railway.json` template for quick Railway import.

## Quick start (local)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# put your Stripe secret & webhook secret in .env
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Deploy backend to Heroku (automated via GitHub Actions)
1. Push repo to GitHub (instructions in the main README).
2. Add `HEROKU_API_KEY` to GitHub secrets (your Heroku API key).
3. The GitHub Actions workflow will deploy to Heroku app: `ubuntusavings-backend` (change if different).

## Files to edit before deploy
- backend/.env.example -> put real keys and rename to .env on server or set Heroku config vars.
- frontend: set Vercel env `REACT_APP_BACKEND_URL` to your backend URL and `REACT_APP_STRIPE_PUBLISHABLE_KEY`.

## Stripe webhook
- Create a webhook in Stripe dashboard pointing to `https://ubuntusavings-backend.herokuapp.com/api/webhook`
- Copy webhook secret to Heroku env `STRIPE_WEBHOOK_SECRET`

## Helper scripts and CI
- `set-keys.sh` sets Heroku config vars from CLI (you must have heroku CLI logged in).
- `.github/workflows/heroku-deploy.yml` deploys backend when you push to main.

