import React, { useState } from 'react';
import { Plus, X, Ruler } from 'lucide-react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { postProgress } from '../../services/api-progress';

// Partes do corpo fixas — o usuário só precisa digitar o valor em cm,
// sem precisar escrever o nome da parte todas as vezes.
const FIXED_BODY_PARTS = [
  'Peito',
  'Cintura',
  'Quadril',
  'Braço',
  'Coxa',
  'Panturrilha',
  'Ombro',
  'Pescoço',
];

let customIdCounter = 0;
const nextCustomId = () => `custom-${Date.now()}-${customIdCounter++}`;

const ProgressForm = ({ setFormVisible, setRefresh, refresh }) => {
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');

  // Medidas fixas: { Peito: '', Cintura: '', ... } — todas opcionais.
  const [fixedValues, setFixedValues] = useState(
    FIXED_BODY_PARTS.reduce((acc, part) => ({ ...acc, [part]: '' }), {})
  );

  // Medidas extras, para partes do corpo que não estão na lista fixa.
  const [customMeasurements, setCustomMeasurements] = useState([]);

  const handleFixedChange = (part, value) => {
    setFixedValues((prev) => ({ ...prev, [part]: value }));
  };

  const handleAddCustomField = () => {
    setCustomMeasurements((prev) => [...prev, { id: nextCustomId(), part: '', value: '' }]);
  };

  const handleRemoveCustomField = (id) => {
    setCustomMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCustomChange = (id, field, value) => {
    setCustomMeasurements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const resetForm = () => {
    setDate('');
    setWeight('');
    setFixedValues(FIXED_BODY_PARTS.reduce((acc, part) => ({ ...acc, [part]: '' }), {}));
    setCustomMeasurements([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !weight) {
      alert('Preencha a data e o peso para salvar o progresso.');
      return;
    }

    // Só envia as medidas que o usuário realmente preencheu.
    const measurements = {};

    FIXED_BODY_PARTS.forEach((part) => {
      const value = fixedValues[part];
      if (value !== '' && value !== null && value !== undefined) {
        measurements[part] = value;
      }
    });

    customMeasurements.forEach(({ part, value }) => {
      const trimmedPart = part.trim();
      if (trimmedPart && value !== '' && value !== null && value !== undefined) {
        measurements[trimmedPart] = value;
      }
    });

    const progressData = { date, weight, measurements };

    try {
      await postProgress(progressData);
      resetForm();
      setFormVisible(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Erro ao criar progresso:', error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-black/30 p-4 sm:p-6 rounded-md shadow-md flex flex-col gap-y-5 mb-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Peso (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Ex: 70"
          />
        </div>
      </div>

      {/* Medidas fixas — só o valor em cm, o nome da parte já vem pronto */}
      <div>
        <div className="flex items-center gap-x-1.5 mb-1">
          <Ruler className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-medium text-gray-300">Medidas do corpo (cm)</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Preencha apenas as medidas que você quer registrar hoje.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FIXED_BODY_PARTS.map((part) => (
            <div key={part} className="min-w-0">
              <label className="block text-xs text-gray-400 mb-1 truncate" title={part}>
                {part}
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={fixedValues[part]}
                  onChange={(e) => handleFixedChange(part, e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-black/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="0"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 pointer-events-none">
                  cm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medidas extras — para partes que não estão na lista fixa */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">Outras medidas (opcional)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Não encontrou a parte do corpo que procurava? Adicione manualmente.
        </p>

        {customMeasurements.length > 0 && (
          <div className="flex flex-col gap-y-2 mb-3">
            {customMeasurements.map((measurement) => (
              <div key={measurement.id} className="flex gap-x-2 items-center">
                <input
                  type="text"
                  value={measurement.part}
                  onChange={(e) => handleCustomChange(measurement.id, 'part', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2 bg-black/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Nome da parte (Ex: Antebraço)"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={measurement.value}
                  onChange={(e) => handleCustomChange(measurement.id, 'value', e.target.value)}
                  className="w-20 sm:w-24 shrink-0 px-3 py-2 bg-black/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="cm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(measurement.id)}
                  className="shrink-0 p-2 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Remover medida"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddCustomField}
          className="flex items-center gap-x-1.5 px-3 py-2 bg-indigo-600/20 border border-indigo-600/40 hover:bg-indigo-600/30 rounded-md text-indigo-300 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar medida personalizada
        </button>
      </div>

      <PrimaryBtn type="submit">Salvar Progresso</PrimaryBtn>
    </form>
  );
};

export default ProgressForm;