import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL e SUPABASE_KEY devem estar definidos no .env');
  process.exit(1);
}

// Cliente anon — usado para auth.signUp e auth.signInWithPassword
const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente admin — bypassa RLS, necessário para INSERT/UPDATE na tabela users
// Requer SUPABASE_SERVICE_ROLE_KEY no Render (Supabase → Project Settings → API → service_role)
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase; // fallback — remove quando adicionar a variável no Render

if (!serviceRoleKey) {
  console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY não definida — INSERT na tabela users pode falhar (RLS).');
}

// Valida conexão na inicialização
(async () => {
  const { error } = await supabase.from('users').select('user_id').limit(1);
  if (error) {
    console.error('Falha na conexão com o Supabase:', error.message);
    process.exit(1);
  }
  console.log('Conexão com o Supabase estabelecida com sucesso.');
})();

export default supabase;
