// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://krgksrxzdyppbrkiwycc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZ2tzcnh6ZHlwcGJya2l3eWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MzExNTAsImV4cCI6MjA1MzEwNzE1MH0.gFBVDgSsCitGop1YfmLK34u-kk5aUWauUkuaqfL3UPk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);