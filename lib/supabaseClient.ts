import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gtcgdrjjirxwyenhkmxr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2dkcmpqaXJ4d3llbmhrbXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTY1NzgsImV4cCI6MjA3NjA5MjU3OH0.0ZsSpLAKAPUHf4R49ZRArI1RpB6hU0eUN8T0nQ3TmD4"

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
