export type Genotype = 'AA' | 'Aa' | 'aa';

export interface Individual {
  id: string;
  genotype: Genotype;
  phenotype: string;
}

export interface SimulationParams {
  populationSize: number;
  initialFreqA: number; // p
  fitnessAA: number; // w11
  fitnessAa: number; // w12
  fitnessaa: number; // w22
  mutationRate: number; // u = v
  migrationRate: number; // m
}

export interface GenerationStats {
  generation: number;
  freqA: number; // p
  freqa: number; // q
  countAA: number;
  countAa: number;
  countaa: number;
  expectedFreqA: number;
  totalPopulation: number;
  heterozygosityObs: number; // Ho
  heterozygosityExp: number; // He = 2pq
  fixationIndex: number; // F = 1 - (Ho/He)
}

export interface LogEntry {
  id: string;
  generation: number;
  message: string;
  type: 'info' | 'danger' | 'success' | 'warning';
}

export interface AnalysisResponse {
  analysis: string;
}