/**
 * Assessment Page — multi-step carbon footprint form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, Bike, Car, Bus, Train, Zap, Footprints } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { useAppContext } from '../context/AppContext';
import { calculateCarbon } from '../utils/carbonCalculator';
import type { AssessmentData, TransportMode, FoodHabit, ShoppingHabit, WasteLevel } from '../types';

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = ['Transport', 'Food', 'Electricity', 'Shopping', 'Waste'];

// ─── Option Button ─────────────────────────────────────────────────────────────

interface OptionButtonProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  description?: string;
  emission?: string;
}

function OptionButton({ label, icon, selected, onClick, description, emission }: OptionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
        selected
          ? 'bg-emerald-400/15 border-emerald-400/50 shadow-lg shadow-emerald-400/10'
          : 'glass border-slate-700/50 hover:border-emerald-400/30 hover:bg-slate-800/50'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? 'bg-emerald-400/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold ${selected ? 'text-emerald-400' : 'text-white'}`}>{label}</div>
        {description && <div className="text-slate-500 text-xs mt-0.5 truncate">{description}</div>}
      </div>
      {emission && (
        <div className={`text-xs px-2 py-1 rounded-lg ${selected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
          {emission}
        </div>
      )}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ─── Step Progress ─────────────────────────────────────────────────────────────

function StepProgress({ current, total, steps }: { current: number; total: number; steps: string[] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < current
                    ? 'bg-emerald-400 text-slate-900'
                    : i === current
                    ? 'bg-emerald-400/20 border-2 border-emerald-400 text-emerald-400'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}
              >
                {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs mt-1.5 font-medium ${i === current ? 'text-emerald-400' : i < current ? 'text-emerald-600' : 'text-slate-600'}`}>
                {step}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${i < current ? 'bg-emerald-400' : 'bg-slate-800'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Initial Form State ────────────────────────────────────────────────────────

const DEFAULT_FORM: AssessmentData = {
  transport: 'car',
  food: 'mixed',
  electricityKwh: 300,
  shopping: 'medium',
  waste: 'medium',
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { setAssessment, setCarbonResult } = useAppContext();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssessmentData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = STEPS.length;

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else handleSubmit();
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
    else navigate('/');
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = calculateCarbon(form);
    setAssessment(form);
    setCarbonResult(result);
    await new Promise((r) => setTimeout(r, 800)); // brief processing animation
    navigate('/dashboard');
  }

  const stepContent = [
    // Step 0: Transport
    <div key="transport" className="space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">How do you get around?</h2>
        <p className="text-slate-400 mt-2">Select your primary mode of daily transport</p>
      </div>
      {[
        { value: 'bicycle', label: 'Bicycle', icon: <Bike className="w-5 h-5" />, desc: 'Human-powered cycling', emission: '0.01 t/yr' },
        { value: 'walking', label: 'Walking', icon: <Footprints className="w-5 h-5" />, desc: 'Zero-emission travel', emission: '0.0 t/yr' },
        { value: 'bus', label: 'Bus / Coach', icon: <Bus className="w-5 h-5" />, desc: 'Public bus transport', emission: '0.9 t/yr' },
        { value: 'train', label: 'Train / Metro', icon: <Train className="w-5 h-5" />, desc: 'Rail-based transport', emission: '0.3 t/yr' },
        { value: 'car', label: 'Petrol / Diesel Car', icon: <Car className="w-5 h-5" />, desc: 'Personal ICE vehicle', emission: '2.4 t/yr' },
        { value: 'electric_vehicle', label: 'Electric Vehicle', icon: <Zap className="w-5 h-5" />, desc: 'Battery-powered EV', emission: '0.6 t/yr' },
      ].map((opt) => (
        <OptionButton
          key={opt.value}
          {...opt}
          selected={form.transport === opt.value}
          onClick={() => setForm((f) => ({ ...f, transport: opt.value as TransportMode }))}
        />
      ))}
    </div>,

    // Step 1: Food
    <div key="food" className="space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">What do you eat?</h2>
        <p className="text-slate-400 mt-2">Food production accounts for ~26% of global emissions</p>
      </div>
      {[
        { value: 'vegetarian', label: 'Vegetarian / Vegan', icon: '🥗', desc: 'Plant-based diet, no or minimal meat', emission: '1.0 t/yr' },
        { value: 'mixed', label: 'Mixed Diet', icon: '🍽️', desc: 'Balanced mix of meat and plant foods', emission: '2.0 t/yr' },
        { value: 'heavy_meat', label: 'Heavy Meat Consumption', icon: '🥩', desc: 'Meat-centred diet most days', emission: '3.3 t/yr' },
      ].map((opt) => (
        <OptionButton
          key={opt.value}
          label={opt.label}
          icon={<span className="text-2xl">{opt.icon}</span>}
          description={opt.desc}
          emission={opt.emission}
          selected={form.food === opt.value}
          onClick={() => setForm((f) => ({ ...f, food: opt.value as FoodHabit }))}
        />
      ))}
    </div>,

    // Step 2: Electricity
    <div key="electricity" className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Monthly Electricity Usage</h2>
        <p className="text-slate-400 mt-2">Enter your average monthly electricity consumption in kWh</p>
      </div>

      {/* Slider */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-5xl font-black gradient-text">{form.electricityKwh}</span>
            <span className="text-slate-400 text-lg ml-2">kWh/month</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Annual footprint</div>
            <div className="text-emerald-400 font-bold">
              {((form.electricityKwh * 0.00045 * 12)).toFixed(2)} t CO₂
            </div>
          </div>
        </div>

        <input
          type="range"
          min={50}
          max={1000}
          step={10}
          value={form.electricityKwh}
          onChange={(e) => setForm((f) => ({ ...f, electricityKwh: Number(e.target.value) }))}
          className="w-full accent-emerald-400"
          aria-label="Monthly electricity consumption in kWh"
        />

        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>50 kWh (Very Low)</span>
          <span>1000 kWh (Very High)</span>
        </div>
      </div>

      {/* Reference cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Low', range: '< 200 kWh', color: 'text-emerald-400' },
          { label: 'Average', range: '200–400 kWh', color: 'text-yellow-400' },
          { label: 'High', range: '> 400 kWh', color: 'text-red-400' },
        ].map(({ label, range, color }) => (
          <div key={label} className="glass-light rounded-xl p-3 text-center">
            <div className={`text-sm font-bold ${color}`}>{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{range}</div>
          </div>
        ))}
      </div>

      {/* Manual input */}
      <div>
        <label className="text-sm text-slate-400 block mb-2" htmlFor="electricity-input">
          Or type exact value:
        </label>
        <input
          id="electricity-input"
          type="number"
          min={0}
          max={2000}
          value={form.electricityKwh}
          onChange={(e) => {
            const v = Math.max(0, Math.min(2000, Number(e.target.value)));
            setForm((f) => ({ ...f, electricityKwh: v }));
          }}
          className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 border border-slate-700/50 transition-all"
          placeholder="Enter kWh/month"
        />
      </div>
    </div>,

    // Step 3: Shopping
    <div key="shopping" className="space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Shopping Habits</h2>
        <p className="text-slate-400 mt-2">How often do you buy new clothes, electronics, or household goods?</p>
      </div>
      {[
        { value: 'low', label: 'Low Consumption', icon: '♻️', desc: 'Secondhand, minimal purchases, circular economy', emission: '0.3 t/yr' },
        { value: 'medium', label: 'Medium Consumption', icon: '🛍️', desc: 'Occasional new purchases, mix of new/secondhand', emission: '1.0 t/yr' },
        { value: 'high', label: 'High Consumption', icon: '🛒', desc: 'Frequent new purchases, fast fashion, impulse buying', emission: '2.5 t/yr' },
      ].map((opt) => (
        <OptionButton
          key={opt.value}
          label={opt.label}
          icon={<span className="text-2xl">{opt.icon}</span>}
          description={opt.desc}
          emission={opt.emission}
          selected={form.shopping === opt.value}
          onClick={() => setForm((f) => ({ ...f, shopping: opt.value as ShoppingHabit }))}
        />
      ))}
    </div>,

    // Step 4: Waste
    <div key="waste" className="space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Waste Generation</h2>
        <p className="text-slate-400 mt-2">How much waste do you generate? Do you compost and recycle?</p>
      </div>
      {[
        { value: 'low', label: 'Low Waste', icon: '🌱', desc: 'Composting, thorough recycling, minimal packaging', emission: '0.2 t/yr' },
        { value: 'medium', label: 'Medium Waste', icon: '🗑️', desc: 'Some recycling, average household waste', emission: '0.6 t/yr' },
        { value: 'high', label: 'High Waste', icon: '🔥', desc: 'Minimal recycling, lots of single-use items, food waste', emission: '1.2 t/yr' },
      ].map((opt) => (
        <OptionButton
          key={opt.value}
          label={opt.label}
          icon={<span className="text-2xl">{opt.icon}</span>}
          description={opt.desc}
          emission={opt.emission}
          selected={form.waste === opt.value}
          onClick={() => setForm((f) => ({ ...f, waste: opt.value as WasteLevel }))}
        />
      ))}
    </div>,
  ];

  return (
    <PageTransition>
      <div className="min-h-screen animated-bg text-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black mb-2">
              <span className="gradient-text">Carbon Assessment</span>
            </h1>
            <p className="text-slate-400">Step {step + 1} of {totalSteps} — {STEPS[step]}</p>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <StepProgress current={step} total={totalSteps} steps={STEPS} />
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <GlassCard className="min-h-96">
                {stepContent[step]}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-6"
          >
            <button
              onClick={back}
              className="flex items-center gap-2 px-6 py-3 glass border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              {step === 0 ? 'Home' : 'Back'}
            </button>

            <motion.button
              onClick={next}
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl font-bold text-slate-900 shadow-lg shadow-emerald-400/20 disabled:opacity-70 transition-all"
            >
              {submitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Calculating...
                </>
              ) : step === totalSteps - 1 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Calculate My Footprint
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Step hint */}
          <p className="text-center text-slate-600 text-xs mt-4">
            Your data is stored locally and never shared.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
