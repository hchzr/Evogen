import { Genotype, Individual, SimulationParams, GenerationStats } from '../types';

// Helper to create unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const getPhenotype = (genotype: Genotype) => {
    return genotype === 'aa' ? 'Pelage Clair (Récessif)' : 'Pelage Foncé (Dominant)';
};

export const createInitialPopulation = (size: number, p: number): Individual[] => {
  const pop: Individual[] = [];
  for (let i = 0; i < size; i++) {
    const rand1 = Math.random();
    const rand2 = Math.random();
    const allele1 = rand1 < p ? 'A' : 'a';
    const allele2 = rand2 < p ? 'A' : 'a';
    
    let genotype: Genotype;
    if (allele1 === 'A' && allele2 === 'A') genotype = 'AA';
    else if (allele1 === 'a' && allele2 === 'a') genotype = 'aa';
    else genotype = 'Aa';

    pop.push({ id: generateId(), genotype, phenotype: getPhenotype(genotype) });
  }
  return pop;
};

export const calculateStats = (pop: Individual[], generation: number, expectedP: number | null): GenerationStats => {
  let countAA = 0;
  let countAa = 0;
  let countaa = 0;

  pop.forEach(ind => {
    if (ind.genotype === 'AA') countAA++;
    else if (ind.genotype === 'Aa') countAa++;
    else countaa++;
  });

  const total = pop.length;
  const freqA = total === 0 ? 0 : (2 * countAA + countAa) / (2 * total);
  const freqa = 1 - freqA;

  // Advanced Stats
  const heterozygosityObs = total === 0 ? 0 : countAa / total;
  const heterozygosityExp = 2 * freqA * freqa;
  
  // Fixation Index (F) -> Measure of Inbreeding / Deviation from HW
  const fixationIndex = heterozygosityExp === 0 ? 0 : 1 - (heterozygosityObs / heterozygosityExp);

  return {
    generation,
    freqA,
    freqa,
    countAA,
    countAa,
    countaa,
    expectedFreqA: expectedP ?? freqA,
    totalPopulation: total,
    heterozygosityObs,
    heterozygosityExp,
    fixationIndex
  };
};

// Deterministic Prediction
export const calculateExpectedNextP = (currentP: number, params: SimulationParams): number => {
  const q = 1 - currentP;
  const wAA = params.fitnessAA;
  const wAa = params.fitnessAa;
  const waa = params.fitnessaa;

  const meanFitness = (currentP * currentP * wAA) + (2 * currentP * q * wAa) + (q * q * waa);
  
  if (meanFitness === 0) return 0;

  let nextP = ((currentP * currentP * wAA) + (currentP * q * wAa)) / meanFitness;

  // Mutation
  const u = params.mutationRate; 
  const v = params.mutationRate;
  nextP = nextP * (1 - u) + (1 - nextP) * v;

  // Migration
  // Assuming migrants come from a balanced population (p=0.5) since the control was removed.
  const m = params.migrationRate;
  const pm = 0.5; 
  nextP = nextP * (1 - m) + pm * m;

  return nextP;
};

// Stochastic Simulation
export const simulateNextGeneration = (currentPop: Individual[], params: SimulationParams): Individual[] => {
  const newPop: Individual[] = [];
  
  // 1. SELECTION (Survival phase)
  const survivors = currentPop.filter(ind => {
    let fitness = 0;
    if (ind.genotype === 'AA') fitness = params.fitnessAA;
    else if (ind.genotype === 'Aa') fitness = params.fitnessAa;
    else fitness = params.fitnessaa;
    return Math.random() < fitness;
  });

  if (survivors.length < 2) return []; // Extinction

  // 2. REPRODUCTION (Panmixie Random Mating & Drift)
  for (let i = 0; i < params.populationSize; i++) {
    // Pick Parents Randomly
    const p1 = survivors[Math.floor(Math.random() * survivors.length)];
    const p2 = survivors[Math.floor(Math.random() * survivors.length)];

    // Gametogenesis
    const getGamete = (parent: Individual): 'A' | 'a' => {
      if (parent.genotype === 'AA') return 'A';
      if (parent.genotype === 'aa') return 'a';
      return Math.random() < 0.5 ? 'A' : 'a';
    };

    let allele1 = getGamete(p1);
    let allele2 = getGamete(p2);

    // Mutation
    if (Math.random() < params.mutationRate) allele1 = allele1 === 'A' ? 'a' : 'A';
    if (Math.random() < params.mutationRate) allele2 = allele2 === 'A' ? 'a' : 'A';

    let genotype: Genotype;
    if (allele1 === 'A' && allele2 === 'A') genotype = 'AA';
    else if (allele1 === 'a' && allele2 === 'a') genotype = 'aa';
    else genotype = 'Aa';

    newPop.push({ id: generateId(), genotype, phenotype: getPhenotype(genotype) });
  }

  // 3. MIGRATION (Gene Flow)
  const numMigrants = Math.floor(params.populationSize * params.migrationRate);
  for (let i = 0; i < numMigrants; i++) {
     const replaceIdx = Math.floor(Math.random() * newPop.length);
     
     // Migrants have 50/50 allele frequency (p_m = 0.5)
     const rand1 = Math.random();
     const rand2 = Math.random();
     const allele1 = rand1 < 0.5 ? 'A' : 'a';
     const allele2 = rand2 < 0.5 ? 'A' : 'a';
     
     let genotype: Genotype;
     if (allele1 === 'A' && allele2 === 'A') genotype = 'AA';
     else if (allele1 === 'a' && allele2 === 'a') genotype = 'aa';
     else genotype = 'Aa';

     newPop[replaceIdx] = { id: generateId(), genotype, phenotype: getPhenotype(genotype) };
  }

  return newPop;
};