import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationParams, Individual, GenerationStats, LogEntry } from './types';
import { createInitialPopulation, calculateStats, simulateNextGeneration, calculateExpectedNextP } from './utils/genetics';
import { SimulationControls } from './components/SimulationControls';
import { PopulationVisualizer } from './components/PopulationVisualizer';
import { EvolutionChart } from './components/EvolutionChart';
import { HardyWeinbergPanel } from './components/HardyWeinbergPanel';
import { GeminiAnalyst } from './components/GeminiAnalyst';
import { Info, Terminal, PawPrint } from 'lucide-react';

const DEFAULT_PARAMS: SimulationParams = {
  populationSize: 100,
  initialFreqA: 0.5,
  fitnessAA: 1.0,
  fitnessAa: 1.0,
  fitnessaa: 1.0,
  mutationRate: 0.001,
  migrationRate: 0.0,
  // migrationFreqA removed
};

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [population, setPopulation] = useState<Individual[]>([]);
  const [history, setHistory] = useState<GenerationStats[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);

  const timerRef = useRef<number | null>(null);
  const currentTheoreticalP = useRef<number>(DEFAULT_PARAMS.initialFreqA);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
      setLogs(prev => [...prev, { id: Math.random().toString(36), generation, message, type }]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const initialPop = createInitialPopulation(params.populationSize, params.initialFreqA);
    const initialStats = calculateStats(initialPop, 0, params.initialFreqA);
    
    setPopulation(initialPop);
    setHistory([initialStats]);
    setLogs([{ id: 'init', generation: 0, message: 'Simulation initialisée.', type: 'info' }]);
    setGeneration(0);
    currentTheoreticalP.current = params.initialFreqA;
  }, [params.populationSize, params.initialFreqA]);

  useEffect(() => { resetSimulation(); }, []);

  useEffect(() => {
      if (generation === 0) {
          currentTheoreticalP.current = params.initialFreqA;
      }
  }, [params.initialFreqA, generation]);

  const handleStep = (generationsToAdvance: number = 1) => {
      let tempPop = population;
      let tempTheoreticalP = currentTheoreticalP.current;
      const newHistoryItems: GenerationStats[] = [];
      let currentGen = generation;

      for (let i = 0; i < generationsToAdvance; i++) {
          currentGen++;
          const nextExpectedP = calculateExpectedNextP(tempTheoreticalP, params);
          tempTheoreticalP = nextExpectedP;
          
          tempPop = simulateNextGeneration(tempPop, params);
          
          if (tempPop.length === 0) {
              setIsPlaying(false);
              addLog("Extinction de la population !", 'danger');
              break;
          }

          newHistoryItems.push(calculateStats(tempPop, currentGen, tempTheoreticalP));
      }

      currentTheoreticalP.current = tempTheoreticalP;
      setPopulation(tempPop);
      setHistory(prev => [...prev, ...newHistoryItems]);
      setGeneration(currentGen);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => handleStep(1), 200); 
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, params, population, generation]);


  const triggerEvent = (type: string) => {
      if (isPlaying) setIsPlaying(false);

      let newPop = [...population];
      let newParams = { ...params };

      switch(type) {
          case 'bottleneck':
              const survivors = newPop.filter(() => Math.random() < 0.1); 
              newPop = survivors.length < 5 ? newPop.slice(0, 5) : survivors;
              newParams.populationSize = newPop.length; 
              addLog(`EVENT: Goulot d'étranglement. N=${newPop.length}`, 'danger');
              break;

          case 'sweep':
              newParams.fitnessAA = 1.0;
              newParams.fitnessAa = 0.8;
              newParams.fitnessaa = 0.2;
              addLog("EVENT: Sélection forte (Foncé).", 'warning');
              break;

          case 'radiation':
              newParams.mutationRate = 0.02; 
              addLog("EVENT: Radiation (u=0.02).", 'warning');
              break;
          
          case 'founder':
               newPop = newPop.slice(0, 15);
               newParams.populationSize = 15;
               newParams.migrationRate = 0;
               addLog("EVENT: Effet Fondateur (N=15).", 'info');
               break;
      }

      setParams(newParams);
      setPopulation(newPop);
      
      const stats = calculateStats(newPop, generation, currentTheoreticalP.current);
      setHistory(prev => {
          const newH = [...prev];
          newH[newH.length - 1] = stats;
          return newH;
      });
  };

  const currentStats = history[history.length - 1] || { 
      generation: 0, freqA: 0, freqa: 0, countAA: 0, countAa: 0, countaa: 0, expectedFreqA: 0, totalPopulation: 0, heterozygosityObs: 0, heterozygosityExp: 0, fixationIndex: 0
  };

  return (
    <div className="h-screen w-screen bg-[#f0f2f5] flex overflow-hidden font-sans text-slate-800">
      
      <SimulationControls 
        params={params} 
        setParams={setParams} 
        isPlaying={isPlaying} 
        togglePlay={() => setIsPlaying(!isPlaying)}
        reset={resetSimulation}
        step={handleStep}
        triggerEvent={triggerEvent}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 flex justify-between items-center shadow-sm z-10 shrink-0 sticky top-0">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                 <PawPrint className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">ChimpEvo</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Simulateur de Génétique des Populations</p>
              </div>
           </div>
           
           <div className="flex items-center gap-6 bg-slate-100/50 p-2 pr-6 rounded-2xl border border-slate-200/60">
              <div className="flex flex-col items-end px-4 border-r border-slate-200">
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Génération</span>
                 <span className="text-2xl font-mono font-bold text-indigo-600 leading-none">{generation}</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Individus</span>
                 <span className="text-2xl font-mono font-bold text-slate-700 leading-none">{population.length}</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-12 gap-6 h-full min-h-[600px] auto-rows-min max-w-[1600px] mx-auto">
              
              {/* Visualizer - Main Centerpiece */}
              <div className="col-span-12 lg:col-span-8 h-[360px] relative group">
                 <PopulationVisualizer population={population} />
              </div>
              
              {/* Logs */}
              <div className="col-span-12 lg:col-span-4 h-[360px] bg-[#1e1e1e] rounded-2xl border border-stone-800 flex flex-col overflow-hidden shadow-xl">
                  <div className="p-4 bg-[#252525] border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Logs</span>
                     </div>
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
                     {logs.length === 0 && <div className="text-stone-600 italic text-center mt-10">... En attente de données ...</div>}
                     {logs.map((log) => (
                        <div key={log.id} className={`flex gap-3 pb-2 border-b border-white/5 last:border-0 ${
                            log.type === 'danger' ? 'text-red-400' : 
                            log.type === 'warning' ? 'text-amber-400' : 
                            log.type === 'success' ? 'text-emerald-400' : 'text-stone-300'
                        }`}>
                           <span className="opacity-40 select-none">[{String(log.generation).padStart(3, '0')}]</span>
                           <span>{log.message}</span>
                        </div>
                     ))}
                     <div ref={logsEndRef} />
                  </div>
              </div>

              {/* Charts Row */}
              <div className="col-span-12 lg:col-span-4 h-[380px] hover:shadow-lg transition-shadow duration-300">
                 <HardyWeinbergPanel currentStats={currentStats} />
              </div>

              <div className="col-span-12 lg:col-span-8 h-[380px] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300">
                 <EvolutionChart data={history} events={logs} />
              </div>

              {/* AI Analysis */}
              <div className="col-span-12 h-auto min-h-[220px]">
                 <GeminiAnalyst history={history} params={params} />
              </div>

           </div>
           
           <div className="mt-10 mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 text-xs font-medium">
                 <Info className="w-3.5 h-3.5" />
                 Simulation stochastique focalisée sur l'allèle A (Foncé) vs a (Clair) chez <i>Pan troglodytes</i>.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;