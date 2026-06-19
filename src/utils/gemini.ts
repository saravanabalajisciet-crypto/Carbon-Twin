/**
 * Gemini AI Integration
 * Generates personalised carbon reduction recommendations.
 */

import type { AssessmentData, CarbonResult, AIInsights, Recommendation } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// ─── Build Prompt ─────────────────────────────────────────────────────────────

function buildPrompt(assessment: AssessmentData, result: CarbonResult): string {
  return `You are a climate science expert and sustainability coach. Analyse this user's carbon footprint data and provide highly personalised, actionable recommendations.

USER PROFILE:
- Transport: ${assessment.transport.replace('_', ' ')}
- Food habits: ${assessment.food.replace('_', ' ')}
- Monthly electricity: ${assessment.electricityKwh} kWh
- Shopping habits: ${assessment.shopping}
- Waste generation: ${assessment.waste}

CURRENT EMISSIONS (tonnes CO₂/year):
- Transport: ${result.breakdown.transport}
- Food: ${result.breakdown.food}
- Electricity: ${result.breakdown.electricity}
- Shopping: ${result.breakdown.shopping}
- Waste: ${result.breakdown.waste}
- TOTAL: ${result.breakdown.total}
- Sustainability Score: ${result.score}/100 (${result.category})

Please respond ONLY with a valid JSON object (no markdown, no code fences) in this exact structure:
{
  "summary": "2-3 sentence personalised summary of their carbon footprint situation",
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Short action title",
      "description": "Detailed, personalised explanation (2-3 sentences)",
      "savingTonnes": 0.5,
      "priority": "high",
      "icon": "🚗",
      "category": "transport"
    }
  ],
  "totalPotentialSaving": 1.5,
  "improvedScore": 75
}

Generate exactly 5 recommendations. Priority must be "high", "medium", or "low". Category must be one of: transport, food, electricity, shopping, waste. Make recommendations specific to their actual habits.`;
}

// ─── Parse AI Response ────────────────────────────────────────────────────────

