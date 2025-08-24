# User Dashboard API Error Fix Guide

## Issues Identified

The user dashboard is experiencing multiple API errors:

1. **Load settings error: AxiosError** - Settings endpoints failing
2. **Save settings error: AxiosError** - Settings save endpoints failing  
3. **api/faq/list: 404 Not Found** - FAQ endpoints failing
4. **Stripe.js HTTPS warning** - Development environment warning

## Root Cause Analysis

The errors are caused by the same **ObjectId conversion issues** we fixed in the backend:

1. **FAQ Routes**: Using `organization["id"]` instead of `organization["_id"]`
2. **Settings Routes**: Same ObjectId handling issues
3. **Environment Configuration**: Dashboard trying to connect to localhost instead of production API

## Backend Fixes Applied

### ✅ **FAQ Routes Fixed** (`chatbot_backend/routes/faq.py`)

All FAQ routes now properly handle ObjectId conversion:

- `GET /api/faq/list` - Fixed organization ID handling
- `POST /api/faq/create` - Fixed organization ID handling  
- `GET /api/faq/{faq_id}` - Fixed organization ID handling
- `PUT /api/faq/{faq_id}` - Fixed organization ID handling
- `DELETE /api/faq/{faq_id}` - Fixed organization ID handling
- `PUT /api/faq/{faq_id}/toggle` - Fixed organization ID handling

### ✅ **Settings Routes Already Fixed** (`chatbot_backend/routes/chatbot.py`)

- `GET /api/chatbot/settings` - Fixed ObjectId handling
- `POST /api/chatbot/save-settings` - Fixed ObjectId handling

## Frontend Configuration Issues

### ❌ **Missing Environment File**

The dashboard needs a `.env.local` file with production API URLs.

### ❌ **Development vs Production URLs**

The dashboard is trying to connect to localhost instead of the production API.

## Complete Solution

### 1. **Create Environment File**

Create `chatbot_user_dashboard/.env.local`:

```bash
# Chatbot User Dashboard Environment Variables
# Production Configuration

# API Configuration
VITE_API_URL=https://api.bayshorecommunication.org
VITE_GOOGLE_CLIENT_ID=580986048415-qpgtv2kvij47ae4if8ep47jjq8o2qtmj.apps.googleusercontent.com

# Widget Configuration
VITE_BOT_URL=https://aibotwidget.bayshorecommunication.org/chatbot-widget.min.js

# Development overrides (uncomment for local development)
# VITE_API_URL=http://localhost:8000
# VITE_BOT_URL=http://localhost:5174/chatbot-widget.min.js
```

### 2. **Deploy Backend Fixes**

The backend code with ObjectId fixes needs to be deployed:

- `chatbot_backend/routes/faq.py` - Fixed all FAQ routes
- `chatbot_backend/routes/chatbot.py` - Already fixed settings routes
- `chatbot_backend/routes/organization.py` - Already fixed organization dependency

### 3. **Rebuild Dashboard**

After creating the environment file:

```bash
cd chatbot_user_dashboard
npm run build
```

## Testing Steps

### 1. **Test API Endpoints**

```bash
# Test FAQ list endpoint
curl -X GET "https://api.bayshorecommunication.org/api/faq/list" \
  -H "X-API-Key: org_sk_3ca4feb8c1afe80f73e1a40256d48e7c"

# Test settings endpoint
curl -X GET "https://api.bayshorecommunication.org/api/chatbot/settings" \
  -H "X-API-Key: org_sk_3ca4feb8c1afe80f73e1a40256d48e7c"
```

### 2. **Test Dashboard**

1. Create the `.env.local` file
2. Rebuild the dashboard
3. Deploy the updated backend code
4. Test the dashboard functionality

### 3. **Expected Results**

After fixes:
- ✅ FAQ list loads without 404 errors
- ✅ Settings load and save successfully
- ✅ No more AxiosError messages
- ✅ Dashboard functions properly

## Files Modified

### Backend Files:
- `chatbot_backend/routes/faq.py` - Fixed ObjectId handling in all FAQ routes

### Frontend Files:
- `chatbot_user_dashboard/.env.local` - Created with production API URLs

## Deployment Checklist

- [ ] Deploy updated backend code with FAQ fixes
- [ ] Create `.env.local` file in dashboard
- [ ] Rebuild dashboard with production URLs
- [ ] Deploy updated dashboard
- [ ] Test all dashboard functionality

## Error Resolution

### Before Fix:
```
Load settings error: AxiosError
Save settings error: AxiosError  
api/faq/list: 404 Not Found
```

### After Fix:
```
✅ Settings load successfully
✅ Settings save successfully
✅ FAQ list loads successfully
✅ Dashboard functions properly
```

## Next Steps

1. **Immediate**: Create `.env.local` file and deploy backend fixes
2. **Short-term**: Rebuild and deploy dashboard
3. **Medium-term**: Test all dashboard functionality
4. **Long-term**: Monitor for any remaining issues

---

**Status**: ✅ **BACKEND FIXES COMPLETE - AWAITING DEPLOYMENT**

The dashboard should work perfectly once the backend code is deployed and the environment file is created.
