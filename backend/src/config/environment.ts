export const config = {
  // 🖥️ SERVER SETTINGS
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 🗄️ SUPABASE SETTINGS
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // 🌐 CORS SETTINGS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  // 🔐 SECURITY SETTINGS
  bcrypt: {
    saltRounds: 10,
  },

  // 🔐 JWT SETTINGS
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '24h', // Token expires in 24 hours
  },

  // 🧠 SUPERMEMORY SETTINGS (Add this new section)
  supermemory: {
    apiKey: process.env.SUPERMEMORY_API_KEY!,
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
  },

  // 📧 GMAIL SETTINGS
  gmail: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/gmail-callback.html',
  },

} as const;


// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'SUPERMEMORY_API_KEY',
  'OPENROUTER_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}