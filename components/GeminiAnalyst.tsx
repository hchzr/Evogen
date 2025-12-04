import React, { useState } from 'react';
import { analyzeSimulation } from '../services/geminiService';
import { GenerationStats, SimulationParams } from '../types';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';

interface Props {
  history: GenerationStats[];
  params: SimulationParams;
}

export const GeminiAnalyst: React.FC<Props> = ({ history, params }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeSimulation(history, params);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Analyse IA
        </h3>
        {!analysis && !loading && (
          <button 
            onClick={handleAnalyze}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors font-medium shadow-sm flex items-center gap-1"
          >
            Générer rapport
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto text-sm text-slate-700 leading-relaxed custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
             <span>Analyse des tendances génétiques...</span>
          </div>
        ) : analysis ? (
          <div className="prose prose-sm prose-indigo">
             <p>{analysis}</p>
             <button 
                onClick={() => setAnalysis(null)} 
                className="mt-4 text-xs text-indigo-500 hover:text-indigo-700 underline"
             >
                Nouvelle analyse
             </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
             <BookOpen className="w-8 h-8 text-indigo-200 mb-2" />
             <p className="text-slate-500">
               Demandez à l'IA d'analyser vos résultats pour comprendre les forces évolutives en jeu (Dérive, Sélection, etc.).
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
