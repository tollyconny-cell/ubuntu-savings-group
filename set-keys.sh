#!/usr/bin/env bash
# set-keys.sh - set Heroku config vars quickly for ubuntusavings-backend
# Usage: ./set-keys.sh <STRIPE_SECRET_KEY> <STRIPE_WEBHOOK_SECRET> <STRIPE_PUBLISHABLE_KEY>
APP_NAME="ubuntusavings-backend"

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Usage: ./set-keys.sh <STRIPE_SECRET_KEY> <STRIPE_WEBHOOK_SECRET> <STRIPE_PUBLISHABLE_KEY>"
  exit 1
fi

STRIPE_SECRET_KEY="$1"
STRIPE_WEBHOOK_SECRET="$2"
STRIPE_PUBLISHABLE_KEY="$3"

echo "Setting config vars on Heroku app: $APP_NAME"
heroku config:set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" REACT_APP_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" --app $APP_NAME

echo "Done. Remember to set HEROKU_API_KEY in GitHub secrets for CI deployment."
