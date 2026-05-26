/**
 * IMC Treino Engine
 * 
 * Sistema de rotação A/B/C + progressão de dificuldade baseado em histórico.
 * 
 * FASES (determinadas pela quantidade de rotinas IMC já criadas):
 *   Iniciante      → 0–3 rotinas   → exercícios básicos, volume baixo
 *   Intermediário  → 4–9 rotinas   → mais exercícios, grupos compostos
 *   Avançado       → 10+ rotinas   → exercícios complexos, volume alto
 *
 * ROTAÇÃO:
 *   Dia A → Peito + Tríceps + Ombros
 *   Dia B → Costas + Bíceps
 *   Dia C → Pernas + Glúteos + Abdômen
 *   (cicla a cada nova rotina IMC criada: A→B→C→A→...)
 */

const PLANOS = {
  'Abaixo do peso': {
    objetivo: 'Ganho de massa muscular',
    fases: {
      iniciante: {
        A: ['Supino Reto', 'Tríceps Testa', 'Elevação Lateral'],
        B: ['Remada Curvada', 'Rosca Direta', 'Puxada Frontal'],
        C: ['Agachamento Livre', 'Leg Press', 'Prancha'],
      },
      intermediario: {
        A: ['Supino Reto', 'Supino Inclinado', 'Tríceps Testa', 'Tríceps Corda', 'Elevação Lateral'],
        B: ['Remada Curvada', 'Puxada Frontal', 'Rosca Direta', 'Rosca Martelo', 'Barra Fixa'],
        C: ['Agachamento Livre', 'Leg Press', 'Mesa Flexora', 'Panturrilha em Pé', 'Prancha'],
      },
      avancado: {
        A: ['Supino Reto', 'Supino Inclinado', 'Crucifixo', 'Tríceps Testa', 'Tríceps Francês', 'Elevação Lateral', 'Face Pull'],
        B: ['Levantamento Terra', 'Remada Curvada', 'Puxada Frontal', 'Remada Unilateral', 'Rosca Direta', 'Rosca Scott'],
        C: ['Agachamento Livre', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Panturrilha em Pé', 'Abdominal Crunch'],
      },
    },
  },
  'Peso normal': {
    objetivo: 'Manutenção e condicionamento',
    fases: {
      iniciante: {
        A: ['Flexão de Braços', 'Elevação Lateral', 'Tríceps Corda'],
        B: ['Remada Unilateral', 'Rosca Alternada', 'Puxada Frontal'],
        C: ['Agachamento Livre', 'Prancha', 'Abdominal Crunch'],
      },
      intermediario: {
        A: ['Supino Reto', 'Flexão de Braços', 'Elevação Lateral', 'Tríceps Corda', 'Desenvolvimento Halteres'],
        B: ['Remada Curvada', 'Rosca Alternada', 'Puxada Frontal', 'Rosca Martelo', 'Remada Unilateral'],
        C: ['Agachamento Livre', 'Avanço', 'Prancha', 'Russian Twist', 'Elevação de Pernas'],
      },
      avancado: {
        A: ['Supino Reto', 'Supino Inclinado', 'Desenvolvimento com Barra', 'Elevação Lateral', 'Elevação Frontal', 'Tríceps Corda', 'Tríceps Francês'],
        B: ['Levantamento Terra', 'Puxada Frontal', 'Remada Curvada', 'Barra Fixa', 'Rosca Direta', 'Rosca Scott'],
        C: ['Agachamento Livre', 'Leg Press', 'Avanço', 'Hip Thrust', 'Prancha', 'Russian Twist', 'Abdominal no Cabo'],
      },
    },
  },
  'Sobrepeso': {
    objetivo: 'Emagrecimento com preservação muscular',
    fases: {
      iniciante: {
        A: ['Flexão de Braços', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Sumô', 'Avanço', 'Elevação de Pernas'],
        C: ['Remada Unilateral', 'Elevação Lateral', 'Russian Twist'],
      },
      intermediario: {
        A: ['Flexão de Braços', 'Supino Reto', 'Tríceps Corda', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Sumô', 'Leg Press', 'Avanço', 'Hip Thrust', 'Elevação de Pernas'],
        C: ['Remada Curvada', 'Puxada Frontal', 'Rosca Alternada', 'Russian Twist', 'Abdominal Infra'],
      },
      avancado: {
        A: ['Supino Reto', 'Flexão de Braços', 'Desenvolvimento Halteres', 'Tríceps Corda', 'Elevação Lateral', 'Prancha'],
        B: ['Agachamento Livre', 'Agachamento Sumô', 'Leg Press', 'Stiff', 'Hip Thrust', 'Panturrilha em Pé'],
        C: ['Levantamento Terra', 'Remada Curvada', 'Puxada Frontal', 'Russian Twist', 'Abdominal no Cabo', 'Elevação de Pernas'],
      },
    },
  },
  'Obesidade grau 1': {
    objetivo: 'Emagrecimento progressivo',
    fases: {
      iniciante: {
        A: ['Flexão de Braços', 'Prancha', 'Elevação Lateral'],
        B: ['Agachamento Livre', 'Panturrilha em Pé', 'Abdominal Crunch'],
        C: ['Remada Unilateral', 'Rosca Alternada', 'Russian Twist'],
      },
      intermediario: {
        A: ['Flexão de Braços', 'Supino Reto', 'Elevação Lateral', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Livre', 'Leg Press', 'Avanço', 'Panturrilha em Pé', 'Elevação de Pernas'],
        C: ['Remada Curvada', 'Rosca Alternada', 'Tríceps Corda', 'Russian Twist', 'Abdominal Infra'],
      },
      avancado: {
        A: ['Supino Reto', 'Flexão de Braços', 'Tríceps Corda', 'Elevação Lateral', 'Desenvolvimento Halteres', 'Prancha'],
        B: ['Agachamento Livre', 'Leg Press', 'Agachamento Sumô', 'Hip Thrust', 'Stiff', 'Panturrilha em Pé'],
        C: ['Remada Curvada', 'Puxada Frontal', 'Rosca Direta', 'Russian Twist', 'Abdominal no Cabo', 'Elevação de Pernas'],
      },
    },
  },
  'Obesidade grau 2': {
    objetivo: 'Ativação progressiva e emagrecimento',
    fases: {
      iniciante: {
        A: ['Flexão de Braços', 'Elevação Lateral', 'Prancha'],
        B: ['Agachamento Livre', 'Panturrilha em Pé', 'Abdominal Crunch'],
        C: ['Remada Unilateral', 'Rosca Alternada', 'Russian Twist'],
      },
      intermediario: {
        A: ['Flexão de Braços', 'Supino Reto', 'Tríceps Corda', 'Elevação Lateral', 'Prancha'],
        B: ['Agachamento Livre', 'Leg Press', 'Panturrilha em Pé', 'Abdominal Crunch', 'Elevação de Pernas'],
        C: ['Remada Unilateral', 'Puxada Frontal', 'Rosca Alternada', 'Russian Twist', 'Abdominal Infra'],
      },
      avancado: {
        A: ['Supino Reto', 'Flexão de Braços', 'Desenvolvimento Halteres', 'Tríceps Corda', 'Elevação Lateral', 'Prancha'],
        B: ['Agachamento Livre', 'Leg Press', 'Avanço', 'Hip Thrust', 'Panturrilha em Pé', 'Elevação de Pernas'],
        C: ['Remada Curvada', 'Puxada Frontal', 'Rosca Direta', 'Russian Twist', 'Abdominal no Cabo'],
      },
    },
  },
  'Obesidade grau 3': {
    objetivo: 'Ativação inicial com baixo impacto',
    fases: {
      iniciante: {
        A: ['Flexão de Braços', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Livre', 'Panturrilha em Pé', 'Elevação Lateral'],
        C: ['Remada Unilateral', 'Rosca Alternada', 'Russian Twist'],
      },
      intermediario: {
        A: ['Flexão de Braços', 'Elevação Lateral', 'Tríceps Corda', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Livre', 'Leg Press', 'Panturrilha em Pé', 'Abdominal Infra', 'Elevação de Pernas'],
        C: ['Remada Unilateral', 'Rosca Alternada', 'Puxada Frontal', 'Russian Twist', 'Abdominal no Cabo'],
      },
      avancado: {
        A: ['Supino Reto', 'Flexão de Braços', 'Tríceps Corda', 'Elevação Lateral', 'Prancha', 'Abdominal Crunch'],
        B: ['Agachamento Livre', 'Leg Press', 'Avanço', 'Panturrilha em Pé', 'Hip Thrust', 'Elevação de Pernas'],
        C: ['Remada Curvada', 'Puxada Frontal', 'Rosca Direta', 'Russian Twist', 'Abdominal no Cabo'],
      },
    },
  },
};

const FASE_LABEL = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };
const FASE_PROXIMA = { iniciante: { limite: 4, label: 'Intermediário' }, intermediario: { limite: 10, label: 'Avançado' }, avancado: null };
const DIA_LABEL = {
  A: 'Dia A — Peito, Tríceps e Ombros',
  B: 'Dia B — Costas e Bíceps',
  C: 'Dia C — Pernas, Glúteos e Abdômen',
};

const getRotinasIMC = (todas) => todas.filter(r => r.name && r.name.includes('(IMC)'));
const getFase      = (n) => n <= 3 ? 'iniciante' : n <= 9 ? 'intermediario' : 'avancado';
const getDia       = (n) => ['A', 'B', 'C'][n % 3];

/**
 * Gera o treino personalizado para hoje.
 * @param {string} classificacao  ex: 'Sobrepeso'
 * @param {Array}  todasRotinas   lista vinda da API
 */
export const gerarTreinoPersonalizado = (classificacao, todasRotinas = []) => {
  const rotinasIMC = getRotinasIMC(todasRotinas);
  const qtdRotinas = rotinasIMC.length;

  const fase       = getFase(qtdRotinas);
  const diaRotacao = getDia(qtdRotinas);
  const proximoDia = getDia(qtdRotinas + 1);

  const plano = PLANOS[classificacao];
  if (!plano) return null;

  const exercises = plano.fases[fase][diaRotacao];
  const nomeSugerido = `Treino ${diaRotacao} — ${FASE_LABEL[fase]} (IMC)`;

  // Info de progressão para mostrar ao usuário
  const fasePai      = FASE_PROXIMA[fase];
  const faltamParaProx = fasePai ? fasePai.limite - qtdRotinas : 0;

  return {
    exercises,
    nomeSugerido,
    fase,
    faseLabel:        FASE_LABEL[fase],
    diaRotacao,
    diaLabel:         DIA_LABEL[diaRotacao],
    proximoDiaLabel:  DIA_LABEL[proximoDia],
    objetivo:         plano.objetivo,
    qtdRotinas,
    // Progressão
    proximaFaseLabel: fasePai?.label ?? null,
    faltamParaProx:   fasePai ? Math.max(0, faltamParaProx) : 0,
  };
};
