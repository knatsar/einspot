// Neon Database Integration (Optional Alternative to Supabase)
// This file provides database connection utilities for Neon.tech
// Currently commented out - switch when needed

/*
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Example usage:
// const result = await sql`SELECT * FROM products WHERE is_active = true`;
*/

// For now, continue using Supabase
export { supabase as db } from '@/integrations/supabase/client';