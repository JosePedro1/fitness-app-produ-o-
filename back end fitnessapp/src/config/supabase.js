import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL e SUPABASE_KEY devem estar definidos no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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