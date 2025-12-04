import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { GenerationStats, LogEntry } from '../types';

interface Props {
  data: GenerationStats[];
  events?: LogEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-xs z-50">
        <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">Génération {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{backgroundColor: entry.color}}></span>
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="font-mono font-bold text-slate-800">{Number(entry.value).toFixed(3)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EvolutionChart: React.FC<Props> = ({ data, events = [] }) => {
  // Filter out init event and keep only significant ones
  const meaningfulEvents = events.filter(e => e.id !== 'init');

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
       <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Fréquence allélique A (p)</h3>
            <p className="text-[10px] text-slate-500">Comparaison: Simulation (Stochastique) vs Modèle Théorique</p>
          </div>
          <div className="flex gap-3 text-[10px]">
             <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-indigo-900 font-medium">Réel (Simulé)</span>
             </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-900 font-medium">Modèle Théorique</span>
             </div>
          </div>
       </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="generation" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Générations', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Draw Reference Lines for Events */}
            {meaningfulEvents.map((event) => {
               let strokeColor = "#94a3b8";
               if (event.type === 'danger') strokeColor = "#f43f5e"; // Red
               if (event.type === 'warning') strokeColor = "#f59e0b"; // Amber
               if (event.type === 'info') strokeColor = "#3b82f6"; // Blue

               return (
                 <ReferenceLine 
                    key={event.id} 
                    x={event.generation} 
                    stroke={strokeColor} 
                    strokeDasharray="3 3"
                    isFront={false}
                 >
                    <Label 
                      value={event.type === 'danger' ? '!' : '★'} 
                      position="insideTop" 
                      fill={strokeColor} 
                      fontSize={16} 
                      fontWeight="bold"
                    />
                 </ReferenceLine>
               );
            })}

            <Line 
              type="monotone" 
              dataKey="freqA" 
              name="Simulé" 
              stroke="#4f46e5" 
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={300}
              isAnimationActive={false} // Performance for fast updates
            />
             <Line 
              type="monotone" 
              dataKey="expectedFreqA" 
              name="Théorique (HW+Sel)" 
              stroke="#10b981" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={false}
              animationDuration={300}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};