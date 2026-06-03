/**
 * IMC Treino Engine v2
 *
 * Gera rotina personalizada considerando:
 *  - Sexo (masculino / feminino) → distribuição muscular diferente
 *  - Idade → volume e intensidade adaptados
 *  - Peso + Altura → IMC e classificação
 *  - Objetivo: emagrecimento | hipertrofia | recondicionamento | saude | forca
 *  - Histórico de rotinas (fases iniciante → intermediário → avançado)
 *
 * ROTAÇÃO A/B/C por dia (cicla conforme qtd de treinos já criados):
 *   MASCULINO:
 *     A → Peito + Tríceps + Ombros
 *     B → Costas + Bíceps + Trapézio
 *     C → Pernas + Glúteos + Abdômen
 *
 *   FEMININO:
 *     A → Glúteos + Posterior + Abdômen
 *     B → Costas + Bíceps + Ombros
 *     C → Pernas + Glúteos (ênfase) + Core
 */

// ─── Planos por objetivo e sexo ───────────────────────────────────────────────

const PLANOS = {

  // ── EMAGRECIMENTO ────────────────────────────────────────────
  emagrecimento: {
    objetivo: 'Emagrecimento com preservação muscular e déficit calórico',
    masculino: {
      iniciante: {
        A: ['Flexão de Braços','Tríceps Corda','Elevação Lateral','Prancha','Abdominal Crunch'],
        B: ['Remada Unilateral','Rosca Alternada','Puxada Frontal','Russian Twist'],
        C: ['Agachamento Livre','Avanço','Panturrilha em Pé','Elevação de Pernas'],
      },
      intermediario: {
        A: ['Supino Reto','Flexão de Braços','Tríceps Corda','Elevação Lateral','Prancha','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Rosca Martelo','Russian Twist','Abdominal Infra'],
        C: ['Agachamento Livre','Leg Press','Avanço','Stiff','Panturrilha em Pé','Elevação de Pernas'],
      },
      avancado: {
        A: ['Supino Reto','Supino Inclinado','Tríceps Corda','Tríceps Francês','Desenvolvimento Halteres','Elevação Lateral','Prancha'],
        B: ['Levantamento Terra','Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Rosca Scott'],
        C: ['Agachamento Livre','Leg Press','Agachamento Sumô','Stiff','Hip Thrust','Panturrilha em Pé','Abdominal no Cabo'],
      },
    },
    feminino: {
      iniciante: {
        A: ['Hip Thrust','Avanço Reverso','Abdominal Crunch','Prancha','Elevação de Pernas'],
        B: ['Remada Unilateral','Rosca Alternada','Elevação Lateral','Russian Twist'],
        C: ['Agachamento Sumô','Leg Press','Panturrilha em Pé','Abdominal Infra','Prancha'],
      },
      intermediario: {
        A: ['Hip Thrust','Glúteo no Cabo','Stiff','Agachamento Sumô','Prancha','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Elevação Lateral','Russian Twist'],
        C: ['Leg Press','Avanço','Agachamento Livre','Abdução no Cabo','Elevação de Pernas','Abdominal Infra'],
      },
      avancado: {
        A: ['Hip Thrust','Stiff','Glúteo no Cabo','Abdução no Cabo','Agachamento Sumô','Prancha','Russian Twist'],
        B: ['Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Desenvolvimento Halteres','Face Pull'],
        C: ['Agachamento Livre','Leg Press','Avanço Reverso','Mesa Flexora','Panturrilha em Pé','Abdominal no Cabo'],
      },
    },
  },

  // ── HIPERTROFIA ──────────────────────────────────────────────
  hipertrofia: {
    objetivo: 'Ganho de massa muscular com superávit calórico e volume alto',
    masculino: {
      iniciante: {
        A: ['Supino Reto','Tríceps Testa','Elevação Lateral','Flexão de Braços'],
        B: ['Remada Curvada','Rosca Direta','Puxada Frontal'],
        C: ['Agachamento Livre','Leg Press','Panturrilha em Pé','Prancha'],
      },
      intermediario: {
        A: ['Supino Reto','Supino Inclinado','Tríceps Testa','Tríceps Corda','Elevação Lateral','Desenvolvimento Halteres'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Direta','Rosca Martelo','Barra Fixa'],
        C: ['Agachamento Livre','Leg Press','Mesa Flexora','Panturrilha em Pé','Hip Thrust','Prancha'],
      },
      avancado: {
        A: ['Supino Reto','Supino Inclinado','Crucifixo','Tríceps Testa','Tríceps Francês','Elevação Lateral','Face Pull','Desenvolvimento com Barra'],
        B: ['Levantamento Terra','Remada Curvada','Puxada Frontal','Remada Unilateral','Rosca Direta','Rosca Scott','Barra Fixa'],
        C: ['Agachamento Livre','Leg Press','Cadeira Extensora','Mesa Flexora','Stiff','Panturrilha em Pé','Abdominal Crunch'],
      },
    },
    feminino: {
      iniciante: {
        A: ['Hip Thrust','Agachamento Sumô','Avanço Reverso','Abdominal Crunch'],
        B: ['Remada Unilateral','Rosca Alternada','Elevação Lateral','Prancha'],
        C: ['Leg Press','Stiff','Panturrilha em Pé','Elevação de Pernas'],
      },
      intermediario: {
        A: ['Hip Thrust','Glúteo no Cabo','Agachamento Sumô','Avanço Reverso','Abdução no Cabo','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Rosca Martelo','Elevação Lateral','Desenvolvimento Halteres'],
        C: ['Agachamento Livre','Leg Press','Mesa Flexora','Stiff','Panturrilha em Pé','Prancha'],
      },
      avancado: {
        A: ['Hip Thrust','Stiff','Glúteo no Cabo','Abdução no Cabo','Agachamento Sumô','Avanço Reverso','Panturrilha em Pé'],
        B: ['Levantamento Terra','Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Desenvolvimento Halteres','Face Pull'],
        C: ['Agachamento Livre','Leg Press','Cadeira Extensora','Mesa Flexora','Avanço','Abdominal no Cabo','Russian Twist'],
      },
    },
  },

  // ── RECONDICIONAMENTO ────────────────────────────────────────
  recondicionamento: {
    objetivo: 'Recondicionamento físico — resgatar condição com treinos progressivos',
    masculino: {
      iniciante: {
        A: ['Flexão de Braços','Elevação Lateral','Prancha'],
        B: ['Remada Unilateral','Rosca Alternada','Abdominal Crunch'],
        C: ['Agachamento Livre','Avanço','Panturrilha em Pé'],
      },
      intermediario: {
        A: ['Supino Reto','Flexão de Braços','Elevação Lateral','Tríceps Corda','Prancha'],
        B: ['Remada Curvada','Rosca Direta','Puxada Frontal','Russian Twist'],
        C: ['Agachamento Livre','Leg Press','Avanço','Panturrilha em Pé','Elevação de Pernas'],
      },
      avancado: {
        A: ['Supino Reto','Supino Inclinado','Desenvolvimento Halteres','Tríceps Corda','Elevação Lateral','Prancha'],
        B: ['Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Rosca Martelo'],
        C: ['Agachamento Livre','Leg Press','Stiff','Hip Thrust','Panturrilha em Pé','Abdominal Crunch'],
      },
    },
    feminino: {
      iniciante: {
        A: ['Agachamento Livre','Hip Thrust','Prancha'],
        B: ['Remada Unilateral','Elevação Lateral','Abdominal Crunch'],
        C: ['Avanço Reverso','Panturrilha em Pé','Elevação de Pernas'],
      },
      intermediario: {
        A: ['Hip Thrust','Agachamento Sumô','Stiff','Prancha','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Elevação Lateral'],
        C: ['Leg Press','Avanço','Panturrilha em Pé','Russian Twist','Elevação de Pernas'],
      },
      avancado: {
        A: ['Hip Thrust','Glúteo no Cabo','Agachamento Sumô','Abdução no Cabo','Prancha','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Desenvolvimento Halteres','Face Pull'],
        C: ['Agachamento Livre','Leg Press','Stiff','Mesa Flexora','Panturrilha em Pé','Russian Twist'],
      },
    },
  },

  // ── SAÚDE ────────────────────────────────────────────────────
  saude: {
    objetivo: 'Saúde e qualidade de vida — equilíbrio entre força e mobilidade',
    masculino: {
      iniciante: {
        A: ['Flexão de Braços','Prancha','Elevação Lateral'],
        B: ['Remada Unilateral','Agachamento Livre','Abdominal Crunch'],
        C: ['Avanço','Panturrilha em Pé','Russian Twist'],
      },
      intermediario: {
        A: ['Supino Reto','Flexão de Braços','Desenvolvimento Halteres','Elevação Lateral','Prancha'],
        B: ['Remada Curvada','Rosca Alternada','Puxada Frontal','Abdominal Crunch','Russian Twist'],
        C: ['Agachamento Livre','Avanço','Hip Thrust','Panturrilha em Pé','Elevação de Pernas'],
      },
      avancado: {
        A: ['Supino Reto','Supino Inclinado','Desenvolvimento com Barra','Tríceps Corda','Elevação Lateral','Face Pull','Prancha'],
        B: ['Levantamento Terra','Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta'],
        C: ['Agachamento Livre','Leg Press','Stiff','Hip Thrust','Panturrilha em Pé','Abdominal no Cabo'],
      },
    },
    feminino: {
      iniciante: {
        A: ['Hip Thrust','Agachamento Livre','Prancha'],
        B: ['Remada Unilateral','Elevação Lateral','Abdominal Crunch'],
        C: ['Avanço Reverso','Panturrilha em Pé','Russian Twist'],
      },
      intermediario: {
        A: ['Hip Thrust','Agachamento Sumô','Avanço Reverso','Prancha','Abdominal Crunch'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Alternada','Elevação Lateral','Russian Twist'],
        C: ['Leg Press','Stiff','Abdução no Cabo','Panturrilha em Pé','Elevação de Pernas'],
      },
      avancado: {
        A: ['Hip Thrust','Glúteo no Cabo','Agachamento Sumô','Abdução no Cabo','Stiff','Prancha'],
        B: ['Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Desenvolvimento Halteres','Face Pull'],
        C: ['Agachamento Livre','Leg Press','Mesa Flexora','Avanço','Panturrilha em Pé','Abdominal no Cabo'],
      },
    },
  },

  // ── FORÇA ────────────────────────────────────────────────────
  forca: {
    objetivo: 'Ganho de força — foco em exercícios compostos e cargas altas',
    masculino: {
      iniciante: {
        A: ['Supino Reto','Flexão de Braços','Tríceps Testa'],
        B: ['Remada Curvada','Puxada Frontal','Rosca Direta'],
        C: ['Agachamento Livre','Leg Press','Levantamento Terra'],
      },
      intermediario: {
        A: ['Supino Reto','Supino Inclinado','Tríceps Testa','Desenvolvimento com Barra','Elevação Lateral'],
        B: ['Remada Curvada','Barra Fixa','Puxada Frontal','Rosca Direta','Rosca Martelo'],
        C: ['Agachamento Livre','Levantamento Terra','Leg Press','Mesa Flexora','Panturrilha em Pé'],
      },
      avancado: {
        A: ['Supino Reto','Supino Declinado','Supino Inclinado','Tríceps Testa','Tríceps Francês','Desenvolvimento com Barra','Elevação Lateral'],
        B: ['Levantamento Terra','Barra Fixa','Remada Curvada','Remada Cavalinho','Rosca Direta','Rosca Scott'],
        C: ['Agachamento Livre','Leg Press','Cadeira Extensora','Mesa Flexora','Stiff','Panturrilha em Pé'],
      },
    },
    feminino: {
      iniciante: {
        A: ['Agachamento Livre','Hip Thrust','Leg Press'],
        B: ['Remada Curvada','Puxada Frontal','Desenvolvimento Halteres'],
        C: ['Stiff','Agachamento Sumô','Rosca Alternada'],
      },
      intermediario: {
        A: ['Agachamento Livre','Levantamento Terra','Hip Thrust','Leg Press','Stiff'],
        B: ['Remada Curvada','Puxada Frontal','Barra Fixa','Rosca Direta','Desenvolvimento Halteres'],
        C: ['Agachamento Sumô','Mesa Flexora','Abdução no Cabo','Glúteo no Cabo','Panturrilha em Pé'],
      },
      avancado: {
        A: ['Agachamento Livre','Levantamento Terra','Hip Thrust','Stiff','Leg Press','Agachamento Sumô'],
        B: ['Barra Fixa','Remada Curvada','Remada Unilateral','Desenvolvimento Halteres','Rosca Direta','Face Pull'],
        C: ['Cadeira Extensora','Mesa Flexora','Abdução no Cabo','Glúteo no Cabo','Panturrilha em Pé','Avanço Reverso'],
      },
    },
  },
};

// ─── Rótulos ──────────────────────────────────────────────────────────────────

const FASE_LABEL = {
  iniciante:     'Iniciante',
  intermediario: 'Intermediário',
  avancado:      'Avançado',
};

const FASE_PROXIMA = {
  iniciante:     { limite: 4,  label: 'Intermediário' },
  intermediario: { limite: 10, label: 'Avançado' },
  avancado:      null,
};

const DIA_LABEL_MASCULINO = {
  A: 'Dia A — Peito, Tríceps e Ombros',
  B: 'Dia B — Costas e Bíceps',
  C: 'Dia C — Pernas, Glúteos e Abdômen',
};

const DIA_LABEL_FEMININO = {
  A: 'Dia A — Glúteos, Posterior e Core',
  B: 'Dia B — Costas, Bíceps e Ombros',
  C: 'Dia C — Pernas e Glúteos (ênfase)',
};

const OBJETIVO_LABEL = {
  emagrecimento:    'Emagrecimento',
  hipertrofia:      'Hipertrofia',
  recondicionamento:'Recondicionamento',
  saude:            'Saúde',
  forca:            'Força',
};

// ─── Funções auxiliares ───────────────────────────────────────────────────────

const calcularIMC = (peso, altura) => {
  const p = parseFloat(peso);
  const a = parseFloat(altura);
  if (!p || !a || a <= 0) return null;
  return parseFloat((p / Math.pow(a / 100, 2)).toFixed(1));
};

const classificarIMC = (imc) => {
  if (!imc) return 'Peso normal';
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25)   return 'Peso normal';
  if (imc < 30)   return 'Sobrepeso';
  if (imc < 35)   return 'Obesidade grau 1';
  if (imc < 40)   return 'Obesidade grau 2';
  return 'Obesidade grau 3';
};

/** Ajusta volume por idade: >50 anos reduz, <25 anos mantém */
const ajustarPorIdade = (exercises, idade) => {
  const id = parseInt(idade) || 30;
  if (id > 60) return exercises.slice(0, Math.max(3, exercises.length - 2));
  if (id > 50) return exercises.slice(0, Math.max(4, exercises.length - 1));
  return exercises;
};

const getFase    = (n) => n <= 3 ? 'iniciante' : n <= 9 ? 'intermediario' : 'avancado';
const getDia     = (n) => ['A', 'B', 'C'][n % 3];

/**
 * Gera o treino personalizado.
 *
 * @param {object} params
 *   - sexo:         'm' | 'f'
 *   - idade:        number
 *   - peso:         number (kg)
 *   - altura:       number (cm)
 *   - objetivo:     'emagrecimento' | 'hipertrofia' | 'recondicionamento' | 'saude' | 'forca'
 *   - todasRotinas: array (para calcular fase/rotação)
 */
export const gerarTreinoPersonalizado = ({
  sexo = 'm',
  idade = 30,
  peso,
  altura,
  objetivo = 'saude',
  todasRotinas = [],
} = {}) => {
  const imc           = calcularIMC(peso, altura);
  const classificacao = classificarIMC(imc);

  // Conta treinos já criados (para progressão de fase e rotação A/B/C)
  const qtdTreinos = todasRotinas.length;
  const fase       = getFase(qtdTreinos);
  const dia        = getDia(qtdTreinos);
  const proximoDia = getDia(qtdTreinos + 1);

  const genero        = sexo === 'f' ? 'feminino' : 'masculino';
  const planoObjetivo = PLANOS[objetivo] || PLANOS.saude;
  const planoGenero   = planoObjetivo[genero];
  const planoFase     = planoGenero[fase];

  let exercises = [...(planoFase[dia] || [])];
  exercises = ajustarPorIdade(exercises, idade);

  const diaLabels = genero === 'feminino' ? DIA_LABEL_FEMININO : DIA_LABEL_MASCULINO;
  const nomeObjetivo = OBJETIVO_LABEL[objetivo] || objetivo;
  const nomeSugerido = `Treino ${dia} — ${FASE_LABEL[fase]} — ${nomeObjetivo} (IMC)`;

  const fasePai        = FASE_PROXIMA[fase];
  const faltamParaProx = fasePai ? Math.max(0, fasePai.limite - qtdTreinos) : 0;

  return {
    exercises,
    nomeSugerido,
    fase,
    faseLabel:         FASE_LABEL[fase],
    dia,
    diaLabel:          diaLabels[dia],
    proximoDia,
    proximoDiaLabel:   diaLabels[proximoDia],
    objetivo:          planoObjetivo.objetivo,
    objetivoKey:       objetivo,
    genero,
    imc,
    classificacao,
    qtdTreinos,
    proximaFaseLabel:  fasePai?.label ?? null,
    faltamParaProx,
  };
};

export { calcularIMC, classificarIMC, OBJETIVO_LABEL, FASE_LABEL };