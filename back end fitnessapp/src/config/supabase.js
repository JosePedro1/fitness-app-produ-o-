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
  : null;

if (!serviceRoleKey) {
  console.error('[supabase] SUPABASE_SERVICE_ROLE_KEY não definida — cadastro e reset de senha vão falhar.');
  process.exit(1); // obrigatória: sem ela o cadastro nunca vai funcionar
}

// Valida conexão na inicialização usando supabaseAdmin (bypassa RLS)
(async () => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .limit(1);

    if (error) {
      console.error('Falha na conexão com o Supabase:', error.message);
      process.exit(1);
    }
    console.log('Conexão com o Supabase estabelecida com sucesso.');
  } catch (err) {
    console.error('Erro inesperado ao testar conexão Supabase:', err.message);
    process.exit(1);
  }
})();

export default supabase;
