# API Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App Screens                       │
│  (ProfileScreen, CheckoutScreen, LoginScreen, etc.)         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Import services
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Service Layer                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  authService.js  │  │  userService.js  │                │
│  │  - login()       │  │  - getProfile()  │                │
│  │  - register()    │  │  - updateProfile()│               │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
│           └──────────┬──────────┘                           │
│                      │                                       │
│                      ▼                                       │
│           ┌──────────────────┐                              │
│           │   client.js      │  ← Axios HTTP Client         │
│           │  (Axios Config)  │                              │
│           └────────┬─────────┘                              │
└────────────────────┼──────────────────────────────────────┘
                     │
                     │ Imports config
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Configuration Layer                          │
│                                                              │
│  ┌────────────────────────────────────────────┐            │
│  │           config/api.js                     │            │
│  │                                             │            │
│  │  DEV_BASE_URL  = "http://192.168.100.12:5000/api"      │
│  │  PROD_BASE_URL = "https://yourdomain.com/api"          │
│  │                                             │            │
│  │  BASE_URL = __DEV__ ? DEV : PROD           │            │
│  │  API_TIMEOUT = 10000                       │            │
│  │  DEBUG_API = __DEV__                       │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server                             │
│              http://192.168.100.12:5000                     │
│                                                              │
│  Routes:                                                     │
│  - POST   /api/auth/login                                   │
│  - POST   /api/auth/register                                │
│  - GET    /api/users/me                                     │
│  - PUT    /api/users/me                                     │
│  - GET    /api/products                                     │
│  - POST   /api/orders                                       │
│  - GET    /api/cart                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### Example: User Login

```
1. User enters email/password in LoginScreen
   │
   ▼
2. LoginScreen calls: login(email, password)
   │
   ▼
3. authService.js → client.post('/auth/login', { email, password })
   │
   ▼
4. client.js (Axios)
   - Gets BASE_URL from config/api.js
   - Adds headers: { "Content-Type": "application/json" }
   - No token needed for login
   - Logs: "🌐 API Request: /auth/login"
   │
   ▼
5. HTTP POST → http://192.168.100.12:5000/api/auth/login
   │
   ▼
6. Backend validates credentials
   │
   ▼
7. Backend returns: { success: true, token: "...", user: {...} }
   │
   ▼
8. authService.js saves token to AsyncStorage
   │
   ▼
9. LoginScreen navigates to Home
```

### Example: Get User Profile (Authenticated)

```
1. ProfileScreen calls: getProfile()
   │
   ▼
2. userService.js → client.get('/users/me')
   │
   ▼
3. client.js (Axios)
   - Gets BASE_URL from config/api.js
   - Gets token from AsyncStorage
   - Adds headers: { 
       "Content-Type": "application/json",
       "Authorization": "Bearer <token>"
     }
   - Logs: "🌐 API Request: /users/me"
   - Logs: "🔑 Token found: YES"
   │
   ▼
4. HTTP GET → http://192.168.100.12:5000/api/users/me
   │
   ▼
5. Backend validates token
   │
   ▼
6. Backend returns: { user: { name: "...", email: "..." } }
   │
   ▼
7. ProfileScreen displays user data
```

## 🔐 Token Management

```
┌─────────────────────────────────────────────────────────────┐
│                      AsyncStorage                            │
│                                                              │
│  Key: "token"                                               │
│  Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."          │
│                                                              │
│  Saved by: authService.login()                              │
│  Used by: client.js interceptor (automatic)                 │
│  Removed by: authService.logout()                           │
└─────────────────────────────────────────────────────────────┘

Flow:
1. Login → Token saved to AsyncStorage
2. Every API request → client.js reads token
3. Token added to Authorization header automatically
4. Logout → Token removed from AsyncStorage
```

## 🌍 Environment Switching

```
┌─────────────────────────────────────────────────────────────┐
│                  Development Mode                            │
│                  (__DEV__ = true)                           │
│                                                              │
│  BASE_URL = "http://192.168.100.12:5000/api"               │
│  DEBUG_API = true                                           │
│                                                              │
│  Console logs:                                              │
│  🌐 API Request: /users/me                                  │
│  🔑 Token found: YES                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Production Mode                             │
│                  (__DEV__ = false)                          │
│                                                              │
│  BASE_URL = "https://yourdomain.com/api"                    │
│  DEBUG_API = false                                          │
│                                                              │
│  Console logs: (none - silent)                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 File Dependencies

```
Screens
  ├── Import → authService.js
  ├── Import → userService.js
  ├── Import → productService.js
  └── Import → orderService.js
                    │
                    └── All import → client.js
                                        │
                                        └── Imports → config/api.js
                                                         │
                                                         └── Exports:
                                                             - BASE_URL
                                                             - API_TIMEOUT
                                                             - DEBUG_API
```

## 🎯 Key Benefits

| Feature | Before | After |
|---------|--------|-------|
| **URL Management** | Scattered across files | Single config file |
| **IP Changes** | Update multiple files | Update one line |
| **Environment** | Manual switching | Automatic |
| **Token Handling** | Manual in each request | Automatic injection |
| **Debugging** | Always logging | Only in dev mode |
| **Timeout** | No timeout | 10s timeout |
| **Error Handling** | Inconsistent | Standardized |

## 🚀 Usage Summary

### For Existing Code (No Changes Needed)
```javascript
// Already works with new config
import { getProfile } from '../api/userService';
const user = await getProfile();
```

### For New Code
```javascript
// Option 1: Use existing services
import client from '../api/client';
const response = await client.get('/products');

// Option 2: Use new fetch service
import { api } from '../services/api';
const products = await api.get('/products');
```

### Configuration Changes
```javascript
// Only need to update this ONE file:
// src/config/api.js

const DEV_BASE_URL = "http://YOUR_IP:5000/api";
```

That's it! 🎉
