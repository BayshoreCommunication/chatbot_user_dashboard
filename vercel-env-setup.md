# Vercel Environment Variables Setup

To fix the mixed content error, you need to set the following environment variables in your Vercel deployment:

## Required Environment Variables

1. Go to your Vercel dashboard
2. Select your chatbot-user-dashboard project
3. Go to Settings > Environment Variables
4. Add the following variables:

### For Production:

```
VITE_API_URL=https://api.bayshorecommunication.org
VITE_GOOGLE_CLIENT_ID=580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com
VITE_BOT_URL=https://aibotwidget.bayshorecommunication.org/chatbot-widget.min.js
```

### For Preview/Development (optional):

```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com
VITE_BOT_URL=http://localhost:5174/chatbot-widget.min.js
```

## Important Notes:

1. **HTTPS Required**: The `VITE_API_URL` must use HTTPS (`https://`) in production to avoid mixed content errors
2. **No HTTP in Production**: Never use `http://` URLs in production when your frontend is served over HTTPS
3. **Redeploy**: After setting the environment variables, redeploy your application

## Verification:

After setting the environment variables and redeploying, the mixed content error should be resolved. You can verify this by:

1. Opening the browser console
2. Checking that all API requests use HTTPS URLs
3. No more "Mixed Content" errors should appear

## Alternative Quick Fix:

If you want to quickly test the fix without setting environment variables, the code has been updated to automatically use HTTPS in production mode. However, it's still recommended to set the environment variables explicitly for better control.
