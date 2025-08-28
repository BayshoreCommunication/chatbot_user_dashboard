# Vercel Environment Setup Guide

## Mixed Content Error Fix

The error "Mixed Content: The page was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint" occurs because the frontend is trying to make HTTP requests to the backend from an HTTPS page.

## Required Environment Variables

Set these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard

- Navigate to your project: `chatbot-user-dashboard`
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables

| Variable Name           | Value                                                                      | Environment |
| ----------------------- | -------------------------------------------------------------------------- | ----------- |
| `VITE_API_URL`          | `https://api.bayshorecommunication.org`                                    | Production  |
| `VITE_GOOGLE_CLIENT_ID` | `580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com` | Production  |
| `VITE_BOT_URL`          | `https://aibotwidget.bayshorecommunication.org/chatbot-widget.min.js`      | Production  |

### 3. For Development (Optional)

| Variable Name           | Value                                                                      | Environment |
| ----------------------- | -------------------------------------------------------------------------- | ----------- |
| `VITE_API_URL`          | `http://localhost:8000`                                                    | Development |
| `VITE_GOOGLE_CLIENT_ID` | `580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com` | Development |
| `VITE_BOT_URL`          | `http://localhost:5174/chatbot-widget.min.js`                              | Development |

## Steps to Fix

1. **Set Environment Variables in Vercel:**

   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add `VITE_API_URL` with value `https://api.bayshorecommunication.org`
   - Make sure it's set for **Production** environment

2. **Redeploy the Application:**

   - After setting environment variables, redeploy your application
   - Go to Deployments → Redeploy latest deployment

3. **Verify the Fix:**
   - Check that the environment variable is being used correctly
   - Open browser dev tools → Console
   - Look for any remaining HTTP requests

## Code Changes Made

The following files have been updated to ensure HTTPS usage:

1. **`src/lib/utils.ts`** - Updated `getApiUrl()` function to force HTTPS in production
2. **`src/config/api.ts`** - Already configured correctly
3. **`src/hooks/useAxiosPublic.ts`** - Uses the updated `getApiUrl()` function

## Testing

After deployment, test these endpoints:

- ✅ `https://api.bayshorecommunication.org/healthz` - Should return `{"status":"ok"}`
- ✅ `https://api.bayshorecommunication.org/api/instant-reply/` - Should not show mixed content error
- ✅ All API calls should use HTTPS

## Common Issues

1. **Environment Variable Not Set:** Make sure `VITE_API_URL` is set in Vercel
2. **Caching:** Clear browser cache or use incognito mode
3. **Deployment:** Ensure you redeploy after setting environment variables

## Verification

To verify the fix is working:

1. Open browser dev tools (F12)
2. Go to Network tab
3. Navigate to the Train AI page
4. Check that all API requests use `https://` instead of `http://`
5. No mixed content errors should appear in the console

## Support

If you still see mixed content errors after following these steps:

1. Check that environment variables are set correctly in Vercel
2. Redeploy the application
3. Clear browser cache
4. Check browser console for any remaining HTTP requests
