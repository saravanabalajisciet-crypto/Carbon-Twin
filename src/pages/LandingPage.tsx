/**
 * Landing Page — hero + feature cards
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Sliders, Star, Zap, Globe2, TreePine } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';

// ─── Earth SVG Illustration ────────────────────────────────────────────────────

function EarthIllustration() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl scale-150" />

      {/* Orbit rings */}
      {[1, 0.7, 0.5].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-emerald-400/15"
          style={{ transform: `scale(${scale + i * 0.15})` }}
        />
      ))}

      {/* Main globe */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(52,211,153,0.4), 0 0 120px rgba(52,211,153,0.1)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {/* Continent shapes (SVG overlay) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rounded-full opacity-60">
          <path d="M20 30 Q30 20 45 25 Q55 30 50 45 Q45 55 35 50 Q20 48 20 30Z" fill="rgba(255,255,255,0.3)" />
          <path d="M55 20 Q70 15 75 30 Q78 45 65 50 Q55 48 55 35 Q52 25 55 20Z" fill="rgba(255,255,255,0.25)" />
          <path d="M25 60 Q35 55 45 62 Q50 70 40 78 Q28 80 23 70 Q20 63 25 60Z" fill="rgba(255,255,255,0.2)" />
          <path d="M60 60 Q72 55 78 68 Q80 78 70 82 Q60 82 58 73 Q56 65 60 60Z" fill="rgba(255,255,255,0.2)" />
        </svg>
        {/* Ocean shimmer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/30 to-transparent" />
      </motion.div>

      {/* Floating satellites */}
      {[
        { emoji: '🌿', delay: 0, orbitSize: 110 },
        { emoji: '☀️', delay: 2.5, orbitSize: 130 },
        { emoji: '💧', delay: 5, orbitSize: 105 },
      ].map(({ emoji, delay, orbitSize }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-start justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 12 + i * 4, delay, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="glass rounded-full w-10 h-10 flex items-center justify-center text-lg -translate-y-2"
            style={{ marginTop: `${(280 - orbitSize) / 2}px` }}
          >
            {emoji}
          </div>
        </motion.div>
      ))}

      {/* Pulse rings */}
      {[1, 1.4, 1.8].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-8 rounded-full border border-emerald-400/30"
          animate={{ scale: [scale, scale * 1.3], opacity: [0.4, 0] }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  return (
    <GlassCard hover delay={delay} className="group relative overflow-hidden">
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${color}`} />

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-20 border border-current border-opacity-20`}>
        <div className={`${color.includes('emerald') ? 'text-emerald-400' : color.includes('blue') ? 'text-blue-400' : color.includes('cyan') ? 'text-cyan-400' : 'text-teal-400'}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </GlassCard>
  );
}

// ─── Stats Counter ─────────────────────────────────────────────────────────────

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold gradient-text">{value}</div>
      <div className="text-xs sm:text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Carbon Tracking',
      description: 'Precisely measure your annual CO₂ footprint across transport, food, energy, shopping and waste.',
      color: 'bg-emerald-400',
      delay: 0.1,
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI Insights',
      description: 'Gemini-powered personalised recommendations tailored to your specific lifestyle habits.',
      color: 'bg-blue-400',
      delay: 0.2,
    },
    {
      icon: <Sliders className="w-6 h-6" />,
      title: 'Future Simulation',
      description: 'Interactively model your emission trajectory. See exactly how each change reduces your footprint.',
      color: 'bg-cyan-400',
      delay: 0.3,
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Sustainability Score',
      description: 'Earn badges from Carbon Explorer to Planet Guardian as you reduce your environmental impact.',
      color: 'bg-teal-400',
      delay: 0.4,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen animated-bg text-white">
        {/* Background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: text content */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-emerald-400 mb-6 border border-emerald-400/20"
                >
                  <Zap className="w-4 h-4" />
                  AI-Powered Climate Intelligence
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6"
                >
                  Meet Your
                  <br />
                  <span className="gradient-text">Carbon Twin</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg"
                >
                  Discover your environmental impact through AI-driven analysis. Track emissions,
                  simulate future scenarios, and take meaningful steps toward a sustainable lifestyle.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    onClick={() => navigate('/assessment')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl font-bold text-slate-900 text-lg shadow-2xl shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all duration-300"
                  >
                    <Globe2 className="w-5 h-5" />
                    Start Assessment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 glass border border-emerald-400/20 rounded-2xl font-semibold text-emerald-400 hover:bg-emerald-400/10 transition-all duration-300"
                  >
                    View Demo
                  </motion.button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-8 mt-12 pt-8 border-t border-slate-800"
                >
                  <StatBadge value="5 mins" label="Quick Assessment" />
                  <div className="w-px bg-slate-800" />
                  <StatBadge value="AI-Powered" label="Gemini Insights" />
                  <div className="w-px bg-slate-800" />
                  <StatBadge value="100%" label="Private & Free" />
                </motion.div>
              </div>

              {/* Right: Earth illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                <EarthIllustration />
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-slate-600 text-xs">Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-emerald-400/50 to-transparent" />
          </motion.div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your Complete Climate Intelligence Platform
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                From data collection to AI recommendations, Carbon Twin AI covers every aspect of your environmental journey.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 text-lg">Three steps to understanding your carbon impact</p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden sm:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

              {[
                {
                  step: '01',
                  icon: <Globe2 className="w-8 h-8 text-emerald-400" />,
                  title: 'Complete Assessment',
                  desc: 'Answer questions about your transport, food, energy, and shopping habits in under 5 minutes.',
                },
                {
                  step: '02',
                  icon: <Brain className="w-8 h-8 text-blue-400" />,
                  title: 'Get AI Insights',
                  desc: 'Our Gemini-powered engine analyses your data and generates personalised reduction strategies.',
                },
                {
                  step: '03',
                  icon: <TreePine className="w-8 h-8 text-cyan-400" />,
                  title: 'Simulate Your Future',
                  desc: 'Use interactive sliders to see how lifestyle changes compound into massive CO₂ reductions over time.',
                },
              ].map(({ step, icon, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center border border-emerald-400/15 shadow-lg">
                      {icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-black text-slate-900">
                      {step}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <motion.button
                onClick={() => navigate('/assessment')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl font-bold text-slate-900 text-xl shadow-2xl shadow-emerald-400/30 hover:shadow-emerald-400/50 transition-all duration-300"
              >
                Begin Your Carbon Journey
                <ArrowRight className="w-6 h-6" />
              </motion.button>
              <p className="text-slate-500 text-sm mt-4">Free · Private · No account required</p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-7xl mx-auto text-center text-slate-600 text-sm">
            <p>Carbon Twin AI — Built for a sustainable future 🌍</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
