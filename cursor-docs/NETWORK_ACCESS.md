# 🌐 Home Network Access Guide

This guide will help you make your app accessible to all devices on your home network.

## 📱 Your Network Information

- **Your Computer's IP Address**: `192.168.1.92`
- **Frontend Port**: `3000`
- **Backend Port**: `8000`

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
```

The backend will now be accessible at:
- **Local**: http://localhost:8000
- **Network**: http://192.168.1.92:8000

### 2. Start the Frontend Server
```bash
cd frontend
npm start
```

The frontend will now be accessible at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.92:3000

## 📱 Access from Other Devices

Once both servers are running, you can access your app from any device on your home network using:

- **Frontend (Web App)**: http://192.168.1.92:3000
- **Backend API**: http://192.168.1.92:8000

## 🔧 What Changed

### Backend Changes
- Server now listens on `0.0.0.0` instead of just `localhost`
- CORS configured to allow local network connections
- Added automatic IP address detection and display

### Frontend Changes
- HTTP server now listens on `0.0.0.0` instead of just `localhost`
- Accessible from any device on the network

## 🛡️ Security Considerations

⚠️ **Important**: This configuration makes your app accessible to anyone on your local network. This is generally safe for home networks, but consider:

1. **Firewall**: Ensure your computer's firewall allows connections on ports 3000 and 8000
2. **Network Security**: Only use this on trusted home networks
3. **Production**: For production deployment, use proper security measures

## 🔍 Troubleshooting

### Can't Access from Other Devices?

1. **Check Firewall**: Make sure your computer's firewall allows connections on ports 3000 and 8000
2. **Check Network**: Ensure all devices are on the same WiFi network
3. **Check IP Address**: Your IP might change if you reconnect to WiFi. Run `node get-network-info.js` to get the current IP
4. **Check Servers**: Make sure both backend and frontend servers are running

### Port Already in Use?

If you get "port already in use" errors:
```bash
# Find what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process if needed
kill -9 <PID>
```

### macOS Firewall Settings

1. Go to **System Preferences** → **Security & Privacy** → **Firewall**
2. Click **Firewall Options**
3. Add your Node.js/terminal app to the allowed list
4. Or temporarily disable the firewall for testing

## 📋 Commands Summary

```bash
# Get network information
node get-network-info.js

# Start backend (from project root)
cd backend && npm start

# Start frontend (from project root)
cd frontend && npm start

# Access URLs
# Frontend: http://192.168.1.92:3000
# Backend: http://192.168.1.92:8000
```

## 🎯 Next Steps

Once you have network access working, you can:
1. Test the app from your phone/tablet
2. Share the app with family members on the same network
3. Consider setting up a local domain name for easier access
4. Set up automatic startup scripts for convenience 