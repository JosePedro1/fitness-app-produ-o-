import React, { useState } from 'react';
import PrimaryBtn from '../../components/Button/PrimaryBtn';
import { postProgress } from '../../services/api-progress';

const ProgressForm = ({ setFormVisible, setRefresh, refresh }) => {
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');
  const [measurements, setMeasurements] = useState([{ part: '', value: '' }]);

  const handleAddMeasurementField = () => {
    setMeasurements([...measurements, { part: '', value: '' }]);
  };

  const handleRemoveMeasurementField = () => {
    if (measurements.length > 1) {
      setMeasurements(measurements.slice(0, -1));
    }
  };

  const handleMeasurementChange = (index, field, value) => {
    const updatedMeasurements = [...measurements];
    updatedMeasurements[index][field] = value;
    setMeasurements(updatedMeasurements);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !weight || measurements.some(m => !m.part || !m.value)) {
      alert('Preencha todos os campos do formulário.');
      return;
    }

    const progressData = {
      date,
      weight,
      measurements: measurements.reduce((acc, cur) => {
        acc[cur.part] = cur.value;
        return acc;
      }, {}),
    };

    try {
      await postProgress(progressData);
      setDate('');
      setWeight('');
      setMeasurements([{ part: '', value: '' }]);
      setFormVisible(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Erro ao criar progresso:', error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-black/30 p-6 rounded-md shadow-md flex flex-col gap-y-4 mb-8"
    >
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
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Ex: 70"
        />
      </div>

      {measurements.map((measurement, index) => (
        <div key={index} className="flex gap-x-2 items-center">
          <input
            type="text"
            value={measurement.part}
            onChange={(e) => handleMeasurementChange(index, 'part', e.target.value)}
            className="flex-1 px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Parte do Corpo (Ex: Braço)"
          />
          <input
            type="number"
            value={measurement.value}
            onChange={(e) => handleMeasurementChange(index, 'value', e.target.value)}
            className="w-28 px-4 py-2 bg-black/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="cm"
          />
        </div>
      ))}

      <div className="flex gap-x-4">
        <button
          type="button"
          onClick={handleAddMeasurementField}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm"
        >
          Adicionar Campo
        </button>

        <button
          type="button"
          onClick={handleRemoveMeasurementField}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm"
        >
          Remover Campo
        </button>
      </div>

      <PrimaryBtn type="submit">Salvar Progresso</PrimaryBtn>
    </form>
  );
};

export default ProgressForm;
