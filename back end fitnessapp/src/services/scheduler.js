/**
 * scheduler.js
 *
 * MUDANÇAS:
 *   - checkTasksDeadlines() REMOVIDA — módulo de tarefas foi descontinuado.
 *     A tabela tasks não é mais exposta ao usuário, não faz sentido enviar
 *     notificações sobre ela.
 *   - checkTrainingReminders() HABILITADA — estava comentada desde sempre.
 *     Agora roda a cada minuto e envia lembretes de treino configurados pelo usuário.
 *   - resetDailyExercises() REMOVIDA — acessava colunas que não existem no
 *     esquema atual (exercises.last_reset).
 */

import cron     from 'node-cron';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { sendEmail } from './emailService.js';

const DAYS_PT = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

// ── Lembretes de treino ───────────────────────────────────────────────────────
const checkTrainingReminders = async () => {
  try {
    const now         = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
        `Olá!\n\nLembrete de treino:\n\nRotina: ${routine.name}\n\nAcesse: ${
          process.env.FRONTEND_URL || 'https://fitness-app-produ-o.vercel.app'
        }/routines`
      );
    }
  } catch (err) {
    console.error('[scheduler] checkTrainingReminders error:', err.message);
  }
};

// ── Inicia os agendamentos ────────────────────────────────────────────────────
export const startSchedulers = () => {
  // A cada minuto: lembretes de treino
  cron.schedule('* * * * *', () => {
    checkTrainingReminders();
  });

  console.log('[scheduler] Schedulers iniciados.');
};