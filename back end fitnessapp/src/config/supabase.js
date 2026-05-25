import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshTokenIfNeeded() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('Erro ao obter usuário', userError.message);
    return;
  }

  if (!user) {
    console.log('Nenhum usuário autenticado');
    return;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Erro ao obter sessão', sessionError.message);
    return;
  }

  const { session } = sessionData;

  if (session) {
    const { expires_at } = session;

    if (Date.now() / 1000 >= expires_at) {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Erro ao renovar o token', error.message);
      } else {
        console.log('Token renovado com sucesso', data);
      }
    }
  }
}

(async () => {
  console.log('Testando conexão com o banco de dados');

  const { data, error } = await supabase.from('tasks').select('*').limit(1);

  if (error) {
    console.error('Erro ao conectar ao banco de dados', error.message);
    process.exit(1);
  } else {
    console.log('Conexão com o banco de dados estabelecida com sucesso');
  }

  setInterval(refreshTokenIfNeeded, 1000 * 60 * 10); 
})();

export default supabase;
