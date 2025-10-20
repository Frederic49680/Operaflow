import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Variables hardcodées pour le développement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}

