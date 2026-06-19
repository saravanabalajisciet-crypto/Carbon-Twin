// ─── Assessment Types ─────────────────────────────────────────────────────────

export type TransportMode =
  | 'bicycle'
  | 'walking'
  | 'bus'
  | 'train'
  | 'car'
  | 'electric_vehicle';

export type FoodHabit = 'vegetarian' | 'mixed' | 'heavy_meat';

export type ShoppingHabit = 'low' | 'medium' | 'high';

export type WasteLevel = 'low' | 'medium' | 'high';

export interface AssessmentData {
  transport: TransportMode;
  food: FoodHabit;
  electricityKwh: number; // monthly kWh
  shopping: ShoppingHabit;
  waste: WasteLevel;
}

// ─── Carbon Calculation Types ─────────────────────────────────────────────────

export interface EmissionBreakdown {
  transport: number;   // tonnes CO₂/year
  food: number;
  electricity: number;
  shopping: number;
  waste: number;
  total: number;
}

export interface CarbonResult {
  breakdown: EmissionBreakdown;
  score: number;        // 0–100 (higher = better)
  category: BadgeCategory;
  badge: string;        // emoji badge
}

export type BadgeCategory =
  | 'Planet Guardian'
  | 'Eco Warrior'
  | 'Green Learner'
  | 'Carbon Explorer';

// ─── AI Insight Types ─────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  savingTonnes: number;   // estimated annual saving
  priority: 'high' | 'medium' | 'low';
  icon: string;           // emoji icon
  category: keyof EmissionBreakdown;
}

export interface AIInsights {
  summary: string;
  recommendations: Recommendation[];
  totalPotentialSaving: number;
  improvedScore: number;
  generatedAt: string;
}

// ─── Simulator Types ──────────────────────────────────────────────────────────

export interface SimulatorSliders {
  carReduction: number;        // 0–100 %
  electricityReduction: number;
  wasteReduction: number;
  foodImprovement: number;     // 0–100 % shift toward plant-based
}

export interface SimulatorProjection {
  current: EmissionBreakdown;
  improved: EmissionBreakdown;
  percentageReduction: number;
  co2Saved: number;
  treesEquivalent: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  assessment: AssessmentData | null;
  carbonResult: CarbonResult | null;
  aiInsights: AIInsights | null;
}

// ─── Chart Data Types ─────────────────────────────────────────────────────────

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface LineChartDataPoint {
  year: string;
  current: number;
  improved: number;
  global_avg: number;
}
