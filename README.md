# 🔐 Professional Login System

A professional login system with separated frontend and backend architecture. This demonstrates modern web development practices with independent frontend and backend services.

## 🏗️ Architecture

```
server-login/
├── frontend/                 # Frontend application (Port 3000)
│   ├── index.html           # Login interface
│   └── package.json         # Frontend dependencies
├── backend/                  # Backend API (Port 8000)
│   ├── src/
│   │   └── index.ts         # API server
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript config
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:8000`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Test the System

1. Open `http://localhost:3000` in your browser
2. You should see a connection status indicator
3. Register a new user
4. Login with the registered user

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run watch` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server (no caching)
- `npm start` - Start production server

## 🛠️ How It Works

### Backend API (Port 8000)
The backend provides these API endpoints:

- **POST /api/register** - Create a new user account
- **POST /api/login** - Authenticate existing user
- **GET /api/users** - List all users (for testing)
- **GET /api/health** - Health check

### Frontend (Port 3000)
A simple web interface with:
- Login form
- Registration form
- Connection status indicator
- Real-time feedback messages
- API calls to backend

### Security Features
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **CORS Configuration**: Backend only accepts requests from frontend domain
- **Input Validation**: Basic validation for email and password fields
- **Error Handling**: Proper error responses for various scenarios

## 🌐 Network Flow

```
Browser (localhost:3000) 
    ↓ HTTP Request
Frontend Server (localhost:3000)
    ↓ API Call
Backend API (localhost:8000)
    ↓ Response
Frontend Server (localhost:3000)
    ↓ Display
Browser (localhost:3000)
```

## 🧪 Testing the System

1. **Check Connection:**
   - Frontend will show connection status to backend
   - Green = Connected, Red = Disconnected

2. **Register a new user:**
   - Go to the "Register" tab
   - Enter an email and password
   - Click "Register"

3. **Login with the user:**
   - Go to the "Login" tab
   - Enter the same email and password
   - Click "Login"

4. **Test error cases:**
   - Try registering with the same email twice
   - Try logging in with wrong credentials
   - Try submitting empty forms

## 📚 Learning Points

### Professional Architecture
- **Separation of Concerns**: Frontend and backend are independent
- **API Design**: RESTful API endpoints with proper HTTP methods
- **CORS**: Cross-Origin Resource Sharing configuration
- **Port Management**: Different ports for different services

### TypeScript Concepts
- **Type Annotations**: Request/response types
- **Async/Await**: Handling asynchronous API calls
- **Error Handling**: Try-catch blocks for API errors
- **Module System**: Import/export statements

### Express.js Concepts
- **Middleware**: CORS, JSON parsing
- **Route Handlers**: API endpoint definitions
- **Request/Response**: HTTP request handling
- **Status Codes**: Proper HTTP status codes

### Frontend Concepts
- **Fetch API**: Making HTTP requests to backend
- **DOM Manipulation**: Updating UI based on API responses
- **Event Handling**: Form submissions and user interactions
- **Error Handling**: User-friendly error messages

## 🔄 Development Workflow

### Development Mode
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Make changes to either frontend or backend
4. Changes are automatically reflected

### Production Mode
1. Build backend: `cd backend && npm run build`
2. Start backend: `cd backend && npm start`
3. Serve frontend from a web server or CDN

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 8000 is already in use
- Make sure all dependencies are installed
- Check TypeScript compilation errors

**Frontend won't start:**
- Check if port 3000 is already in use
- Make sure http-server is installed

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check CORS configuration in backend
- Check browser console for errors

**API calls failing:**
- Verify API endpoints are correct
- Check network tab in browser dev tools
- Ensure backend is responding to health check

## 🔄 Next Steps

Once you understand this setup, you can enhance it with:

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **JWT Tokens**: Add session management and authentication
3. **React/Vue Frontend**: Replace vanilla HTML with a modern framework
4. **Environment Variables**: Use .env files for configuration
5. **Docker**: Containerize both frontend and backend
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Set up automated deployment pipelines

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

Happy coding! 🎉 