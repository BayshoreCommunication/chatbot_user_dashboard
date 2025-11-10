# Google OAuth 400 Error Troubleshooting Guide

## 🔴 Error: "400. The server cannot process the request because it is malformed"

This error happens BEFORE your code even runs - it's Google rejecting the OAuth request.

---

## ✅ **STEP-BY-STEP FIX**

### **Step 1: Verify Google Cloud Console Setup**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID: `410846066995-sdnso7dkpoh083akfk4k790dig56d0jn`

### **Step 2: Check "Authorized JavaScript origins" - THIS IS CRITICAL**

**MUST HAVE EXACTLY THESE (and ONLY these for popup mode):**

```
http://localhost:5173
https://chatbot-user-dashboard.vercel.app
```

**❌ IMPORTANT - What NOT to have:**

- ❌ **NO TRAILING SLASHES**: `https://chatbot-user-dashboard.vercel.app/` ← Wrong!
- ❌ **NO PATHS**: `https://chatbot-user-dashboard.vercel.app/sign-up` ← Wrong!
- ❌ **NO REDIRECT URIs SECTION**: Leave "Authorized redirect URIs" EMPTY for popup mode

### **Step 3: Check "Authorized redirect URIs" Section**

For popup-based OAuth (which you're using), this section should be **COMPLETELY EMPTY**.

**❌ Remove any redirect URIs if present:**

```
# These should NOT be there:
https://chatbot-user-dashboard.vercel.app/auth/callback  ❌ DELETE
http://localhost:5173/auth/callback  ❌ DELETE
```

### **Step 4: Verify OAuth Consent Screen**

1. Go to: **"OAuth consent screen"** (left sidebar)
2. Check:
   - ✅ Publishing status: **"Testing"** or **"In production"**
   - ✅ User type: **"External"**
   - ✅ Application name: Set to your app name
   - ✅ Authorized domains: Add `vercel.app` and `bayshorecommunication.org`

### **Step 5: Save and Wait**

1. Click **"SAVE"** in Google Console
2. **WAIT 5-10 MINUTES** for changes to propagate globally
3. Clear browser cache or use Incognito mode to test

---

## 🔍 **Common Causes of 400 Error**

| Issue                              | Solution                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Trailing slash in origin**       | Use `https://chatbot-user-dashboard.vercel.app` NOT `https://chatbot-user-dashboard.vercel.app/` |
| **Redirect URIs set (popup mode)** | Remove ALL redirect URIs - leave section empty                                                   |
| **Wrong domain**                   | Verify exact Vercel URL (check deployment URL)                                                   |
| **Client ID mismatch**             | Verify client ID in console matches your .env                                                    |
| **Recent changes**                 | Wait 5-10 minutes after saving in Google Console                                                 |
| **Browser cache**                  | Test in Incognito/Private mode                                                                   |
| **App not published**              | Set OAuth consent screen to "Testing" and add test users                                         |

---

## 🧪 **Testing Procedure**

### **Test 1: Verify Client ID Loading**

1. Open: `https://chatbot-user-dashboard.vercel.app`
2. Press **F12** → Console tab
3. Look for:

   ```
   === Google OAuth Configuration ===
   VITE_GOOGLE_CLIENT_ID from env: 410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com
   Using Client ID: 410846066995-sdnso7dkpoh083akfk4k790dig56d0jn.apps.googleusercontent.com
   Current URL: https://chatbot-user-dashboard.vercel.app
   ===================================
   ```

   **✅ If you see the full client ID** → Credentials are loaded correctly
   **❌ If you see "undefined"** → Vercel env vars not set or not deployed

### **Test 2: Check Exact Vercel URL**

Your Vercel URL might be slightly different. Check:

1. Go to: https://vercel.com/dashboard
2. Click on `chatbot_user_dashboard`
3. Copy the **exact production URL** from the deployment
4. Make sure this EXACT URL (without trailing slash) is in Google Console

**Possible URL variations:**

```
https://chatbot-user-dashboard.vercel.app  ✅ Most likely
https://chatbot-user-dashboard-git-main-bayshore.vercel.app  ⚠️ Check if this is your actual URL
https://chatbot-user-dashboard-bayshore.vercel.app  ⚠️ Check if this is your actual URL
```

### **Test 3: Try in Incognito Mode**

1. Open Chrome/Edge in Incognito mode
2. Go to: `https://chatbot-user-dashboard.vercel.app/sign-up`
3. Open Console (F12)
4. Click "Continue with Google"
5. Check if error persists

---

## 🛠️ **Expected Google Console Configuration**

### **Screenshot Checklist:**

#### **Credentials Page:**

```
Application type: Web application
Name: [Your App Name]

Authorized JavaScript origins:
  http://localhost:5173
  https://chatbot-user-dashboard.vercel.app

Authorized redirect URIs:
  [EMPTY - Nothing here for popup mode]
```

#### **OAuth Consent Screen:**

```
User Type: External
Publishing status: Testing (or In production)
App name: [Your App Name]
User support email: [Your email]
Developer contact email: [Your email]

Test users: (if in Testing mode)
  - Add your email addresses for testing
```

---

## 📋 **Quick Fix Checklist**

Copy this and check off each item:

- [ ] Go to Google Cloud Console credentials
- [ ] Click on OAuth 2.0 Client ID
- [ ] Verify "Authorized JavaScript origins" has EXACT URLs (no trailing slashes)
- [ ] Verify "Authorized redirect URIs" is EMPTY
- [ ] Click SAVE
- [ ] Wait 5-10 minutes
- [ ] Go to Vercel dashboard
- [ ] Verify environment variables are set:
  - [ ] VITE_GOOGLE_CLIENT_ID
  - [ ] VITE_GOOGLE_CLIENT_SECRET
- [ ] Redeploy from Vercel
- [ ] Wait for deployment to complete
- [ ] Test in Incognito mode
- [ ] Check browser console for logs
- [ ] Try Google sign-in

---

## 🎯 **Most Likely Solution**

Based on your error, the most common cause is:

**1. Trailing slash in authorized origins** - Go to Google Console and make sure it's:

```
https://chatbot-user-dashboard.vercel.app
```

NOT:

```
https://chatbot-user-dashboard.vercel.app/
```

**2. Redirect URIs are set** - For popup mode, "Authorized redirect URIs" must be completely empty.

**3. Need to wait** - If you just saved changes, wait 5-10 minutes for Google to propagate them globally.

---

## 🔗 **Useful Links**

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Google OAuth Playground (test client ID): https://developers.google.com/oauthplayground/
- Google OAuth Documentation: https://developers.google.com/identity/gsi/web/guides/overview

---

## 📞 **Still Not Working?**

If you've checked everything above and it still doesn't work:

1. **Take screenshots** of:

   - Google Console "Authorized JavaScript origins" section
   - Google Console "Authorized redirect URIs" section
   - Browser console logs when clicking "Continue with Google"
   - Vercel environment variables page

2. **Verify your exact production URL**:

   - Go to Vercel dashboard
   - Copy the exact deployment URL
   - Make sure it matches Google Console origins EXACTLY

3. **Try creating a new OAuth client**:

   - Sometimes Google Console has cache issues
   - Create a fresh OAuth 2.0 Client ID
   - Update your credentials in .env and Vercel
   - Redeploy

4. **Check OAuth consent screen test users**:
   - If app is in "Testing" mode
   - Your Google account must be added as a test user
   - Go to: OAuth consent screen → Test users → Add users
