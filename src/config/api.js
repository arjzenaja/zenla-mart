// API Configuration
// IMPORTANT: Change DEV_BASE_URL to your local machine's IP address
// To find your IP:
// - Windows: Run 'ipconfig' in Command Prompt, look for IPv4 Address
// - Mac/Linux: Run 'ifconfig' in Terminal, look for inet address

const DEV_BASE_URL = "http://192.168.100.12:5000/api"; // Your local IP address
const PROD_BASE_URL = "https://yourdomain.com/api"; // Change when deploying to production

// __DEV__ is automatically set by React Native
// true = development mode, false = production mode
export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

// API timeout in milliseconds
export const API_TIMEOUT = 10000; // 10 seconds

// Debug mode - set to false in production
export const DEBUG_API = __DEV__;
