import React from 'react';
import { SimulationParams } from '../types';
import { Settings, Play, Pause, RotateCcw, Activity, Zap, Skull, Wind, FastForward, Radiation, MousePointer2 } from 'lucide-react';

interface Props {
  params: SimulationParams;
  setParams: (p: SimulationParams) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  reset: () => void;
  step: (generations?: number) => void;
  triggerEvent: (type: string) => void;
}

const ControlGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-6 border-b border-white/10 pb-5 last:border-0">
    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Slider = ({ label, value, onChange, min, max, step, suffix = '' }: any) => (
  <div>
    <div className="flex justify-between mb-1.5 items-end">
      <label className="text-xs font-medium text-stone-300">{label}</label>
      <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">{Number(value).toFixed(step < 0.01 ? 3 : 2)}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
    />
  </div>
);

const EventButton = ({ onClick, icon: Icon, label, colorClass, desc }: any) => (
  <button 
    onClick={onClick}
    className={`group relative w-full py-2 px-2 rounded-lg border text-[10px] font-bold uppercase tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 h-16 ${colorClass}`}
  >
    <Icon size={16} /> 
    <span className="text-center leading-none">{label}</span>
    <div className="absolute opacity-0 group-hover:opacity-100 left-full top-1/2 -translate-y-1/2 ml-3 w-48 bg-stone-900 text-white text-[11px] p-2.5 rounded-lg border border-stone-700 shadow-xl pointer-events-none transition-opacity z-50 text-left normal-case font-medium">
      {desc}
      {/* Arrow */}
      <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-stone-700"></div>
    </div>
  </button>
);

export const SimulationControls: React.FC<Props> = ({ params, setParams, isPlaying, togglePlay, reset, step, triggerEvent }) => {
  
  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div className="h-full flex flex-col bg-[#1c1917] border-r border-stone-800 w-[340px] flex-shrink-0 shadow-2xl z-30 text-stone-200">
      <div className="p-6 border-b border-stone-800 bg-[#1c1917]">
        <h2 className="text-lg font-bold text-white flex items-center gap-3 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
             <MousePointer2 className="w-4 h-4 text-white" />
          </div>
          Contrôles
        </h2>
        <p className="text-xs text-stone-500 mt-1 pl-11">Paramétrez l'évolution en temps réel</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* ÉVÉNEMENTS */}
        <ControlGroup title="Perturbations Écologiques">
           <div className="grid grid-cols-2 gap-2">
             <EventButton 
                onClick={() => triggerEvent('bottleneck')} 
                icon={Skull} 
                label="Goulot" 
                desc="Réduit drastiquement la population (N<10)."
                colorClass="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
             />
             <EventButton 
                onClick={() => triggerEvent('sweep')} 
                icon={Zap} 
                label="Sélection" 
                desc="Avantage massif pour le génotype dominant AA."
                colorClass="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
             />
             <EventButton 
                onClick={() => triggerEvent('radiation')} 
                icon={Radiation} 
                label="Mutation" 
                desc="Augmente le taux de mutation x20."
                colorClass="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
             />
             <EventButton 
                onClick={() => triggerEvent('founder')} 
                icon={Wind} 
                label="Fondateur" 
                desc="Migration d'un petit groupe isolé."
                colorClass="bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
             />
           </div>
        </ControlGroup>

        <ControlGroup title="Population & Dérive">
          <Slider 
            label="Taille de la population (N)" 
            value={params.populationSize} 
            min={10} max={1000} step={10} 
            onChange={(v: number) => updateParam('populationSize', v)} 
          />
          <Slider 
            label="Fréquence initiale A (p0)" 
            value={params.initialFreqA} 
            min={0} max={1} step={0.01} 
            onChange={(v: number) => updateParam('initialFreqA', v)} 
          />
        </ControlGroup>

        <ControlGroup title="Fitness Relative (w)">
          <div className="space-y-3 pl-3 border-l border-stone-700">
             <Slider label="wAA (Dominant Foncé)" value={params.fitnessAA} min={0} max={1} step={0.05} onChange={(v: number) => updateParam('fitnessAA', v)} />
             <Slider label="wAa (Hétérozygote)" value={params.fitnessAa} min={0} max={1} step={0.05} onChange={(v: number) => updateParam('fitnessAa', v)} />
             <Slider label="waa (Récessif Clair)" value={params.fitnessaa} min={0} max={1} step={0.05} onChange={(v: number) => updateParam('fitnessaa', v)} />
          </div>
        </ControlGroup>

        <ControlGroup title="Forces Evolutives">
          <Slider label="Taux Mutation (u)" value={params.mutationRate} min={0} max={0.1} step={0.001} onChange={(v: number) => updateParam('mutationRate', v)} />
          <Slider label="Taux Migration (m)" value={params.migrationRate} min={0} max={0.5} step={0.01} onChange={(v: number) => updateParam('migrationRate', v)} />
        </ControlGroup>
      </div>

      <div className="p-4 bg-[#1c1917] border-t border-stone-800 space-y-3 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
         <button 
          onClick={togglePlay}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg active:scale-95 ${
            isPlaying 
              ? 'bg-amber-500 text-stone-900 hover:bg-amber-400' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          {isPlaying ? 'PAUSE' : 'LANCER SIMULATION'}
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => step(1)}
            disabled={isPlaying}
            className="py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-300 font-medium hover:bg-stone-700 hover:text-white flex flex-col items-center justify-center disabled:opacity-40 transition-colors text-[10px]"
          >
            <Activity className="w-3.5 h-3.5 mb-1" /> +1 Gen
          </button>
          <button 
            onClick={() => step(10)}
            disabled={isPlaying}
            className="py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-300 font-medium hover:bg-stone-700 hover:text-white flex flex-col items-center justify-center disabled:opacity-40 transition-colors text-[10px]"
          >
            <FastForward className="w-3.5 h-3.5 mb-1" /> +10 Gen
          </button>
          <button 
            onClick={reset}
            className="py-2 bg-stone-800 border border-stone-700 rounded-lg text-rose-400 font-medium hover:bg-rose-500/20 hover:border-rose-500/50 flex flex-col items-center justify-center transition-colors text-[10px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mb-1" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};