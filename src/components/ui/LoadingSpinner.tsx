/**
 * LoadingSpinner — animated loading indicator
 */

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = { sm: 32, md: 56, lg: 80 };
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: s, height: s }}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
          style={{ width: s, height: s }}
        />
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400"
          style={{ width: s, height: s }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="rounded-full bg-emerald-400/60"
            style={{ width: s * 0.2, height: s * 0.2 }}
          />
        </motion.div>
      </div>
      {message && (
        <motion.p
          className="text-slate-400 text-sm text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
