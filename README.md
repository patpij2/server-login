# 🔐 Professional Login System

A comprehensive login system with separated frontend and backend architecture, featuring Gmail integration, Facebook integration, memory management, and an organized dashboard interface. This demonstrates modern web development practices with independent frontend and backend services and full social media management capabilities.

## 🏗️ Architecture

```
server-login/
├── frontend/                 # Frontend application (Port 3000)
│   ├── index.html           # Login interface
│   ├── dashboard.html       # Organized dashboard with collapsible sections
│   ├── gmail-callback.html  # Gmail OAuth callback
│   ├── facebook-callback.html # Facebook OAuth callback
│   └── package.json         # Frontend dependencies
├── backend/                  # Backend API (Port 8000)
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # Type definitions
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # API server
│   ├── scripts/             # Database setup & Facebook debug scripts
│   ├── supabase_migrations/ # Database migrations
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript config
├── GMAIL_INTEGRATION_GUIDE.md # Complete Gmail setup guide
├── FACEBOOK_INTEGRATION_GUIDE.md # Complete Facebook setup guide
├── cursor-docs/             # Documentation and guides
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Supabase account (for database)

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
5. Access the organized dashboard with Gmail and Facebook integration

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

#### Authentication
- **POST /api/auth/register** - Create a new user account
- **POST /api/auth/login** - Authenticate existing user
- **GET /api/auth/dashboard** - Get user dashboard data

#### User Management
- **GET /api/users** - List all users (for testing)
- **GET /api/users/:id** - Get specific user

#### Memory Management
- **POST /api/memories/add** - Add a new memory
- **POST /api/memories/search** - Search memories
- **GET /api/memories** - Get user's memories

#### Gmail Integration
- **GET /api/gmail/auth/url** - Get OAuth2 authorization URL
- **GET /api/gmail/callback** - Handle OAuth2 callback
- **POST /api/gmail/drafts/create** - Create Gmail draft
- **GET /api/gmail/check** - Check Gmail connection status
- **DELETE /api/gmail/disconnect** - Disconnect Gmail account

#### Facebook Integration
- **GET /api/facebook/auth/url** - Get Facebook OAuth2 authorization URL
- **GET /api/facebook/auth/callback** - Handle Facebook OAuth2 callback
- **GET /api/facebook/status** - Check Facebook connection status
- **GET /api/facebook/pages** - List connected Facebook pages
- **POST /api/facebook/post** - Create post on Facebook page
- **DELETE /api/facebook/pages/:id** - Remove Facebook page connection
- **DELETE /api/facebook/disconnect** - Remove all Facebook connections

#### System
- **GET /api/health** - Health check

### Frontend (Port 3000)
A modern web interface with organized dashboard featuring:
- **Login and registration forms** with validation
- **Collapsible dashboard sections** that start collapsed:
  - 🧠 Memory & Knowledge Management
  - 📊 Data Scraping & Collection  
  - 🔗 Third-Party Integrations
  - 📱 Social Media Management
- **Gmail integration** for creating drafts
- **Facebook integration** for social media posting
- **Memory management system** for note-taking
- **Real-time feedback messages** and status indicators
- **Responsive design** with smooth animations and color-coded sections

### Security Features
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Backend only accepts requests from frontend domain
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Proper error responses for various scenarios
- **Row Level Security**: Database-level security with Supabase RLS

## 🌐 Network Flow

```
Browser (localhost:3000) 
    ↓ HTTP Request
Frontend Server (localhost:3000)
    ↓ API Call
Backend API (localhost:8000)
    ↓ Database Query
Supabase Database
    ↓ Response
Backend API (localhost:8000)
    ↓ API Response
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

4. **Test Dashboard Features:**
   - **Memory & Knowledge Management**: Add and search memories
   - **Gmail Integration**: Connect Gmail and create drafts
   - **Facebook Integration**: Connect Facebook pages and create posts
   - **Collapsible Sections**: Toggle sections open/closed
   - **User Profile**: View user information

5. **Test error cases:**
   - Try registering with the same email twice
   - Try logging in with wrong credentials
   - Try submitting empty forms

## 📚 Learning Points

### Professional Architecture
- **Separation of Concerns**: Frontend and backend are independent
- **API Design**: RESTful API endpoints with proper HTTP methods
- **CORS**: Cross-Origin Resource Sharing configuration
- **Port Management**: Different ports for different services
- **Database Integration**: Supabase with Row Level Security

### TypeScript Concepts
- **Type Annotations**: Request/response types
- **Async/Await**: Handling asynchronous API calls
- **Error Handling**: Try-catch blocks for API errors
- **Module System**: Import/export statements

### Express.js Concepts
- **Middleware**: CORS, JSON parsing, authentication
- **Route Handlers**: API endpoint definitions
- **Request/Response**: HTTP request handling
- **Status Codes**: Proper HTTP status codes

### Frontend Concepts
- **Fetch API**: Making HTTP requests to backend
- **DOM Manipulation**: Updating UI based on API responses
- **Event Handling**: Form submissions and user interactions
- **Error Handling**: User-friendly error messages

### Third-Party Integrations
- **Gmail OAuth2 Flow**: Secure authentication with Google
- **Gmail API Integration**: Draft creation and management
- **Facebook OAuth2 Flow**: Secure authentication with Meta
- **Facebook Graph API**: Page management and posting
- **Token Management**: Secure storage and refresh of access tokens
- **Database Storage**: Page access tokens stored securely in Supabase

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
- Verify environment variables are set

**Frontend won't start:**
- Check if port 3000 is already in use
- Make sure http-server is installed

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check CORS configuration in backend
- Check browser console for errors

**Gmail integration issues:**
- See [GMAIL_INTEGRATION_GUIDE.md](GMAIL_INTEGRATION_GUIDE.md) for detailed setup and troubleshooting

**Facebook integration issues:**
- See [FACEBOOK_INTEGRATION_GUIDE.md](FACEBOOK_INTEGRATION_GUIDE.md) for detailed setup and troubleshooting
- Facebook pages not loading: Check app permissions and Meta app review status
- Posting fails: Verify `pages_manage_posts` permission is granted and app is reviewed

**Database connection issues:**
- Verify Supabase credentials in environment variables
- Check if database tables are created
- Run database setup scripts if needed

## 🔄 Next Steps

Once you understand this setup, you can enhance it with:

1. **Additional Social Media**: Instagram, LinkedIn, Twitter/X APIs
2. **Advanced Facebook Features**: Scheduled posting, analytics, media uploads
3. **React/Vue Frontend**: Replace vanilla HTML with a modern framework
4. **Docker**: Containerize both frontend and backend
5. **Testing**: Add unit and integration tests
6. **CI/CD**: Set up automated deployment pipelines
7. **Monitoring**: Add logging and monitoring tools
8. **Caching**: Implement Redis for performance
9. **File Upload**: Add file upload capabilities for media posts
10. **Analytics Dashboard**: Track posting performance and engagement

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Supabase Documentation](https://supabase.com/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [GMAIL_INTEGRATION_GUIDE.md](GMAIL_INTEGRATION_GUIDE.md) - Complete Gmail setup guide
- [FACEBOOK_INTEGRATION_GUIDE.md](FACEBOOK_INTEGRATION_GUIDE.md) - Complete Facebook setup guide

---

Happy coding! 🎉 