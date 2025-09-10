# 🔧 Debug Environment Setup

## 🐛 **"Failed to fetch" Error Troubleshooting**

The "Failed to fetch" error typically indicates one of these issues:

### 1. **Backend Server Not Running**

Make sure your FastAPI backend is running:

```bash
cd chatbot_backend
python main.py
```

The server should start on `http://localhost:8000` by default.

### 2. **Wrong API URL Configuration**

Check your environment configuration:

**File: `chatbot_user_dashboard/.env.local`** (create if doesn't exist)

```bash
# For local development
VITE_API_URL=http://localhost:8000

# For production
# VITE_API_URL=https://api.bayshorecommunication.org
```

### 3. **CORS Issues**

If you're running locally, make sure the backend allows your frontend domain.

### 4. **API Key Issues**

Make sure you have a valid API key configured in your dashboard settings.

## 🔍 **Debug Steps**

1. **Click "Debug API" button** in the leads page
2. **Open browser console** (F12 → Console)
3. **Check the debug output** for detailed error information

## 🧪 **Manual API Test**

You can also test the API manually:

```bash
# Test if backend is running
curl http://localhost:8000/health

# Test leads endpoint (replace YOUR_API_KEY)
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8000/lead/leads
```

## 🔧 **Common Solutions**

### **Solution 1: Local Development Setup**

```bash
# 1. Start backend
cd chatbot_backend
python main.py

# 2. Create .env.local in dashboard
echo "VITE_API_URL=http://localhost:8000" > .env.local

# 3. Restart frontend
npm run dev
```

### **Solution 2: Check Network Tab**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to refresh leads
4. Check if request is made and what error occurs

### **Solution 3: Check API Key**

1. Go to dashboard settings
2. Verify API key is configured
3. Try regenerating API key if needed

## 📋 **Environment Checklist**

- [ ] Backend server is running (`python main.py`)
- [ ] Frontend can access backend URL
- [ ] API key is configured correctly
- [ ] CORS is properly configured
- [ ] No firewall blocking requests
- [ ] Correct API endpoints configured

## 🚀 **Quick Fix Commands**

```bash
# Check if backend is accessible
curl http://localhost:8000/health

# Check environment variables
echo $VITE_API_URL

# Restart with correct environment
VITE_API_URL=http://localhost:8000 npm run dev
```

Use the **Debug API** button to get detailed diagnostic information!
