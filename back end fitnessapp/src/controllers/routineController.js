import supabase from '../config/supabase.js';

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const WEEKDAYS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

/** Calcula volume total (séries × peso) de uma lista de exercícios */
function calcVolume(exercises = []) {
  return exercises.reduce((acc, e) => {
    const s = parseInt(e.sets || 0);
    const w = parseFloat(e.weight_kg || 0);
    return acc + s * w;
  }, 0);
}

// ──────────────────────────────────────────────────────────────────────────────
// PROGRAMA SEMANAL — CRUD
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /routines/program
 * Retorna o programa ativo do usuário com todos os 7 dias e exercícios.
 * Se não existir, cria automaticamente com 7 dias de descanso.
 */
export const getProgram = async (c) => {
  try {
    const user_id = c.get('user_id');

    // Busca programa ativo
    let { data: program, error } = await supabase
      .from('weekly_programs')
      .select('*')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    // Se não existe, cria
    if (error || !program) {
      const { data: newProg, error: createErr } = await supabase
        .from('weekly_programs')
        .insert({ user_id, name: 'Meu Programa', active: true })
        .select()
        .single();

      if (createErr) throw new Error(createErr.message);
      program = newProg;

      // Cria os 7 dias
      const daysToInsert = WEEKDAYS.map(wd => ({
        program_id: program.id,
        user_id,
        weekday: wd,
        workout_name: 'Descanso',
        is_rest_day: true,
        goal: null,
        observations: null,
        estimated_duration_min: 0,
      }));
      await supabase.from('week_days').insert(daysToInsert);
    }

    // Busca os 7 dias com exercícios
    const { data: days, error: daysErr } = await supabase
      .from('week_days')
      .select('*, week_day_exercises(*)')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .order('weekday');

    if (daysErr) throw new Error(daysErr.message);

    // Ordena dias na ordem correta da semana
    const orderedDays = WEEKDAYS.map(wd => {
      const day = days?.find(d => d.weekday === wd);
      if (!day) return null;
      return {
        ...day,
        week_day_exercises: (day.week_day_exercises || [])
          .sort((a, b) => a.sort_order - b.sort_order),
      };
    }).filter(Boolean);

    return c.json({ ...program, days: orderedDays });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * PATCH /routines/program
 * Atualiza o nome do programa.
 */
export const updateProgram = async (c) => {
  try {
    const user_id = c.get('user_id');
    const { name } = await c.req.json();

    const { data, error } = await supabase
      .from('weekly_programs')
      .update({ name })
      .eq('user_id', user_id)
      .eq('active', true)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// DIAS DA SEMANA
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /routines/day/:weekday
 * Retorna o dia específico da semana com seus exercícios.
 */
export const getDayByWeekday = async (c) => {
  try {
    const user_id = c.get('user_id');
    const weekday = c.req.param('weekday');

    if (!WEEKDAYS.includes(weekday)) {
      return c.json({ error: 'Dia inválido.' }, 400);
    }

    // Busca programa ativo
    const { data: program } = await supabase
      .from('weekly_programs')
      .select('id')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (!program) return c.json({ error: 'Nenhum programa ativo.' }, 404);

    const { data: day, error } = await supabase
      .from('week_days')
      .select('*, week_day_exercises(*)')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .eq('weekday', weekday)
      .single();

    if (error) throw new Error(error.message);

    return c.json({
      ...day,
      week_day_exercises: (day.week_day_exercises || [])
        .sort((a, b) => a.sort_order - b.sort_order),
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * PUT /routines/day/:weekday
 * Atualiza os dados de um dia (nome, objetivo, observações, descanso, duração)
 * e substitui todos os exercícios do dia.
 */
export const updateDay = async (c) => {
  try {
    const user_id = c.get('user_id');
    const weekday = c.req.param('weekday');

    if (!WEEKDAYS.includes(weekday)) {
      return c.json({ error: 'Dia inválido.' }, 400);
    }

    const {
      workout_name,
      goal,
      observations,
      estimated_duration_min,
      is_rest_day,
      exercises = [],
    } = await c.req.json();

    // Busca programa ativo
    const { data: program } = await supabase
      .from('weekly_programs')
      .select('id')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (!program) return c.json({ error: 'Nenhum programa ativo.' }, 404);

    // Busca o week_day
    const { data: existingDay, error: dayErr } = await supabase
      .from('week_days')
      .select('id')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .eq('weekday', weekday)
      .single();

    if (dayErr || !existingDay) return c.json({ error: 'Dia não encontrado.' }, 404);

    const day_id = existingDay.id;

    // Atualiza o dia
    const { data: updatedDay, error: updateErr } = await supabase
      .from('week_days')
      .update({
        workout_name: workout_name || 'Descanso',
        goal: goal || null,
        observations: observations || null,
        estimated_duration_min: estimated_duration_min || 0,
        is_rest_day: is_rest_day ?? (exercises.length === 0),
      })
      .eq('id', day_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    // Substitui todos os exercícios do dia
    await supabase
      .from('week_day_exercises')
      .delete()
      .eq('week_day_id', day_id)
      .eq('user_id', user_id);

    let insertedExercises = [];
    if (exercises.length > 0) {
      const toInsert = exercises.map((e, idx) => ({
        week_day_id:          day_id,
        user_id,
        library_exercise_id:  e.library_exercise_id || null,
        exercise_name:        e.exercise_name || e.name || '',
        muscle_group:         e.muscle_group || null,
        is_custom:            e.is_custom || false,
        custom_description:   e.custom_description || null,
        sets:                 e.sets ? parseInt(e.sets) : null,
        reps:                 e.reps || null,
        weight_kg:            e.weight_kg ? parseFloat(e.weight_kg) : null,
        rest_seconds:         e.rest_seconds ? parseInt(e.rest_seconds) : null,
        execution_time_sec:   e.execution_time_sec ? parseInt(e.execution_time_sec) : null,
        observations:         e.observations || null,
        rpe:                  e.rpe ? parseInt(e.rpe) : null,
        completed:            e.completed || false,
        sort_order:           idx,
      }));

      const { data: exData, error: exErr } = await supabase
        .from('week_day_exercises')
        .insert(toInsert)
        .select();

      if (exErr) throw new Error(exErr.message);
      insertedExercises = exData || [];
    }

    return c.json({
      ...updatedDay,
      week_day_exercises: insertedExercises,
      volume_total: calcVolume(insertedExercises),
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// EXERCÍCIOS DO DIA
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /routines/day/:weekday/exercise
 * Adiciona um exercício avulso ao dia.
 */
export const addExerciseToDay = async (c) => {
  try {
    const user_id = c.get('user_id');
    const weekday = c.req.param('weekday');
    const body    = await c.req.json();

    if (!WEEKDAYS.includes(weekday)) {
      return c.json({ error: 'Dia inválido.' }, 400);
    }

    const { data: program } = await supabase
      .from('weekly_programs')
      .select('id')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (!program) return c.json({ error: 'Nenhum programa ativo.' }, 404);

    const { data: day } = await supabase
      .from('week_days')
      .select('id')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .eq('weekday', weekday)
      .single();

    if (!day) return c.json({ error: 'Dia não encontrado.' }, 404);

    // Conta exercícios existentes para sort_order
    const { count } = await supabase
      .from('week_day_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('week_day_id', day.id);

    const { data, error } = await supabase
      .from('week_day_exercises')
      .insert({
        week_day_id:         day.id,
        user_id,
        library_exercise_id: body.library_exercise_id || null,
        exercise_name:       body.exercise_name || body.name || '',
        muscle_group:        body.muscle_group || null,
        is_custom:           body.is_custom || false,
        custom_description:  body.custom_description || null,
        sets:                body.sets ? parseInt(body.sets) : null,
        reps:                body.reps || null,
        weight_kg:           body.weight_kg ? parseFloat(body.weight_kg) : null,
        rest_seconds:        body.rest_seconds ? parseInt(body.rest_seconds) : null,
        execution_time_sec:  body.execution_time_sec ? parseInt(body.execution_time_sec) : null,
        observations:        body.observations || null,
        rpe:                 body.rpe ? parseInt(body.rpe) : null,
        completed:           false,
        sort_order:          count || 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return c.json(data, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * PATCH /routines/exercise/:id
 * Atualiza campos de um exercício (inclusive completed, weight, sets, etc.)
 */
export const updateExercise = async (c) => {
  try {
    const user_id = c.get('user_id');
    const id      = c.req.param('id');
    const body    = await c.req.json();

    const allowed = [
      'exercise_name', 'muscle_group', 'sets', 'reps', 'weight_kg',
      'rest_seconds', 'execution_time_sec', 'observations', 'rpe',
      'completed', 'sort_order',
    ];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'Nenhum campo válido para atualizar.' }, 400);
    }

    const { data, error } = await supabase
      .from('week_day_exercises')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * DELETE /routines/exercise/:id
 * Remove um exercício do dia.
 */
export const deleteExercise = async (c) => {
  try {
    const user_id = c.get('user_id');
    const id      = c.req.param('id');

    const { error } = await supabase
      .from('week_day_exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);
    return c.json({ message: 'Exercício removido.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// CONCLUIR TREINO DO DIA
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /routines/day/:weekday/complete
 * Marca o treino do dia como concluído e salva no calendário.
 * Body: { duration_sec, notes?, exercises_done? }
 */
export const completeDay = async (c) => {
  try {
    const user_id = c.get('user_id');
    const weekday = c.req.param('weekday');
    const { duration_sec = 0, notes = '', exercises_done = [] } = await c.req.json();

    const { data: program } = await supabase
      .from('weekly_programs')
      .select('id')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (!program) return c.json({ error: 'Nenhum programa ativo.' }, 404);

    const { data: day } = await supabase
      .from('week_days')
      .select('id, workout_name, week_day_exercises(*)')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .eq('weekday', weekday)
      .single();

    if (!day) return c.json({ error: 'Dia não encontrado.' }, 404);

    const volume = calcVolume(day.week_day_exercises || []);
    const date   = new Date().toISOString().split('T')[0];

    const { data: session, error: sessErr } = await supabase
      .from('workout_sessions')
      .insert({
        user_id,
        date,
        label:          day.workout_name,
        duration_sec,
        notes,
        week_day_id:    day.id,
        volume_total:   volume,
        exercises_done: exercises_done.length > 0 ? exercises_done : (day.week_day_exercises || []),
      })
      .select()
      .single();

    if (sessErr) throw new Error(sessErr.message);

    return c.json({ session, volume_total: volume }, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// EXERCÍCIOS CUSTOMIZADOS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /routines/custom-exercises
 * Lista exercícios customizados do usuário.
 */
export const getCustomExercises = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * POST /routines/custom-exercises
 * Cria um exercício customizado.
 */
export const createCustomExercise = async (c) => {
  try {
    const user_id = c.get('user_id');
    const { name, muscle_group, description, observations } = await c.req.json();

    if (!name?.trim()) return c.json({ error: 'Nome obrigatório.' }, 400);

    const { data, error } = await supabase
      .from('custom_exercises')
      .insert({ user_id, name: name.trim(), muscle_group, description, observations })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return c.json(data, 201);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

/**
 * DELETE /routines/custom-exercises/:id
 */
export const deleteCustomExercise = async (c) => {
  try {
    const user_id = c.get('user_id');
    const id      = c.req.param('id');

    const { error } = await supabase
      .from('custom_exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw new Error(error.message);
    return c.json({ message: 'Exercício customizado removido.' });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// RETROCOMPATIBILIDADE — mantém endpoints antigos funcionando
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /routines  (antigo)
 * Retorna lista de "rotinas" no formato antigo para não quebrar
 * NutritionPage e outros consumers que usam exercises[].
 */
export const getRoutines = async (c) => {
  try {
    const user_id = c.get('user_id');

    const { data: program } = await supabase
      .from('weekly_programs')
      .select('id')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (!program) return c.json([]);

    const { data: days } = await supabase
      .from('week_days')
      .select('*, week_day_exercises(*)')
      .eq('program_id', program.id)
      .eq('user_id', user_id)
      .eq('is_rest_day', false);

    const routines = (days || []).map(d => ({
      id:           d.id,
      name:         d.workout_name,
      week_days:    [d.weekday],
      reminder_time: null,
      exercises:    (d.week_day_exercises || []).map(e => ({
        id:       e.id,
        exercise: e.exercise_name,
        name:     e.exercise_name,
        sets:     e.sets,
        reps:     e.reps,
        weight:   e.weight_kg,
        rest:     e.rest_seconds,
        completed: e.completed,
      })),
    }));

    return c.json(routines);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
};