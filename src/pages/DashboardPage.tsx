/**
 * Dashboard Page — carbon results, charts, and score card
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { ArrowRight, RotateCcw, Zap, TrendingDown, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { useAppContext } from '../context/AppContext';
import { generateTrendData, calculateCarbon } from '../utils/carbonCalculator';
import type { EmissionBreakdown } from '../types';

// ─── Demo Data for first-time visitors ────────────────────────────────────────

const DEMO_ASSESSMENT = {
  transport: 'car' as const,
  food: 'mixed' as const,
  electricityKwh: 350,
  shopping: 'medium' as const,
  waste: 'medium' as const,
};

// ─── Emission Colors ──────────────────────────────────────────────────────────

const EMISSION_COLORS: Record<string, string> = {
  transport: '#34d399',
  food: '#22d3ee',
  electricity: '#60a5fa',
  shopping: '#a78bfa',
  waste: '#f472b6',
};

const EMISSION_ICONS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  electricity: '⚡',
  shopping: '🛍️',
  waste: '🗑️',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-emerald-400/20 text-sm">
      <div className="font-semibold text-white capitalize">{payload[0].name}</div>
      <div className="text-emerald-400">{payload[0].value} t CO₂</div>
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-emerald-400/20 text-sm space-y-1">
      <div className="font-semibold text-white">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name.replace('_', ' ')}:</span>
          <span style={{ color: p.color }} className="font-bold">{p.value} t</span>
        </div>
      ))}
    </div>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
        {/* Score arc */}
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-black"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-slate-500 text-xs">/ 100</span>
      </div>
    </div>
  );
}

// ─── Emission Bar ─────────────────────────────────────────────────────────────

