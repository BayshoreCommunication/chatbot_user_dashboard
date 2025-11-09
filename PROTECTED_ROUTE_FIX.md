# Protected Route Fix - Testing Guide

## Issues Fixed

### 1. **Wrong Context Being Used**
- **Problem**: ProtectedRoute was using `AuthContext` but landing page uses `UserContext`
- **Fix**: Changed to use `UserContext` which is properly integrated with the app

### 2. **Wrong Token Key**
- **Problem**: Checking for `localStorage.getItem('authToken')` but auth saves as `'token'`
- **Fix**: Changed to check for `localStorage.getItem('token')`

### 3. **No Loading State**
- **Problem**: Component would render nothing while checking, causing flash
- **Fix**: Added proper loading spinner while checking authentication

### 4. **Race Condition**
- **Problem**: useEffect might run before user data is loaded from localStorage
- **Fix**: Added proper checks to wait for user data before making decisions

### 5. **No Multi-Tab Sync**
- **Problem**: UserContext didn't listen to localStorage changes
- **Fix**: Added storage event listener for cross-tab synchronization

## How It Works Now

### Authentication Flow:

```
User tries to access /dashboard
       ↓
1. Check localStorage.getItem('token')
   - If NO → Redirect to /sign-in
   - If YES → Continue
       ↓
2. Check if user data is loaded (from UserContext)
   - If NO → Show loading spinner
   - If YES → Continue
       ↓
3. Check user.has_paid_subscription
   - If FALSE → Set flag + Redirect to / (landing)
   - If TRUE → Allow access to dashboard
       ↓
4. Render dashboard content
```

### Protection Points:

✅ **No Token** → Sign-In Page
✅ **No User Data** → Loading Spinner
✅ **No Subscription** → Landing Page with Alert
✅ **Has Subscription** → Dashboard Access

## Testing Steps

### Test 1: No Authentication (Not Logged In)
```javascript
// Clear localStorage
localStorage.clear()

// Try to access dashboard
window.location.href = '/dashboard'

// Expected: Redirect to /sign-in
```

### Test 2: Logged In but No Subscription
```javascript
// Set up user without subscription
localStorage.setItem('token', 'fake-token-123')
localStorage.setItem('user', JSON.stringify({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  has_paid_subscription: false
}))

// Refresh and try to access dashboard
window.location.href = '/dashboard'

// Expected: 
// 1. Redirect to / (landing page)
// 2. See yellow alert: "Subscription Required"
```

### Test 3: Logged In with Active Subscription
```javascript
// Set up user WITH subscription
localStorage.setItem('token', 'fake-token-123')
localStorage.setItem('user', JSON.stringify({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  has_paid_subscription: true,
  subscriptionId: 'sub_123'
}))

// Access dashboard
window.location.href = '/dashboard'

// Expected: Dashboard loads successfully
```

### Test 4: Subscription Expires While Logged In
```javascript
// User is on dashboard with subscription
// Then subscription expires (webhook updates backend)

// Simulate: Update user data to expired
const user = JSON.parse(localStorage.getItem('user'))
user.has_paid_subscription = false
localStorage.setItem('user', JSON.stringify(user))

// Trigger re-render (refresh page or navigate)
window.location.reload()

// Expected: Redirect to landing page with alert
```

## Console Logs to Monitor

The ProtectedRoute now logs its decisions:

```
✅ "User has paid subscription, allowing access"
❌ "No auth token found, redirecting to sign-in"
❌ "No paid subscription, redirecting to landing page"
ℹ️ "User data not loaded yet"
```

## Integration with Backend

### Webhook Updates (Automatic)
When subscription status changes via Stripe webhooks:

```python
# Backend updates user
user.has_paid_subscription = True/False

# Frontend needs to:
# 1. Refresh user data from API, OR
# 2. Get updated data on next login
```

### Manual Refresh (Optional)
To sync subscription status without logout:

```javascript
// Add to dashboard or useEffect
const refreshUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  const userData = await response.json()
  localStorage.setItem('user', JSON.stringify(userData))
  window.location.reload() // Trigger protection check
}
```

## Edge Cases Handled

✅ User has token but user data corrupted → Shows loading, then redirects
✅ User clears localStorage while on dashboard → Redirects to sign-in
✅ Multiple tabs open → Storage event syncs state
✅ User navigates directly to /dashboard URL → Protection kicks in
✅ User tries to access nested routes like /dashboard/chats → Protected at parent level

## Common Issues & Solutions

### Issue: "Infinite redirect loop"
**Cause**: Token exists but user data missing
**Solution**: Clear localStorage completely and login again

### Issue: "Shows loading forever"
**Cause**: User data not in localStorage
**Solution**: Check if auth form properly saves user data after login

### Issue: "Redirects even with subscription"
**Cause**: localStorage 'user' data doesn't have `has_paid_subscription: true`
**Solution**: Check backend response includes this field

### Issue: "Can access dashboard without subscription"
**Cause**: Protection not wrapping routes properly
**Solution**: Verify router.tsx has ProtectedRoute wrapping dashboard routes

## Files Modified

1. ✅ `src/components/ProtectedRoute.tsx` - Main protection logic
2. ✅ `src/context/UserContext.tsx` - Added storage event listener
3. ⚠️ `src/pages/landing/index.tsx` - Already has alert display

## Next Steps

1. Test all scenarios above
2. Consider adding API call to verify subscription status
3. Add automatic token refresh mechanism
4. Implement session timeout handling
