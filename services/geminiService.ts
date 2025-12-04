import { GoogleGenAI } from "@google/genai";
import { GenerationStats, SimulationParams } from "../types";

const API_KEY = process.env.API_KEY;

export const analyzeSimulation = async (
  stats: GenerationStats[],
  params: SimulationParams
): Promise<string> => {
  if (!API_KEY) {
    return "Clé API non configurée.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Intelligent sampling: Start, Middle, End
  const startStat = stats[0];
  const midStat = stats[Math.floor(stats.length / 2)];
  const endStat = stats[stats.length - 1];
  
  const prompt = `
    Agis comme un primatologue expert en génétique. Analyse l'évolution d'une population de Chimpanzés (Pan troglodytes).
    Trait étudié: Couleur du pelage (Allèle A = Foncé Dominant, Allèle a = Clair Récessif).

    CONTEXTE:
    - Taille Population (N): ${params.populationSize}
    - Fitness: wAA=${params.fitnessAA}, wAa=${params.fitnessAa}, waa=${params.fitnessaa}
    - Migration: ${params.migrationRate}

    RÉSULTATS (Génération 0 -> ${endStat.generation}):
    - Fréquence Allèle Foncé (p) : ${startStat.freqA.toFixed(2)} -> ${endStat.freqA.toFixed(2)}
    - Hétérozygotie finale : ${endStat.heterozygosityObs.toFixed(3)} (Attendue: ${endStat.heterozygosityExp.toFixed(3)})
    - Indice de Fixation (F) : ${endStat.fixationIndex.toFixed(3)}

    CONSIGNE:
    1. Quelle force évolutive domine ? (Sélection naturelle sur le camouflage, Dérive génétique due à la petite taille, etc.)
    2. Commente l'état de la population (Perte de diversité ? Fixation de l'allèle foncé ?).
    3. Reste concis (max 4 phrases) et scientifique.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analyse non disponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de l'analyse IA.";
  }
};