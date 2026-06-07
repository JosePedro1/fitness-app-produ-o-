/**
 * exerciseDbController.js
 * Proxy para a ExerciseDB (oss.exercisedb.dev).
 * O frontend não pode chamar essa API diretamente por CORS — passa por aqui.
 */

const EDB_BASE = 'https://oss.exercisedb.dev/api/v1/exercises';

/**
 * GET /exercise-db/gif?name=barbell+bench+press
 * Retorna { gifUrl } ou { gifUrl: null } se não encontrar.
 */
export const getExerciseGif = async (c) => {
  const name = c.req.query('name');

  if (!name) {
    return c.json({ error: 'Parâmetro "name" obrigatório.' }, 400);
  }

  try {
    const url = `${EDB_BASE}?name=${encodeURIComponent(name)}&limit=1`;
    const res  = await fetch(url);

    if (!res.ok) {
      return c.json({ gifUrl: null }, 200);
    }

    const data = await res.json();
    const list = Array.isArray(data)
      ? data
      : (data.exercises ?? data.data ?? []);

    const gifUrl = list[0]?.gifUrl ?? null;
    return c.json({ gifUrl }, 200);

  } catch (err) {
    console.error('[exerciseDbProxy] erro:', err.message);
    return c.json({ gifUrl: null }, 200); // falha silenciosa — não quebra o frontend
  }
};