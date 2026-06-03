/**
 * scheduler.js
 * Centraliza todos os cron jobs do backend.
 * Extraído de taskNotifier.js para separar responsabilidades.
 */
import cron    from 'node-cron';
import supabase from '../config/supabase.js';
import { sendEmail } from './emailService.js';

const DAYS_PT = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

// ── Notificações de tarefas ───────────────────────────────────────────────────
const checkTasksDeadlines = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, end_date, user_id')
      .eq('status', 'pendente');

    if (!tasks?.length) return;

    for (const { end_date, title, user_id } of tasks) {
      if (!user_id) continue;

      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', user_id)
        .single();

      if (!user?.email) continue;

      if (end_date === today) {
        await sendEmail(
          user.email,
          'Último dia para concluir sua tarefa',
          `Hoje é o último dia para concluir: "${title}". Não se esqueça!`
        );
      } else if (new Date(end_date) < new Date(today)) {
        await sendEmail(
          user.email,
          'Tarefa em atraso',
          `A tarefa "${title}" está em atraso. Verifique-a no app.`
        );
      }
    }
  } catch (err) {
    console.error('checkTasksDeadlines error:', err.message);
  }
};

// ── Reset de exercícios concluídos (rotina antiga) ───────────────────────────
const resetDailyExercises = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, last_reset')
      .eq('completed', true);

    if (!exercises?.length) return;

    const toReset = exercises.filter(e => e.last_reset !== today).map(e => e.id);
    if (!toReset.length) return;

    await supabase
      .from('exercises')
      .update({ completed: false, last_reset: today })
      .in('id', toReset);

    console.log(`${toReset.length} exercício(s) reiniciados.`);
  } catch (err) {
    console.error('resetDailyExercises error:', err.message);
  }
};

// ── Lembretes de treino ───────────────────────────────────────────────────────
const checkTrainingReminders = async () => {
  try {
    const now         = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const todayDay    = DAYS_PT[now.getDay()];

    const { data: routines } = await supabase
      .from('routines')
      .select('id, name, user_id, week_days, reminder_time')
      .not('reminder_time', 'is', null);

    if (!routines?.length) return;

    for (const routine of routines) {
      if (routine.reminder_time?.slice(0, 5) !== currentTime) continue;
      if (!routine.week_days?.includes(todayDay)) continue;

      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('user_id', routine.user_id)
        .single();

      if (!user?.email) continue;

      await sendEmail(
        user.email,
        `💪 Hora do treino — ${routine.name}`,
        `Olá! Lembrete de treino:\n\nRotina: ${routine.name}\n\nAcesse: https://fitness-app-produ-o.vercel.app/routines`
      );
    }
  } catch (err) {
    console.error('checkTrainingReminders error:', err.message);
  }
};

// ── Inicia os agendamentos ────────────────────────────────────────────────────
export const startSchedulers = () => {
  // Meia-noite: reset + notificações de prazo
  cron.schedule('0 0 * * *', () => {
    resetDailyExercises();
    checkTasksDeadlines();
  });

  // A cada minuto: lembretes de treino
  // cron.schedule('* * * * *', () => {
  //   checkTrainingReminders();
  // });

  console.log('Schedulers iniciados.');
};

// Exporta para uso manual (ex: chamada inicial no startup)
export { checkTasksDeadlines };