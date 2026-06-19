/**
 * AI Insights Page — Gemini-powered personalised recommendations
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingDown, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppContext } from '../context/AppContext';
import { getAIInsights } from '../utils/gemini';
import { calculateCarbon } from '../utils/carbonCalculator';
import type { Recommendation } from '../types';

// ─── Demo fallback data ────────────────────────────────────────────────────────

const DEMO_ASSESSMENT = {
  transport: 'car' as const,
  food: 'mixed' as const,
  electricityKwh: 350,
  shopping: 'medium' as const,
  waste: 'medium' as const,
};

// ─── Priority styles ──────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  high: {
    badge: 'bg-red-400/20 text-red-300 border-red-400/30',
    border: 'border-red-400/20',
    glow: 'hover:border-red-400/40',
    icon: '🔴',
  },
  medium: {
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    border: 'border-amber-400/20',
    glow: 'hover:border-amber-400/40',
    icon: '🟡',
  },
  low: {
    badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    border: 'border-emerald-400/20',
    glow: 'hover:border-emerald-400/40',
    icon: '🟢',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'from-emerald-400/20 to-teal-400/10',
  food: 'from-cyan-400/20 to-blue-400/10',
  electricity: 'from-yellow-400/20 to-orange-400/10',
  shopping: 'from-purple-400/20 to-pink-400/10',
  waste: 'from-green-400/20 to-emerald-400/10',
};

// ─── Recommendation Card ──────────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const styles = PRIORITY_STYLES[rec.priority];
  const catGradient = CATEGORY_COLORS[rec.category] ?? 'from-slate-400/20 to-slate-400/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`relative glass rounded-2xl p-6 border ${styles.border} ${styles.glow} transition-all duration-300 overflow-hidden group`}
    >
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${catGradient} rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{rec.icon}</div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{rec.title}</h3>
              <span className="text-xs text-slate-500 capitalize">{rec.category}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${styles.badge}`}>
            {styles.icon}
            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{rec.description}</p>

        {/* Savings */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-700/50">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-400">Potential saving:</span>
          <span className="text-emerald-400 font-bold">~{rec.savingTonnes} t CO₂/year</span>
          <span className="text-slate-600 text-xs ml-auto">
            ≈ {Math.round(rec.savingTonnes / 0.021)} trees/year
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function InsightsLoading() {
  const messages = [
    'Analysing your carbon profile...',
    'Consulting climate databases...',
    'Generating personalised recommendations...',
    'Calculating potential savings...',
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen animated-bg text-white pt-20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 flex items-center justify-center border border-emerald-400/20">
            <Brain className="w-12 h-12 text-emerald-400" />
          </div>
          {/* Orbit particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
            >
              <div
                className="absolute w-3 h-3 rounded-full bg-emerald-400/60"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translateY(-${48 + i * 10}px)`,
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.h2 className="text-2xl font-bold text-white mb-3">
          AI is Analysing Your Data
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-slate-400 mb-8"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const navigate = useNavigate();
  const { assessment, carbonResult, aiInsights, setAIInsights } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve the actual data to use (real or demo)
  const effectiveAssessment = assessment ?? DEMO_ASSESSMENT;
  const effectiveResult = carbonResult ?? calculateCarbon(DEMO_ASSESSMENT);
  const isDemo = !assessment;

  // Auto-load insights if not yet loaded
  useEffect(() => {
    if (!aiInsights) {
      loadInsights();
    }
  }, []);

  async function loadInsights() {
    setLoading(true);
    setError(null);
    try {
      const insights = await getAIInsights(effectiveAssessment, effectiveResult);
      setAIInsights(insights);
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <InsightsLoading />;

  return (
    <PageTransition>
      <div className="min-h-screen animated-bg text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-400 font-medium">Powered by Gemini AI</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-black"
              >
                <span className="gradient-text">AI Insights</span>
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
                onClick={loadInsights}
                className="flex items-center gap-2 px-4 py-2.5 glass border border-slate-700 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-4 border border-red-400/30 flex items-center gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={loadInsights} className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium">
                Retry
              </button>
            </motion.div>
          )}

          {aiInsights ? (
            <div className="space-y-6">
              {/* Summary card */}
              <GlassCard glow="blue" delay={0} className="border border-blue-400/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 border border-blue-400/20">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg mb-2">Your Carbon Profile Summary</h2>
                    <p className="text-slate-300 leading-relaxed">{aiInsights.summary}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Savings potential */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: '🌍',
                    label: 'Potential CO₂ Savings',
                    value: `${aiInsights.totalPotentialSaving.toFixed(1)} t`,
                    sub: 'per year',
                    color: 'text-emerald-400',
                  },
                  {
                    icon: '🌳',
                    label: 'Trees Equivalent',
                    value: `${Math.round(aiInsights.totalPotentialSaving / 0.021)}`,
                    sub: 'trees planted/year',
                    color: 'text-green-400',
                  },
                  {
                    icon: '📈',
                    label: 'Score After Improvements',
                    value: `${aiInsights.improvedScore}/100`,
                    sub: 'sustainability score',
                    color: 'text-blue-400',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="glass rounded-2xl p-5 text-center border border-slate-700/50"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-500 text-xs mt-1">{stat.sub}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Priority sections */}
              {(['high', 'medium', 'low'] as const).map((priority) => {
                const filtered = aiInsights.recommendations.filter((r) => r.priority === priority);
                if (!filtered.length) return null;
                return (
                  <div key={priority}>
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-bold text-white mb-4 flex items-center gap-2"
                    >
                      {PRIORITY_STYLES[priority].icon}
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Actions
                    </motion.h2>
                    <div className="space-y-4">
                      {filtered.map((rec, i) => (
                        <RecommendationCard key={rec.id} rec={rec} index={i} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* CTA to simulator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass rounded-2xl p-6 border border-cyan-400/20 text-center"
              >
                <div className="text-4xl mb-3">🔮</div>
                <h3 className="text-white font-bold text-xl mb-2">See Your Future Impact</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
                  Use our interactive simulator to model exactly how implementing these recommendations
                  reduces your CO₂ footprint over the next decade.
                </p>
                <motion.button
                  onClick={() => navigate('/simulator')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl font-bold text-slate-900"
                >
                  Open Future Simulator
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Generated timestamp */}
              <p className="text-center text-slate-600 text-xs">
                Generated: {new Date(aiInsights.generatedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            !error && (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" message="Generating your personalised insights..." />
              </div>
            )
          )}
        </div>
      </div>
    </PageTransition>
  );
}
