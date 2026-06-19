/**
 * Carbon Calculator Utility
 * Calculates annual CO₂ emissions in tonnes based on lifestyle choices.
 * Emission factors sourced from IPCC and IEA data.
 */

import type {
  AssessmentData,
  CarbonResult,
  EmissionBreakdown,
  BadgeCategory,
} from '../types';

// ─── Emission Factors (tonnes CO₂/year) ──────────────────────────────────────

const TRANSPORT_EMISSIONS: Record<string, number> = {
  bicycle: 0.01,
  walking: 0.0,
  bus: 0.9,
  train: 0.3,
  car: 2.4,
  electric_vehicle: 0.6,
};

const FOOD_EMISSIONS: Record<string, number> = {
  vegetarian: 1.0,
  mixed: 2.0,
  heavy_meat: 3.3,
};

// Electricity: 0.00045 tonnes CO₂ per kWh (average grid intensity)
const ELECTRICITY_FACTOR = 0.00045 * 12; // per kWh/month → annual

const SHOPPING_EMISSIONS: Record<string, number> = {
  low: 0.3,
  medium: 1.0,
  high: 2.5,
};

const WASTE_EMISSIONS: Record<string, number> = {
  low: 0.2,
  medium: 0.6,
  high: 1.2,
};

// ─── Score Thresholds ─────────────────────────────────────────────────────────

/** Maps total annual CO₂ (tonnes) → score 0–100. Lower emissions = higher score. */
function calculateScore(totalTonnes: number): number {
  // World avg ~4.7 t/person/year; target < 2 t by 2050
  // Scale: 0 t → 100pts, 8+ t → 0pts
  const score = Math.max(0, Math.min(100, Math.round(100 - (totalTonnes / 8) * 100)));
  return score;
}

function getBadge(score: number): { category: BadgeCategory; badge: string } {
  if (score >= 90) return { category: 'Planet Guardian', badge: '🌍' };
  if (score >= 70) return { category: 'Eco Warrior', badge: '🌱' };
  if (score >= 50) return { category: 'Green Learner', badge: '🍃' };
  return { category: 'Carbon Explorer', badge: '🔥' };
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculateCarbon(data: AssessmentData): CarbonResult {
  const transport = TRANSPORT_EMISSIONS[data.transport] ?? 2.4;
  const food = FOOD_EMISSIONS[data.food] ?? 2.0;
  const electricity = data.electricityKwh * ELECTRICITY_FACTOR;
  const shopping = SHOPPING_EMISSIONS[data.shopping] ?? 1.0;
  const waste = WASTE_EMISSIONS[data.waste] ?? 0.6;

  const total = transport + food + electricity + shopping + waste;

  const breakdown: EmissionBreakdown = {
    transport: parseFloat(transport.toFixed(2)),
    food: parseFloat(food.toFixed(2)),
    electricity: parseFloat(electricity.toFixed(2)),
    shopping: parseFloat(shopping.toFixed(2)),
    waste: parseFloat(waste.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };

  const score = calculateScore(total);
  const { category, badge } = getBadge(score);

  return { breakdown, score, category, badge };
}

// ─── Future Trend Projection ──────────────────────────────────────────────────

export function generateTrendData(
  currentTotal: number,
  improvedTotal: number
): Array<{ year: string; current: number; improved: number; global_avg: number }> {
  const currentYear = new Date().getFullYear();
  const data = [];

  for (let i = 0; i <= 10; i++) {
    const year = String(currentYear + i);
    // Current: slight natural increase
    const current = parseFloat((currentTotal * (1 + i * 0.01)).toFixed(2));
    // Improved: steady decline as habits compound
    const improved = parseFloat(
      Math.max(0.5, improvedTotal * Math.pow(0.96, i)).toFixed(2)
    );
    // Global avg target: declining toward 2050 Paris goal
    const global_avg = parseFloat(Math.max(2, 4.7 - i * 0.15).toFixed(2));

    data.push({ year, current, improved, global_avg });
  }
  return data;
}

// ─── Simulator Projection ─────────────────────────────────────────────────────

export function applySimulatorSliders(
  baseline: EmissionBreakdown,
  carReduction: number,
  electricityReduction: number,
  wasteReduction: number,
  foodImprovement: number
): EmissionBreakdown {
  const transport = parseFloat(
    (baseline.transport * (1 - carReduction / 100)).toFixed(2)
  );
  const electricity = parseFloat(
    (baseline.electricity * (1 - electricityReduction / 100)).toFixed(2)
  );
  const waste = parseFloat(
    (baseline.waste * (1 - wasteReduction / 100)).toFixed(2)
  );
  // Food improvement shifts toward vegetarian emissions
  const vegetarianEmission = 1.0;
  const food = parseFloat(
    (
      baseline.food -
      (baseline.food - vegetarianEmission) * (foodImprovement / 100)
    ).toFixed(2)
  );
  const shopping = baseline.shopping;

  const total = parseFloat(
    (transport + food + electricity + shopping + waste).toFixed(2)
  );

  return { transport, food, electricity, shopping, waste, total };
}

// ─── Trees Equivalent ─────────────────────────────────────────────────────────

/** One mature tree absorbs ~0.021 tonnes CO₂/year */
export function co2ToTrees(tonnes: number): number {
  return Math.round(tonnes / 0.021);
}
