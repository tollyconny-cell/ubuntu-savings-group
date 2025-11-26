Ubuntu Savings Group - Deployment Guide (Automated)

Overview:
- Backend: will be deployed to Heroku app `ubuntusavings-backend`
- Frontend: deploy to Vercel; set env REACT_APP_BACKEND_URL to your backend URL

Steps to finish deployment:

1) Push code to GitHub (from package root)
   git init
   git add .
   git commit -m "Initial deploy package"
   gh repo create ubuntu-savings-group --public --source=. --remote=origin --push

2) Set GitHub secret HEROKU_API_KEY
   - Go to GitHub repo > Settings > Secrets > Actions > New repository secret
   - Name: HEROKU_API_KEY
   - Value: your Heroku API key (from heroku account settings)

3) Use set-keys.sh to set Heroku config (locally)
   ./set-keys.sh sk_test_xxx whsec_xxx pk_test_xxx

4) After GitHub Actions runs, backend will be deployed to Heroku app: https://ubuntusavings-backend.herokuapp.com

5) In Stripe Dashboard > Webhooks:
   - Add endpoint: https://ubuntusavings-backend.herokuapp.com/api/webhook
   - Select events: checkout.session.completed
   - Copy signing secret and run set-keys.sh with that value

6) Deploy frontend to Vercel:
   - In Vercel project settings, set REACT_APP_BACKEND_URL to https://ubuntusavings-backend.herokuapp.com
   - Set REACT_APP_STRIPE_PUBLISHABLE_KEY to your publishable key
   - Deploy the frontend (Vercel will build and live site will point to backend)

Testing:
- Use Stripe test card 4242 4242 4242 4242 to checkout
- Ensure webhook events appear in backend logs and dashboard updates

