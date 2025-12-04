import { createClient } from '@supabase/supabase-js';

// Configuração do Projeto Supabase
const projectRef = 'roxhcngagaalzitetrle';
const supabaseUrl = `https://${projectRef}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveGhjbmdhZ2FhbHppdGV0cmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjA0MzcsImV4cCI6MjA4MDQzNjQzN30.aK9XLGUZu89y7DQ1qYmY2ZKlCCDOSgM27_e9IzzQ1VU';

// Verificação de configuração
export const isConfigured = 
  (supabaseUrl as string) !== 'https://your-project-id.supabase.co' && 
  (supabaseKey as string) !== 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey);