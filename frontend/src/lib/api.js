// API base URL — empty means it will use the current frontend origin (https://192.168.254.102:5173).
// Vite proxy will then forward these requests to the backend at http://localhost:8080.
// This prevents Mixed Content (HTTPS -> HTTP) browser errors.
export const API_BASE = ''

// For SockJS, we use the standard http/https protocol — SockJS handles the WebSocket upgrade internally.
export const WS_BASE = `${window.location.protocol}//${window.location.host}/ws`
