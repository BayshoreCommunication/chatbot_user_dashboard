# Google OAuth Troubleshooting Guide

## Changes Made

### Frontend (user-auth-form.tsx)
1. ✅ Added missing fields: `website` and `company_organization_type`
2. ✅ Added console logging to debug request/response
3. ✅ Better error handling with detailed logs

### Backend (auth.py)
1. ✅ Added OPTIONS handler for `/auth/google` endpoint (CORS preflight)
2. ✅ Added comprehensive logging
3. ✅ Added try-catch with detailed error messages

## Step-by-Step Verification

### Step 1: Verify Environment Variables on Vercel

**Check if env vars are set in Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select project: `chatbot_user_dashboard`
3. Go to: Settings → Environment Variables
4. Verify these are set:
   ```
   VITE_GOOGLE_CLIENT_ID=410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=GOCSPX-[your-secret-here]
   VITE_API_URL=https://api.bayshorecommunication.org
   ```

**If missing, add them manually:**
- Click "Add New"
- Name: `VITE_GOOGLE_CLIENT_ID`
- Value: `410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com`
- Environment: Production, Preview, Development (all)
- Repeat for other vars

### Step 2: Verify Google OAuth Console Configuration

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth Client ID
3. Under "Authorized JavaScript origins", verify these domains:
   ```
   http://localhost:5173
   https://chatbot-user-dashboard.vercel.app
   ```

**If missing:**
- Click "ADD URI"
- Paste: `https://chatbot-user-dashboard.vercel.app`
- Click SAVE
- WAIT 10 MINUTES for changes to propagate

### Step 3: Verify Backend is Running

**Test backend health:**
```bash
curl https://api.bayshorecommunication.org/docs
```

Expected: Should return API documentation page

**Test CORS headers:**
```bash
curl -I https://api.bayshorecommunication.org/auth/google
```

Expected headers:
```
Access-Control-Allow-Origin: *
Cross-Origin-Opener-Policy: unsafe-none
Cross-Origin-Embedder-Policy: unsafe-none
```

### Step 4: Test Local Development First

**Before testing production, verify locally:**

1. **Start backend:**
   ```bash
   cd chatbot_backend
   python main.py
   ```

2. **Start frontend:**
   ```bash
   cd chatbot_user_dashboard
   npm run dev
   ```

3. **Open browser console** (F12)

4. **Go to:** http://localhost:5173/sign-up

5. **Click "Continue with Google"**

6. **Check console logs:**
   ```
   Google OAuth - Decoded JWT: {...}
   API URL: http://localhost:8000
   Sending to /auth/google: {...}
   Response status: 200 or error code
   Response headers: {...}
   ```

### Step 5: Deploy and Test Production

**Commit and push changes:**
```bash
cd chatbot_user_dashboard
git add .
git commit -m "Fix Google OAuth - add missing fields and logging"
git push origin main
```

**Wait for deployment** (~2 minutes)

**Test on production:**
1. Open: https://chatbot-user-dashboard.vercel.app/sign-up
2. Open browser console (F12)
3. Click "Continue with Google"
4. Check console logs for:
   - Decoded JWT
   - Request body
   - Response status
   - Any errors

### Step 6: Check Backend Logs

**If using a VPS/server for backend:**
```bash
tail -f /path/to/logs/app.log
```

**Look for:**
```
INFO: Google OAuth attempt for email: user@example.com
INFO: Creating new Google user: user@example.com
INFO: Google OAuth successful for: user@example.com
```

**Or errors:**
```
ERROR: HTTP Exception in Google OAuth: ...
ERROR: Unexpected error in Google OAuth: ...
```

## Common Errors and Solutions

### Error: "Network error. Please check your internet connection"

**Possible causes:**

1. **Backend not reachable**
   - Test: `curl https://api.bayshorecommunication.org/docs`
   - Fix: Restart backend server

2. **CORS blocking request**
   - Check browser console for CORS errors
   - Verify backend CORS middleware is running

3. **Backend throwing 500 error**
   - Check backend logs
   - Verify MongoDB is connected
   - Verify all environment variables are set

4. **Request timeout**
   - Backend might be slow to respond
   - Check backend health and performance

### Error: "Failed to authenticate with Google"

**Possible causes:**

1. **Missing Google Client ID in frontend**
   - Check: `console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
   - Should print: `410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com`
   - If undefined: Env vars not loaded in Vercel

2. **Google domain not authorized**
   - Google Console must have production domain
   - Wait 10 minutes after adding domain

3. **Backend validation error (422)**
   - Missing required fields in request
   - Check console logs for request body
   - Verify all fields are present

### Error: "Email already registered with different method"

**Solution:**
- User previously signed up with email/password
- They need to sign in with email/password instead
- Or we can link the Google account (requires code change)

## Debugging Checklist

Run through this checklist:

### Frontend Checks
- [ ] Vercel env vars are set
- [ ] Google Client ID loads in App.tsx
- [ ] Console shows "Decoded JWT" log
- [ ] Console shows "Sending to /auth/google" log
- [ ] Request includes all fields (email, organization_name, google_id, website, company_organization_type, has_paid_subscription)

### Backend Checks
- [ ] Backend is running and accessible
- [ ] `/docs` endpoint loads
- [ ] CORS headers are present
- [ ] OPTIONS request succeeds
- [ ] MongoDB is connected
- [ ] Logs show "Google OAuth attempt" message

### Google Console Checks
- [ ] Client ID matches: `410846066995-sdnso7dkpoh083akfk4k790dig56d0jn`
- [ ] Production domain added to authorized origins
- [ ] Waited 10 minutes after adding domain
- [ ] No typos in domain name

### Network Checks
- [ ] Can reach: `https://api.bayshorecommunication.org`
- [ ] Can reach: `https://chatbot-user-dashboard.vercel.app`
- [ ] No firewall blocking requests
- [ ] No ad blockers interfering

## Testing Commands

### Test Backend Endpoint Directly

```bash
# Test if endpoint accepts requests
curl -X POST https://api.bayshorecommunication.org/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "organization_name": "Test Org",
    "google_id": "test123",
    "website": "",
    "company_organization_type": "",
    "has_paid_subscription": false
  }'
```

Expected: Should return access token or error message (not "Network error")

### Test CORS Preflight

```bash
curl -X OPTIONS https://api.bayshorecommunication.org/auth/google \
  -H "Origin: https://chatbot-user-dashboard.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected: Should return 200 with CORS headers

## Next Steps After Fixing

Once Google OAuth works:

1. Remove console.log statements (production cleanup)
2. Add user analytics tracking
3. Implement automatic Google account linking
4. Add Google sign-in button loading state
5. Handle edge cases (disabled accounts, etc.)
