// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://moqmdhjobloazogqecti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcW1kaGpvYmxvYXpvZ3FlY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MzUyNjEsImV4cCI6MjA1MTQxMTI2MX0.QG07rhz4Vz66B8Yjfnbv471BpH2B4uIsj9LFG14GAF0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);