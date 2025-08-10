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
    origin: [
      'http://localhost:3000',
      'http://192.168.1.92:3000'
    ] as string[],
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

  // 📘 FACEBOOK SETTINGS
  facebook: {
    appId: process.env.FACEBOOK_APP_ID!,
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/facebook-callback.html',
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
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
  'GOOGLE_CLIENT_SECRET',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}