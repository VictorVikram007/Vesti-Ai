import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffgwjjwhibgaxnfeqrcg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ3dqandoaWJnYXhuZmVxcmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Mzg4OTQsImV4cCI6MjA3MjAxNDg5NH0.iM7dFHc2tgWAOaPb-ILrz4pTzTeJSYqy_hTDbCNNj_I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)