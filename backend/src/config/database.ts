/**
 * 🗄️ CONFIG/DATABASE - The "Kitchen Connection" file
 * 
 * This file sets up our connection to Supabase (our database).
 * Think of it like connecting your restaurant to the kitchen.
 * 
 * We create two different connections:
 * 1. Service Role Key - Full access (like a chef with all keys)
 * 2. Anon Key - Limited access (like a customer who can only order)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from './environment';

/**
 * 🔑 SUPABASE CLIENTS
 * 
 * We create two different Supabase clients for different purposes:
 */

/**
 * supabase - Full access client (for backend operations)
 * 
 * This client has full access to the database - it can:
 * - Create, read, update, delete any data
 * - Bypass security rules
 * - Access all tables
 * 
 * ⚠️  WARNING: This should ONLY be used in the backend!
 * Never expose the service role key to the frontend!
 * 
 * Use this for:
 * - User registration
 * - User login
 * - Admin operations
 * - Any operation that needs full database access
 */
export const supabase = createClient(
  config.supabase.url,        // Database address
  config.supabase.serviceRoleKey  // Secret key with full access
);

/**
 * supabasePublic - Limited access client (for frontend if needed)
 * 
 * This client has limited access - it can only:
 * - Access data that's allowed by security rules
 * - Perform operations that are publicly allowed
 * 
 * ✅ SAFE: This key can be exposed to the frontend
 * 
 * Use this for:
 * - Public data queries
 * - Operations that should respect security rules
 * - Frontend database access (if needed)
 */
export const supabasePublic = createClient(
  config.supabase.url,        // Database address
  config.supabase.anonKey     // Public key with limited access
);

/**
 * 💡 HOW THIS WORKS:
 * 
 * 1. When someone registers: supabase client creates the user
 * 2. When someone logs in: supabase client checks their password
 * 3. When someone views data: supabasePublic client respects security rules
 * 
 * 🔒 SECURITY:
 * - Service role key = Master key (keep secret!)
 * - Anon key = Public key (safe to share)
 * - Never mix them up!
 * 
 * 🏗️  ARCHITECTURE:
 * Frontend → Backend API → supabase (service role) → Database
 * Frontend → supabasePublic (anon key) → Database (if needed)
 */ 