function EmissionBar({ category, value, total }: { category: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const color = EMISSION_COLORS[category];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>{EMISSION_ICONS[category]}</span>
          <span className="text-slate-300 capitalize">{category}</span>
        </div>
        <span className="font-bold text-white">{value} t</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { carbonResult, resetAll } = useAppContext();

  // Use demo data if no assessment has been done yet
  const result = useMemo(() => {
    if (carbonResult) return carbonResult;
    return calculateCarbon(DEMO_ASSESSMENT);
  }, [carbonResult]);

  const isDemo = !carbonResult;

  const breakdown = result.breakdown;

  // Build pie chart data
  const pieData = useMemo(() => {
    const keys: Array<keyof EmissionBreakdown> = ['transport', 'food', 'electricity', 'shopping', 'waste'];
    return keys.map((k) => ({
      name: k,
      value: breakdown[k],
      color: EMISSION_COLORS[k],
    }));
  }, [breakdown]);

  // Build trend data (assume ~10% improvement if AI insights applied)
  const trendData = useMemo(() => {
    const improvedTotal = Math.max(1, breakdown.total * 0.75);
    return generateTrendData(breakdown.total, improvedTotal);
  }, [breakdown]);

  // Biggest emission source
  const biggestSource = useMemo(() => {
    const keys: Array<keyof EmissionBreakdown> = ['transport', 'food', 'electricity', 'shopping', 'waste'];
    return keys.reduce((a, b) => (breakdown[a] > breakdown[b] ? a : b));
  }, [breakdown]);

  return (
    <PageTransition>
      <div className="min-h-screen animated-bg text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black"
              >
                <span className="gradient-text">Your Dashboard</span>
              </motion.h1>
              <p className="text-slate-400 mt-1">
                {isDemo ? '⚠️ Viewing demo data — ' : ''}
                Annual carbon footprint overview
              </p>
            </div>
            <div className="flex gap-3">
              {isDemo ? (
                <motion.button
                  onClick={() => navigate('/assessment')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl font-bold text-slate-900 text-sm"
                >
                  Start Real Assessment
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-4 py-2.5 glass border border-slate-700 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <motion.button
                    onClick={() => navigate('/insights')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl font-bold text-slate-900 text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Get AI Insights
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Top row: Score + Annual Emissions + Biggest Source */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Score Card */}
            <GlassCard glow="green" delay={0.05} className="flex flex-col items-center text-center">
              <div className="text-2xl mb-1">{result.badge}</div>
              <h3 className="text-slate-400 text-sm mb-4">Sustainability Score</h3>
              <ScoreRing score={result.score} />
              <div className="mt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border border-emerald-400/20"
                >
                  <div className="font-bold text-emerald-400">{result.category}</div>
                </motion.div>
              </div>
            </GlassCard>

            {/* Annual Emissions */}
            <GlassCard delay={0.1} className="flex flex-col">
              <h3 className="text-slate-400 text-sm mb-4">Annual CO₂ Emissions</h3>
              <div className="flex-1 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-6xl font-black gradient-text mb-1"
                >
                  {breakdown.total}
                </motion.div>
                <div className="text-slate-400">tonnes CO₂/year</div>

                <div className="mt-6 space-y-3">
                  {(['transport', 'food', 'electricity', 'shopping', 'waste'] as const).map((cat) => (
                    <EmissionBar key={cat} category={cat} value={breakdown[cat]} total={breakdown.total} />
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Biggest Source */}
            <GlassCard delay={0.15} className="flex flex-col">
              <h3 className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Biggest Emission Source
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                  className="text-7xl mb-4"
                >
                  {EMISSION_ICONS[biggestSource]}
                </motion.div>
                <div className="text-2xl font-bold text-white capitalize mb-1">{biggestSource}</div>
                <div
                  className="text-3xl font-black mb-3"
                  style={{ color: EMISSION_COLORS[biggestSource] }}
                >
                  {breakdown[biggestSource as keyof EmissionBreakdown]} t CO₂
                </div>
                <div className="text-sm text-slate-400">
                  {Math.round((breakdown[biggestSource as keyof EmissionBreakdown] / breakdown.total) * 100)}% of total emissions
                </div>

                <motion.button
                  onClick={() => navigate('/insights')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-6 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <TrendingDown className="w-4 h-4" />
                  Get reduction tips
                </motion.button>
              </div>
            </GlassCard>
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <GlassCard delay={0.2}>
              <h3 className="text-white font-bold text-lg mb-6">Emission Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={entry.color}
                          strokeOpacity={0.3}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-400 capitalize">{d.name}</span>
                    <span className="text-white font-medium">{d.value}t</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Line Chart: 10-year projection */}
            <GlassCard delay={0.25}>
              <h3 className="text-white font-bold text-lg mb-6">10-Year Emission Projection</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      unit="t"
                    />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {value.replace('_', ' ')}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#f87171"
                      strokeWidth={2.5}
                      dot={false}
                      name="current"
                    />
                    <Line
                      type="monotone"
                      dataKey="improved"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      dot={false}
                      name="improved"
                    />
                    <Line
                      type="monotone"
                      dataKey="global_avg"
                      stroke="#60a5fa"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                      name="global_avg"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Bottom CTA row */}
          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <motion.button
              onClick={() => navigate('/insights')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 text-left border border-blue-400/20 hover:border-blue-400/40 transition-all group"
            >
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-white font-bold text-lg mb-2">AI-Powered Recommendations</h3>
              <p className="text-slate-400 text-sm">Get personalised strategies from Gemini AI to reduce your specific footprint.</p>
              <div className="mt-4 flex items-center gap-2 text-blue-400 font-medium text-sm group-hover:text-blue-300">
                View AI Insights <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/simulator')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 text-left border border-cyan-400/20 hover:border-cyan-400/40 transition-all group"
            >
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="text-white font-bold text-lg mb-2">Future Simulator</h3>
              <p className="text-slate-400 text-sm">Interactively model how lifestyle changes reduce your carbon footprint over time.</p>
              <div className="mt-4 flex items-center gap-2 text-cyan-400 font-medium text-sm group-hover:text-cyan-300">
                Open Simulator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
