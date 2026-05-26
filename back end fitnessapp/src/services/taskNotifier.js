import cron from 'node-cron';
import supabase from '../config/supabase.js';
import { sendEmail } from './emailService.js';

const DAYS_PT = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export const checkTasksDeadlines = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks } = await supabase
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

      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', user_id)
        .single();

      if (!user) continue;

      if (end_date === today) {
        await sendEmail(user.email, 'Aviso Último dia para concluir sua tarefa',
          `Olá hoje é o último dia para concluir a tarefa ${title}. Não se esqueça de finalizá-la`);
      }

      if (new Date(end_date) < new Date(today)) {
        await sendEmail(user.email, 'Aviso Tarefa Pendente',
          `Você tem tarefas pendentes que não foram concluídas. Por favor verifique a tarefa ${title}.`);
      }
    }
  } catch (error) {
    console.error('Erro na verificação de tarefas', error);
  }
};

// Reinicia exercícios todo dia à meia-noite
const resetDailyExercises = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, last_reset')
      .eq('completed', true);

    if (!exercises || exercises.length === 0) return;

    const toReset = exercises.filter(e => e.last_reset !== today);

    if (toReset.length === 0) return;

    await supabase
      .from('exercises')
      .update({ completed: false, last_reset: today })
      .in('id', toReset.map(e => e.id));

    console.log(`${toReset.length} exercícios reiniciados para o novo dia.`);
  } catch (error) {
    console.error('Erro ao reiniciar exercícios:', error);
  }
};

// Lembrete de treino — roda todo minuto e verifica horário
const checkTrainingReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayDay = DAYS_PT[now.getDay()];

    const { data: routines } = await supabase
      .from('routines')
      .select('id, name, user_id, week_days, reminder_time')
      .not('reminder_time', 'is', null);

    if (!routines || routines.length === 0) return;

    for (const routine of routines) {
      const reminderHHMM = routine.reminder_time?.slice(0, 5);
      if (reminderHHMM !== currentTime) continue;
      if (!routine.week_days?.includes(todayDay)) continue;

      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', routine.user_id)
        .single();

      if (!user) continue;

      await sendEmail(
        user.email,
        `💪 Hora do treino — ${routine.name}`,
        `Olá!\n\nEste é o seu lembrete de treino de hoje.\n\nRotina: ${routine.name}\n\nAbra o app e marque seus exercícios!\n\nhttps://fitness-app-produ-o.vercel.app/routines\n\nEquipe Fitness App`
      );

      console.log(`Lembrete de treino enviado para user ${routine.user_id}`);
    }
  } catch (error) {
    console.error('Erro ao verificar lembretes de treino:', error);
  }
};

// Agendamentos
cron.schedule('0 0 * * *', () => {
  console.log('Reiniciando exercícios do dia');
  resetDailyExercises();
  checkTasksDeadlines();
});

cron.schedule('* * * * *', () => {
  checkTrainingReminders();
});