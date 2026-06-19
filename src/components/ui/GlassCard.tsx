/**
 * GlassCard — reusable glassmorphism card component
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'green' | 'blue' | 'cyan' | 'none';
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = 'none',
  onClick,
  delay = 0,
}: GlassCardProps) {
  const glowClass = {
    green: 'glow-green',
    blue: 'glow-blue',
    cyan: 'glow-cyan',
    none: '',
  }[glow];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={`glass rounded-2xl p-6 ${hover ? 'card-hover cursor-pointer' : ''} ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
