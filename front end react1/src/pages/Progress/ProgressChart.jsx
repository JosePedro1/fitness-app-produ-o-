import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// Pega todas as chaves de medidas presentes nos registros
const getMeasurementKeys = (progressList) => {
  const keys = new Set();
  progressList.forEach((p) => {
    if (p.measurements) {
      Object.keys(p.measurements).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys);
};

// Cores para as linhas de medidas
const LINE_COLORS = [
  '#a78bfa', '#34d399', '#f59e0b', '#f87171',
  '#60a5fa', '#fb923c', '#e879f9', '#4ade80',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1d1d1d] border border-gray-700 rounded-lg px-4 py-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value} {entry.name === 'Peso' ? 'kg' : 'cm'}
        </p>
      ))}
    </div>
  );
};

const ProgressChart = ({ progressList }) => {
  const measurementKeys = getMeasurementKeys(progressList);
  const [activeLines, setActiveLines] = useState(
    ['Peso', ...measurementKeys].reduce((acc, k) => ({ ...acc, [k]: true }), {})
  );

  // Ordena por data ascendente para o gráfico
  const sorted = [...progressList].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sorted.map((p) => {
    const entry = { date: p.date };
    entry['Peso'] = parseFloat(p.weight);
    measurementKeys.forEach((key) => {
      entry[key] = p.measurements?.[key] ? parseFloat(p.measurements[key]) : null;
    });
    return entry;
  });

  const toggleLine = (key) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allKeys = ['Peso', ...measurementKeys];

  return (
    <div className="w-full bg-black/20 rounded-xl p-6 mb-8 border border-gray-800">
      <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        Evolução ao longo do tempo
      </h2>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2 mb-5">
        {allKeys.map((key, i) => {
          const color = key === 'Peso' ? '#6366f1' : LINE_COLORS[i % LINE_COLORS.length];
          const active = activeLines[key];
          return (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                active
                  ? 'border-transparent text-white'
                  : 'border-gray-700 text-gray-600 bg-transparent'
              }`}
              style={active ? { backgroundColor: color + '33', borderColor: color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: active ? color : '#4b5563' }}
              />
              {key}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Linha de Peso */}
          {activeLines['Peso'] && (
            <Line
              type="monotone"
              dataKey="Peso"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}

          {/* Linhas de Medidas */}
          {measurementKeys.map((key, i) =>
            activeLines[key] ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
