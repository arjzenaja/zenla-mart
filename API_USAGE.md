# API Service Usage Guide

## 📋 Quick Reference

### Import the API Service

```javascript
import { api, apiRequest } from "../services/api";
```

### Basic Usage Examples

#### 1. Login (POST with body, no auth required)
```javascript
import { api, saveAuthToken } from "../services/api";

const handleLogin = async () => {
  try {
    const data = await api.post("/auth/login", {
      email: email,
      password: password,
    }, false); // false = no auth required

    // Save token
    await saveAuthToken(data.token);
    
    // Navigate to home
    navigation.navigate("Home");
  } catch (error) {
    Alert.alert("Login Failed", error.message);
  }
};
```

#### 2. Get User Profile (GET with auth)
```javascript
const fetchProfile = async () => {
  try {
    const data = await api.get("/users/profile");
    setProfile(data);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

#### 3. Update Profile (PUT with auth)
```javascript
const updateProfile = async () => {
  try {
    const data = await api.put("/users/profile", {
      name: name,
      phone: phone,
      address: address,
    });
    
    Alert.alert("Success", "Profile updated!");
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

#### 4. Create Order (POST with auth)
```javascript
const createOrder = async () => {
  try {
    const data = await api.post("/orders", {
      items: cartItems,
      shippingAddress: address,
      paymentMethod: "COD",
    });
    
    // Clear cart
    await AsyncStorage.removeItem("cart");
    
    // Navigate to success
    navigation.navigate("OrderSuccess", { orderId: data.order.id });
  } catch (error) {
    Alert.alert("Order Failed", error.message);
  }
};
```

#### 5. Get Products (GET, no auth)
```javascript
const fetchProducts = async () => {
  try {
    const data = await api.get("/products", false); // false = no auth
    setProducts(data.products);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

#### 6. Delete Address (DELETE with auth)
```javascript
const deleteAddress = async (addressId) => {
  try {
    await api.delete(`/addresses/${addressId}`);
    Alert.alert("Success", "Address deleted!");
    fetchAddresses(); // Refresh list
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

## 🔧 Advanced Usage

### Using apiRequest Directly
```javascript
import { apiRequest } from "../services/api";

const customRequest = async () => {
  try {
    const data = await apiRequest(
      "/custom/endpoint",
      "PATCH",
      { field: "value" },
      true // requires auth
    );
  } catch (error) {
    console.error(error);
  }
};
```

### With Loading States
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.get("/data");
    setData(data);
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};
```

### With useEffect
```javascript
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await api.get("/products");
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  };
  
  loadData();
}, []);
```

## 🌐 Environment Configuration

### Development (Emulator/Device)
Edit `src/config/api.js`:
```javascript
const DEV_BASE_URL = "http://YOUR_LOCAL_IP:5000/api";
```

**Find your IP:**
- **Windows**: `ipconfig` → IPv4 Address
- **Mac/Linux**: `ifconfig` → inet address

### Production
Edit `src/config/api.js`:
```javascript
const PROD_BASE_URL = "https://yourdomain.com/api";
```

## ✅ Best Practices

1. **Always use try/catch** for error handling
2. **Show loading states** during API calls
3. **Use Alert.alert** for user feedback
4. **Don't hardcode URLs** - use the API service
5. **Check authentication** before protected routes
6. **Clear sensitive data** on logout

## 🚫 Don't Do This

❌ **Hardcoded fetch:**
```javascript
fetch("http://localhost:5000/api/products") // BAD!
```

✅ **Use API service:**
```javascript
api.get("/products") // GOOD!
```

❌ **Manual token handling:**
```javascript
const token = await AsyncStorage.getItem("token");
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
}) // BAD!
```

✅ **Automatic token:**
```javascript
api.get("/protected") // GOOD! Token added automatically
```

## 🐛 Debugging

The API service logs all requests in development mode:
```
🌐 API Request: { url: "...", method: "GET", body: null }
✅ API Response: { status: 200, data: {...} }
❌ API Error: { endpoint: "...", error: "..." }
```

Check your console for these logs when debugging.
