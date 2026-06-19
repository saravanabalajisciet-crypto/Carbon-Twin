/**
 * Navbar — global navigation component
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, BarChart3, Brain, Sliders, Menu, X, Home } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/insights', label: 'AI Insights', icon: Brain },
  { path: '/simulator', label: 'Simulator', icon: Sliders },
];

export default function Navbar() {
  const location = useLocation();
  const { carbonResult } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/90 backdrop-blur-xl border-b border-emerald-500/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-emerald-400/30 transition-all duration-300">
                <Leaf className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">
              Carbon Twin AI
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              const disabled = path !== '/' && !carbonResult && path !== '/';
              return (
                <Link
                  key={path}
                  to={disabled ? '/' : path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-emerald-400'
                      : disabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-emerald-400/10 rounded-xl border border-emerald-400/20"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Score badge (desktop) */}
          {carbonResult && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
              <span className="text-lg">{carbonResult.badge}</span>
              <div>
                <div className="text-xs text-slate-500">Score</div>
                <div className="text-sm font-bold gradient-text">{carbonResult.score}/100</div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = isActive(path);
                const disabled = path !== '/' && !carbonResult;
                return (
                  <Link
                    key={path}
                    to={disabled ? '/' : path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                        : disabled
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {disabled && path !== '/' && (
                      <span className="ml-auto text-xs text-slate-600">Complete assessment first</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
