// API base URL — empty means it will use the current frontend origin (https://192.168.254.102:5173).
// Vite proxy will then forward these requests to the backend at http://localhost:8080.
// This prevents Mixed Content (HTTPS -> HTTP) browser errors.
export const API_BASE = ''

// For WebSockets, we need the exact protocol. Since we use basicSsl, it runs on WSS (WebSocket Secure).
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const WS_HOST = window.location.host
export const WS_BASE = `${WS_PROTOCOL}//${WS_HOST}/ws`