function parseResponse(text: string, result: CarbonResult): AIInsights {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    summary: parsed.summary ?? 'Based on your assessment, here are your personalised insights.',
    recommendations: (parsed.recommendations ?? []) as Recommendation[],
    totalPotentialSaving: parsed.totalPotentialSaving ?? 0,
    improvedScore: parsed.improvedScore ?? result.score,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Fallback Recommendations ────────────────────────────────────────────────

function generateFallbackInsights(
  assessment: AssessmentData,
  result: CarbonResult
): AIInsights {
  const recs: Recommendation[] = [];

  if (assessment.transport === 'car') {
    recs.push({
      id: 'rec_transport',
      title: 'Switch to Public Transit or EV',
      description:
        'Replacing your car commute with public transit 3 days a week could cut transport emissions by up to 40%. Consider an electric vehicle for longer trips.',
      savingTonnes: 0.9,
      priority: 'high',
      icon: '🚌',
      category: 'transport',
    });
  } else if (assessment.transport === 'electric_vehicle') {
    recs.push({
      id: 'rec_transport',
      title: 'Optimise EV Charging with Renewables',
      description:
        'Schedule charging during off-peak hours when grids use more renewables. Consider a home solar panel to charge your EV with clean energy.',
      savingTonnes: 0.2,
      priority: 'medium',
      icon: '☀️',
      category: 'electricity',
    });
  } else {
    recs.push({
      id: 'rec_transport',
      title: 'Maintain Your Eco-Friendly Commute',
      description:
        'Your low-emission transport choice is already making a difference. Encourage others to follow suit and explore carpooling options.',
      savingTonnes: 0.05,
      priority: 'low',
      icon: '🚲',
      category: 'transport',
    });
  }

  if (assessment.food === 'heavy_meat') {
    recs.push({
      id: 'rec_food',
      title: 'Adopt Meatless Mondays',
      description:
        'Cutting meat consumption just one day per week can save up to 0.3 tonnes CO₂ annually. Shift gradually toward plant-rich meals.',
      savingTonnes: 0.6,
      priority: 'high',
      icon: '🥗',
      category: 'food',
    });
  } else if (assessment.food === 'mixed') {
    recs.push({
      id: 'rec_food',
      title: 'Shift to Plant-Based Meals 3×/Week',
      description:
        'Increasing plant-based meals from your current mixed diet can reduce food emissions by 30%. Focus on legumes, grains, and seasonal vegetables.',
      savingTonnes: 0.3,
      priority: 'medium',
      icon: '🌿',
      category: 'food',
    });
  } else {
    recs.push({
      id: 'rec_food',
      title: 'Support Local & Organic Produce',
      description:
        'Your vegetarian diet is excellent. Further reduce impact by choosing local, seasonal, and organic produce to cut food-mile emissions.',
      savingTonnes: 0.1,
      priority: 'low',
      icon: '🥦',
      category: 'food',
    });
  }

  if (assessment.electricityKwh > 300) {
    recs.push({
      id: 'rec_electricity',
      title: 'Reduce Electricity Consumption',
      description:
        `At ${assessment.electricityKwh} kWh/month, you're above the average. Switch to LED lighting, upgrade to energy-efficient appliances, and optimise HVAC settings.`,
      savingTonnes: 0.4,
      priority: 'high',
      icon: '💡',
      category: 'electricity',
    });
  } else {
    recs.push({
      id: 'rec_electricity',
      title: 'Install Smart Energy Monitoring',
      description:
        'Your electricity use is reasonable. A smart meter and home energy monitoring system can identify waste and push savings further.',
      savingTonnes: 0.1,
      priority: 'low',
      icon: '🔌',
      category: 'electricity',
    });
  }

  if (assessment.shopping === 'high') {
    recs.push({
      id: 'rec_shopping',
      title: 'Embrace Circular Economy Habits',
      description:
        'High shopping habits generate significant embodied carbon. Try secondhand markets, repair cafés, and a 30-day "no new items" challenge.',
      savingTonnes: 0.8,
      priority: 'high',
      icon: '♻️',
      category: 'shopping',
    });
  } else {
    recs.push({
      id: 'rec_shopping',
      title: 'Choose Sustainable Brands',
      description:
        'Prioritise brands with verified sustainability credentials (B-Corp, Fair Trade). Quality over quantity extends product lifespan and cuts waste.',
      savingTonnes: 0.2,
      priority: 'medium',
      icon: '🏷️',
      category: 'shopping',
    });
  }

  if (assessment.waste === 'high') {
    recs.push({
      id: 'rec_waste',
      title: 'Start Composting & Zero-Waste Journey',
      description:
        'Composting organic waste diverts methane from landfills. Pair with a strict recycling routine and refuse single-use plastics.',
      savingTonnes: 0.5,
      priority: 'high',
      icon: '🌱',
      category: 'waste',
    });
  } else {
    recs.push({
      id: 'rec_waste',
      title: 'Upgrade Your Recycling System',
      description:
        'Add a vermi-composting bin for food scraps and explore e-waste recycling programs for electronics. Small changes compound over time.',
      savingTonnes: 0.15,
      priority: 'medium',
      icon: '🗑️',
      category: 'waste',
    });
  }

  const totalPotentialSaving = recs.reduce((sum, r) => sum + r.savingTonnes, 0);
  const improvedTotal = Math.max(0, result.breakdown.total - totalPotentialSaving);
  const improvedScore = Math.min(100, Math.round(100 - (improvedTotal / 8) * 100));

  return {
    summary: `Your annual carbon footprint is ${result.breakdown.total} tonnes CO₂, giving you a sustainability score of ${result.score}/100 (${result.category}). Your biggest emission source is ${
      Object.entries(result.breakdown)
        .filter(([k]) => k !== 'total')
        .sort(([, a], [, b]) => (b as number) - (a as number))[0][0]
    }. By implementing the recommendations below, you could potentially save ${totalPotentialSaving.toFixed(1)} tonnes of CO₂ per year.`,
    recommendations: recs,
    totalPotentialSaving: parseFloat(totalPotentialSaving.toFixed(2)),
    improvedScore,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Main API Call ────────────────────────────────────────────────────────────

export async function getAIInsights(
  assessment: AssessmentData,
  result: CarbonResult
): Promise<AIInsights> {
  // No API key → use smart fallback
  if (!API_KEY) {
    await new Promise((res) => setTimeout(res, 1800)); // simulate loading
    return generateFallbackInsights(assessment, result);
  }

  try {
    const prompt = buildPrompt(assessment, result);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API error, using fallback:', response.status);
      return generateFallbackInsights(assessment, result);
    }

    const data = await response.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) return generateFallbackInsights(assessment, result);

    return parseResponse(text, result);
  } catch (err) {
    console.warn('Gemini call failed, using fallback:', err);
    return generateFallbackInsights(assessment, result);
  }
}
