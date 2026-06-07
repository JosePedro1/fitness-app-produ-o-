/**
 * exerciseDbController.js
 * Proxy para a ExerciseDB (oss.exercisedb.dev).
 * O frontend não pode chamar essa API diretamente por CORS — passa por aqui.
 *
 * URL CORRETA: ?name={name}&limit=1  (query param, NÃO /name/ como rota)
 * CACHE:       Map em memória evita chamadas repetidas e contorna rate limit.
 */

const EDB_BASE = 'https://oss.exercisedb.dev/api/v1/exercises';

/** Cache em memória: name → gifUrl (ou null se não encontrado) */
const gifCache = new Map();

/**
 * GET /exercise-db/gif?name=barbell+bench+press
 * Retorna { gifUrl } ou { gifUrl: null } se não encontrar.
 */
export const getExerciseGif = async (c) => {
  const name = c.req.query('name');

  if (!name) {
    return c.json({ error: 'Parâmetro "name" obrigatório.' }, 400);
  }

  // ── Retorna do cache se já foi buscado antes ─────────────────────────────
  if (gifCache.has(name)) {
    return c.json({ gifUrl: gifCache.get(name) }, 200);
  }

  try {
    // URL CORRETA para oss.exercisedb.dev: query param ?name=X
    // ERRADO: /name/X (rota que NÃO existe nessa versão da API)
    const url = `${EDB_BASE}?name=${encodeURIComponent(name)}&limit=1&offset=0`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      gifCache.set(name, null);
      return c.json({ gifUrl: null }, 200);
    }

    const data = await res.json();

    // oss.exercisedb.dev retorna { success, exercises: [...], total }
    // mas fallback para array direto por segurança
    const list = Array.isArray(data)
      ? data
      : (data.exercises ?? data.data ?? []);

    const gifUrl = list[0]?.gifUrl ?? null;

    // Armazena no cache (inclusive null, para não repetir busca inútil)
    gifCache.set(name, gifUrl);

    return c.json({ gifUrl }, 200);

  } catch (err) {
    console.error('[exerciseDbProxy] erro:', err.message);
    return c.json({ gifUrl: null }, 200); // falha silenciosa — não quebra o frontend
  }
};