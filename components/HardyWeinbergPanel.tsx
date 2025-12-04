import React from 'react';
import { GenerationStats } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  currentStats: GenerationStats;
}

export const HardyWeinbergPanel: React.FC<Props> = ({ currentStats }) => {
  const { 
    freqA, freqa, 
    countAA, countAa, countaa, 
    totalPopulation, 
    heterozygosityObs, heterozygosityExp, fixationIndex 
  } = currentStats;

  // Hardy-Weinberg Expectations based on CURRENT allele frequencies
  const expectedAA = Math.round(freqA * freqA * totalPopulation);
  const expectedAa = Math.round(2 * freqA * freqa * totalPopulation);
  const expectedaa = Math.round(freqa * freqa * totalPopulation);

  const data = [
    { name: 'AA (Foncé)', observed: countAA, expected: expectedAA },
    { name: 'Aa (Porteur)', observed: countAa, expected: expectedAa },
    { name: 'aa (Clair)', observed: countaa, expected: expectedaa },
  ];

  // Chi-Square
  const chiSquare = data.reduce((acc, curr) => {
    if (curr.expected === 0) return acc;
    return acc + Math.pow(curr.observed - curr.expected, 2) / curr.expected;
  }, 0);

  // Interpretation of F
  let fInterpretation = "Équilibre";
  let fColor = "text-emerald-600";
  if (fixationIndex > 0.1) { fInterpretation = "Déficit Hétérozygotes"; fColor = "text-amber-600"; }
  if (fixationIndex > 0.5) { fInterpretation = "Forte Fixation"; fColor = "text-rose-600"; }
  if (fixationIndex < -0.1) { fInterpretation = "Excès Hétérozygotes"; fColor = "text-indigo-600"; }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-full flex flex-col">
      <div className="mb-2 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Test Hardy-Weinberg</h3>
        <p className="text-xs text-slate-500 mt-0.5">Génotypes Chimpanzés: Observés vs Attendus</p>
      </div>

      {/* FIXED HEIGHT CONTAINER TO PREVENT FLEX BREAKAGE */}
      <div className="flex-1 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
            />
            <Bar dataKey="observed" name="Réel" fill="#57534e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expected" name="Théorique" fill="#d6d3d1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
         <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Fixation (F)</div>
            <div className={`text-sm font-mono font-bold ${fColor}`}>
                {fixationIndex.toFixed(3)}
            </div>
            <div className="text-[9px] text-slate-400 leading-tight">{fInterpretation}</div>
         </div>
         <div>
             <div className="text-[10px] text-slate-500 uppercase font-semibold">Hétérozygotie</div>
             <div className="flex justify-between text-xs mt-0.5">
                 <span className="text-stone-700 font-bold" title="Observée">Obs: {heterozygosityObs.toFixed(2)}</span>
                 <span className="text-slate-400" title="Attendue">Exp: {heterozygosityExp.toFixed(2)}</span>
             </div>
         </div>
      </div>
    </div>
  );
};