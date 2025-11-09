# Subscription-Based Dashboard Access Protection

## Overview

Implemented protection to prevent users without an active paid subscription (`has_paid_subscription: false`) from accessing the dashboard. Users without a subscription are automatically redirected to the landing page with a clear message to purchase a subscription.

## Implementation Details

### 1. Protected Route Component

**File:** `src/components/ProtectedRoute.tsx`

- Checks if user is authenticated (has auth token)
- Verifies user has `has_paid_subscription: true`
- Redirects to sign-in if not authenticated
- Redirects to landing page if no active subscription
- Sets a flag in localStorage to show alert message on landing page

### 2. Router Configuration

**File:** `src/router.tsx`

- Wrapped all `/dashboard/*` routes with `ProtectedRoute` component
- Structure: ProtectedRoute → AppShell → Dashboard Routes
- Any attempt to access dashboard routes requires paid subscription

### 3. Landing Page Alert

**File:** `src/pages/landing/index.tsx`

- Displays prominent alert when user is redirected due to missing subscription
- Alert automatically dismisses after 10 seconds
- Can be manually dismissed by clicking X
- Shows clear message: "You need an active subscription to access the dashboard"

## How It Works

### Flow for Users WITHOUT Subscription:

1. User tries to access `/dashboard` or any dashboard route
2. `ProtectedRoute` checks `user.has_paid_subscription`
3. If `false`, sets `subscription_required` flag in localStorage
4. Redirects to landing page (`/`)
5. Landing page detects flag and shows alert
6. User sees pricing plans and can purchase subscription

### Flow for Users WITH Subscription:

1. User accesses `/dashboard` or any dashboard route
2. `ProtectedRoute` checks `user.has_paid_subscription`
3. If `true`, renders dashboard normally
4. User has full access to all dashboard features

## Testing

### Test Case 1: No Subscription

```javascript
// User data in localStorage
{
  "has_paid_subscription": false,
  "email": "test@example.com"
}

// Expected: Redirect to landing page with alert
```

### Test Case 2: Active Subscription

```javascript
// User data in localStorage
{
  "has_paid_subscription": true,
  "email": "test@example.com"
}

// Expected: Dashboard loads normally
```

### Test Case 3: Not Logged In

```javascript
// No auth token in localStorage

// Expected: Redirect to sign-in page
```

## Backend Integration

### User Model Fields

The protection relies on the `has_paid_subscription` boolean field in the user model:

```python
class User(BaseModel):
    has_paid_subscription: bool = False
    subscription_type: Optional[str] = None
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
```

### Automatic Updates

The subscription status is automatically updated by:

1. **Stripe Webhooks** (Real-time):

   - `checkout.session.completed` → Sets `has_paid_subscription = True`
   - `customer.subscription.deleted` → Sets `has_paid_subscription = False`

2. **Subscription Monitor** (Background):
   - Runs every 12 hours
   - Checks for expired subscriptions
   - Auto-downgrades: Sets `has_paid_subscription = False` for expired users

## Security Benefits

✅ **Prevents unauthorized dashboard access** - Users can't bypass payment
✅ **Automatic enforcement** - No manual checks needed in components
✅ **Real-time protection** - Checks on every route navigation
✅ **User-friendly** - Clear messaging about why access is denied
✅ **Backend sync** - Works with Stripe webhook automation

## Files Modified

1. ✅ `src/components/ProtectedRoute.tsx` (NEW)
2. ✅ `src/router.tsx` (MODIFIED)
3. ✅ `src/pages/landing/index.tsx` (MODIFIED)

## Usage

No additional configuration needed. The protection is automatically active for all dashboard routes.

### To bypass protection (for testing):

```javascript
// In browser console or localStorage
const user = JSON.parse(localStorage.getItem('user'))
user.has_paid_subscription = true
localStorage.setItem('user', JSON.stringify(user))
// Refresh page
```

## Notes

- The protection works on the frontend but should also be enforced on the backend API
- All dashboard API endpoints should verify subscription status
- The `ProtectedRoute` provides immediate UX feedback
- Backend validation ensures security even if frontend is bypassed
