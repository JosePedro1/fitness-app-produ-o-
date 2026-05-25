import cron from 'node-cron';
import supabase from '../config/supabase.js';
import { sendEmail } from '../services/emailService.js';

export const checkTasksDeadlines = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, end_date, user_id')
      .eq('status', 'pendente');

    if (!tasks || tasks.length === 0) {
      console.log('Nenhuma tarefa pendente encontrada');
      return;
    }

    for (const task of tasks) {
      const { end_date, title, user_id } = task;

      if (!user_id) continue;

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', user_id)
        .single();

      if (!user) {
        console.warn(`Usuário não encontrado para user_id ${user_id}`);
        continue;
      }

      const userEmail = user.email;

      if (end_date === today) {
        await sendEmail(
          userEmail,
          'Aviso Último dia para concluir sua tarefa',
          `Olá hoje é o último dia para concluir a tarefa ${title} Não se esqueça de finalizá-la`
        );
        console.log(`E-mail enviado para ${userEmail} - Último dia da tarefa: ${title}`);
      }

      if (new Date(end_date) < new Date(today)) {
        await sendEmail(
          userEmail,
          'Aviso Tarefa Pendente',
          `Você tem tarefas pendentes que não foram concluídas. Por favor verifique a tarefa ${title}.`
        );
        console.log(`E-mail enviado para ${userEmail} - Tarefa pendente ${title}`);
      }
    }
  } catch (error) {
    console.error('Erro na verificação de tarefas', error);
  }
};

// cron.schedule('*/1 * * * *', () => {
//   console.log('Verificando prazos de tarefas');
//   checkTasksDeadlines();
// });
