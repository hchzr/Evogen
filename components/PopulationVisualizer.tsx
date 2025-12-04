import React from 'react';
import { Individual } from '../types';
import { PawPrint } from 'lucide-react';

interface Props {
  population: Individual[];
}

export const PopulationVisualizer: React.FC<Props> = ({ population }) => {
  // Limit rendering for performance
  const displayPop = population.slice(0, 150);
  const remaining = Math.max(0, population.length - 150);

  return (
    <div className="bg-[#2c2a25] rounded-xl p-5 shadow-inner overflow-hidden relative h-full min-h-[300px] flex flex-col border border-stone-800">
       <div className="flex justify-between items-start z-10 mb-4 shrink-0">
          <div className="text-stone-300 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
            <PawPrint size={14} />
            Colonie de Chimpanzés
          </div>
          <div className="text-xs text-stone-500">
             N = {population.length}
          </div>
       </div>
       
       <div className="flex-1 flex flex-wrap content-start gap-1.5 overflow-y-auto custom-scrollbar justify-center p-1">
        {displayPop.map((ind) => {
          // Determine style based on genotype
          // AA = Dark, Aa = Dark (but maybe slightly diff for visualization?), aa = Light
          let colorClass = "";
          let opacity = "opacity-100";
          let scale = "scale-100";
          
          if (ind.genotype === 'AA') {
            colorClass = "text-[#5c4033]"; // Dark Brown
            scale = "scale-100";
          } else if (ind.genotype === 'Aa') {
            colorClass = "text-[#8b5a2b]"; // Medium Brown
            opacity = "opacity-90";
            scale = "scale-95";
          } else {
            colorClass = "text-[#e3dcd3]"; // Beige/Light
            opacity = "opacity-80";
            scale = "scale-90";
          }

          return (
            <div 
              key={ind.id}
              className={`transition-all duration-500 hover:scale-150 cursor-help bg-white/10 rounded-full p-1 ${colorClass} ${opacity} ${scale}`}
              title={`Chimpanzé ${ind.id}\nGenotype: ${ind.genotype}\nPhénotype: ${ind.phenotype}`}
            >
              <PawPrint size={14} strokeWidth={2.5} fill="currentColor" />
            </div>
          );
        })}
        
        {remaining > 0 && (
             <div className="w-full text-center text-xs text-stone-500 mt-4 font-mono">
                + {remaining} individus hors champ...
             </div>
        )}
       </div>

       <div className="mt-4 pt-3 border-t border-stone-700 flex justify-center gap-6 text-[10px] text-stone-400 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-[#5c4033]"></div>
             <span>AA (Foncé)</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-[#8b5a2b]"></div>
             <span>Aa (Porteur)</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-[#e3dcd3]"></div>
             <span>aa (Clair)</span>
          </div>
       </div>
    </div>
  );
};