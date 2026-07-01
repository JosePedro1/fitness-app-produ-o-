/**
 * streak.js
 * Calcula quantos dias seguidos (até hoje) o usuário treinou, a partir do
 * histórico de sessões (`getCalendarSessions`). Usado no card de
 * compartilhamento do treino diário.
 */
export function calculateStreak(sessions = []) {
  const uniqueDates = [...new Set(sessions.map((s) => s.date))].sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) return 0;

  const oneDayMs = 24 * 60 * 60 * 1000;
  let streak = 0;
  let cursor = new Date(`${new Date().toISOString().split('T')[0]}T00:00:00`);

  for (const dateStr of uniqueDates) {
    const expected = cursor.toISOString().split('T')[0];
    if (dateStr === expected) {
      streak++;
      cursor = new Date(cursor.getTime() - oneDayMs);
    } else if (dateStr < expected) {
      break;
    }
  }
  return streak;
}
