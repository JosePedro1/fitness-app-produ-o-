/**
 * Catálogo de exercícios compartilhado entre RoutineForm,
 * FloatingWorkoutTimer e CalendarPage.
 *
 * "Pernas" dividido em Quadríceps / Posterior / Panturrilha
 * para cobrir os principais grupamentos de membros inferiores.
 */

export const CATALOG = {
  Peito:       ['Supino Reto','Supino Inclinado','Supino Declinado','Crucifixo','Crossover no Cabo','Flexão de Braços'],
  Costas:      ['Barra Fixa','Remada Curvada','Remada Unilateral','Puxada Frontal','Remada Cavalinho','Levantamento Terra'],
  Quadríceps:  ['Agachamento Livre','Leg Press','Cadeira Extensora','Avanço','Agachamento Hack','Agachamento Búlgaro'],
  Posterior:   ['Mesa Flexora','Stiff','Leg Curl em Pé','Good Morning','Levantamento Terra Romeno','Ponte de Glúteo'],
  Panturrilha: ['Panturrilha em Pé','Panturrilha Sentado','Panturrilha no Leg Press','Panturrilha Unilateral'],
  Ombros:      ['Desenvolvimento com Barra','Desenvolvimento Halteres','Elevação Lateral','Elevação Frontal','Remada Alta','Face Pull'],
  Bíceps:      ['Rosca Direta','Rosca Alternada','Rosca Martelo','Rosca Concentrada','Rosca Scott','Rosca no Cabo'],
  Tríceps:     ['Tríceps Testa','Tríceps Corda','Tríceps Francês','Mergulho no Banco','Tríceps Coice','Extensão de Tríceps no Cabo'],
  Abdômen:     ['Abdominal Crunch','Prancha','Elevação de Pernas','Russian Twist','Abdominal no Cabo','Mountain Climber'],
  Glúteos:     ['Hip Thrust','Agachamento Sumô','Stiff para Glúteos','Abdução no Cabo','Glúteo no Cabo','Avanço Reverso'],
};

/** Lista plana: [{ name, group }] */
export const ALL_EXERCISES = Object.entries(CATALOG).flatMap(([group, exercises]) =>
  exercises.map(name => ({ name, group }))
);

/** Filtra exercícios pelo query (case-insensitive). Sem query → retorna todos. */
export const filterExercises = (query = '') => {
  if (!query.trim()) return ALL_EXERCISES;
  const q = query.toLowerCase();
  return ALL_EXERCISES.filter(e => e.name.toLowerCase().includes(q));
};

/** Retorna o dia da semana atual no formato usado pelas rotinas. */
export const getTodayWeekday = () => {
  const map = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
  return map[new Date().getDay()];
};

export const WEEKDAY_LABELS_PT = {
  segunda: 'segunda-feira',
  terca:   'terça-feira',
  quarta:  'quarta-feira',
  quinta:  'quinta-feira',
  sexta:   'sexta-feira',
  sabado:  'sábado',
  domingo: 'domingo',
};