/**
 * Future Simulator Page — interactive CO₂ reduction modeller
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sliders, TreePine, TrendingDown, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { useAppContext } from '../context/AppContext';
import { calculateCarbon, applySimulatorSliders, co2ToTrees, generateTrendData } from '../utils/carbonCalculator';
import type { SimulatorSliders } from '../types';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_ASSESSMENT = {
  transport: 'car' as const,
  food: 'mixed' as const,
  electricityKwh: 350,
  shopping: 'medium' as const,
  waste: 'medium' as const,
};

// ─── Slider Control ───────────────────────────────────────────────────────────

interface SliderControlProps {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
  description: string;
  color: string;
}

function SliderControl({ label, icon, value, onChange, description, color }: SliderControlProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="text-white font-semibold text-sm">{label}</div>
            <div className="text-slate-500 text-xs">{description}</div>
          </div>
        </div>
        <div
          className="text-2xl font-black min-w-16 text-right"
          style={{ color }}
        >
          {value}%
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: color }}
          aria-label={`${label} reduction percentage`}
        />
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full pointer-events-none mt-2"
          style={{
            width: `${value}%`,
            background: `linear-gradient(to right, ${color}80, ${color})`,
          }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between text-xs text-slate-700">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ─── Comparison Card ──────────────────────────────────────────────────────────

interface ComparisonCardProps {
  title: string;
  emoji: string;
  total: number;
  items: Array<{ label: string; value: number; color: string; icon: string }>;
  variant: 'current' | 'improved';
  delay?: number;
}

function ComparisonCard({ title, emoji, total, items, variant, delay = 0 }: ComparisonCardProps) {
  const isImproved = variant === 'improved';
  return (
    <GlassCard
      delay={delay}
      glow={isImproved ? 'green' : 'none'}
      className={`border ${isImproved ? 'border-emerald-400/30' : 'border-red-400/20'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className={`font-bold text-lg ${isImproved ? 'text-emerald-400' : 'text-red-400'}`}>
            {title}
          </h3>
          <p className="text-slate-500 text-xs">{isImproved ? 'After improvements' : 'Current trajectory'}</p>
        </div>
      </div>

      {/* Total */}
      <div
        className={`text-5xl font-black mb-1 ${isImproved ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {total}
        <span className="text-xl font-normal text-slate-400"> t CO₂/yr</span>
      </div>

      {/* Breakdown bars */}
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <span className="font-semibold text-white">{item.value} t</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const DEFAULT_SLIDERS: SimulatorSliders = {
  carReduction: 30,
  electricityReduction: 20,
  wasteReduction: 40,
  foodImprovement: 30,
};

export default function SimulatorPage() {
  const navigate = useNavigate();
  const { carbonResult } = useAppContext();
  const [sliders, setSliders] = useState<SimulatorSliders>(DEFAULT_SLIDERS);

  const effectiveResult = carbonResult ?? calculateCarbon(DEMO_ASSESSMENT);
  const baseline = effectiveResult.breakdown;
  const isDemo = !carbonResult;

  // Apply sliders to get improved breakdown
  const improved = useMemo(() => {
    return applySimulatorSliders(
      baseline,
      sliders.carReduction,
      sliders.electricityReduction,
      sliders.wasteReduction,
      sliders.foodImprovement
    );
  }, [baseline, sliders]);

  // Derived metrics
  const co2Saved = Math.max(0, parseFloat((baseline.total - improved.total).toFixed(2)));
  const percentReduction = baseline.total > 0
    ? Math.round((co2Saved / baseline.total) * 100)
    : 0;
  const treesEquivalent = co2ToTrees(co2Saved);

  // Build area chart data
  const chartData = useMemo(() => {
    return generateTrendData(baseline.total, improved.total);
  }, [baseline.total, improved.total]);

  function resetSliders() {
    setSliders(DEFAULT_SLIDERS);
  }

  const breakdownItems = [
    { label: 'Transport', icon: '🚗', color: '#34d399' },
    { label: 'Food', icon: '🍽️', color: '#22d3ee' },
    { label: 'Electricity', icon: '⚡', color: '#60a5fa' },
    { label: 'Shopping', icon: '🛍️', color: '#a78bfa' },
    { label: 'Waste', icon: '🗑️', color: '#f472b6' },
  ];

  const currentItems = breakdownItems.map((b) => ({
    ...b,
    value: baseline[b.label.toLowerCase() as keyof typeof baseline] as number,
  }));
  const improvedItems = breakdownItems.map((b) => ({
    ...b,
    value: improved[b.label.toLowerCase() as keyof typeof improved] as number,
  }));

  return (
    <PageTransition>
      <div className="min-h-screen animated-bg text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-400 font-medium">Interactive Modelling</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-black"
              >
                <span className="gradient-text">Future Simulator</span>
              </motion.h1>
              {isDemo && <p className="text-amber-400 text-sm mt-1">⚠️ Using demo data</p>}
            </div>

            <div className="flex gap-3">
              {isDemo && (
                <motion.button
                  onClick={() => navigate('/assessment')}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl font-bold text-slate-900 text-sm"
                >
                  Take Assessment <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
              <button
                onClick={resetSliders}
                className="flex items-center gap-2 px-4 py-2.5 glass border border-slate-700 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Impact summary strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              {
                icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
                value: `${percentReduction}%`,
                label: 'Reduction',
                color: 'text-emerald-400',
              },
              {
                icon: <Zap className="w-5 h-5 text-cyan-400" />,
                value: `${co2Saved} t`,
                label: 'CO₂ Saved/yr',
                color: 'text-cyan-400',
              },
              {
                icon: <TreePine className="w-5 h-5 text-green-400" />,
                value: treesEquivalent.toLocaleString(),
                label: 'Trees Equivalent',
                color: 'text-green-400',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass rounded-2xl p-4 text-center border border-slate-700/50"
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main content: sliders + comparison */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Sliders panel */}
            <GlassCard delay={0.3} className="lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Adjust Lifestyle</h2>
                <Sliders className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-8">
                <SliderControl
                  label="Reduce Car Usage"
                  icon="🚗"
                  value={sliders.carReduction}
                  onChange={(v) => setSliders((s) => ({ ...s, carReduction: v }))}
                  description="Switch to public transit / cycling"
                  color="#34d399"
                />
                <SliderControl
                  label="Reduce Electricity"
                  icon="⚡"
                  value={sliders.electricityReduction}
                  onChange={(v) => setSliders((s) => ({ ...s, electricityReduction: v }))}
                  description="Energy efficiency & conservation"
                  color="#60a5fa"
                />
                <SliderControl
                  label="Waste Reduction"
                  icon="♻️"
                  value={sliders.wasteReduction}
                  onChange={(v) => setSliders((s) => ({ ...s, wasteReduction: v }))}
                  description="Composting & better recycling"
                  color="#f472b6"
                />
                <SliderControl
                  label="Improve Food Habits"
                  icon="🥗"
                  value={sliders.foodImprovement}
                  onChange={(v) => setSliders((s) => ({ ...s, foodImprovement: v }))}
                  description="Shift toward plant-based diet"
                  color="#22d3ee"
                />
              </div>
            </GlassCard>

            {/* Comparison cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <ComparisonCard
                  title="Current Lifestyle"
                  emoji="📊"
                  total={baseline.total}
                  items={currentItems}
                  variant="current"
                  delay={0.35}
                />
                <ComparisonCard
                  title="Improved Lifestyle"
                  emoji="🌿"
                  total={improved.total}
                  items={improvedItems}
                  variant="improved"
                  delay={0.4}
                />
              </div>

              {/* Reduction highlight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-6 border border-emerald-400/20"
              >
                <h3 className="text-white font-bold mb-4">Environmental Equivalence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { emoji: '🌳', value: treesEquivalent.toLocaleString(), label: 'Trees planted' },
                    { emoji: '✈️', value: `${Math.round(co2Saved / 0.255)}`, label: 'Flights avoided' },
                    { emoji: '🚗', value: `${Math.round(co2Saved / 0.00021).toLocaleString()}`, label: 'km not driven' },
                    { emoji: '💡', value: `${Math.round(co2Saved / 0.00045).toLocaleString()}`, label: 'kWh saved' },
                  ].map((eq) => (
                    <div key={eq.label} className="text-center glass-light rounded-xl p-3">
                      <div className="text-3xl mb-1">{eq.emoji}</div>
                      <div className="text-emerald-400 font-black text-lg">{eq.value}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{eq.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Area chart: 10-year trajectory */}
          <GlassCard delay={0.55}>
            <h2 className="text-white font-bold text-lg mb-6">10-Year Emission Trajectory</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="improvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit="t"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  {/* Paris Agreement 2°C target line */}
                  <ReferenceLine y={2} stroke="#60a5fa" strokeDasharray="5 5" label={{ value: 'Paris 2°C target', fill: '#60a5fa', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#f87171"
                    strokeWidth={2.5}
                    fill="url(#currentGradient)"
                    name="Current Lifestyle"
                  />
                  <Area
                    type="monotone"
                    dataKey="improved"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    fill="url(#improvedGradient)"
                    name="Improved Lifestyle"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
              {[
                { color: '#f87171', label: 'Current Lifestyle' },
                { color: '#34d399', label: 'Improved Lifestyle' },
                { color: '#60a5fa', label: 'Paris 2°C Target' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Bottom CTA */}
          {isDemo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 glass rounded-2xl p-8 border border-emerald-400/20 text-center"
            >
              <h3 className="text-white font-bold text-xl mb-2">
                Ready to see your real numbers?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Complete the 5-minute assessment to get personalised projections based on your actual lifestyle.
              </p>
              <motion.button
                onClick={() => navigate('/assessment')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl font-bold text-slate-900"
              >
                Start Your Assessment
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
