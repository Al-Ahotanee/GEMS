import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type CardColor = 'primary' | 'accent' | 'success' | 'warning' | 'danger';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: Trend;
  color?: CardColor;
}

const colorStyles: Record<CardColor, { iconBg: string; iconText: string; glow: string }> = {
  primary: {
    iconBg: 'bg-primary-500/15',
    iconText: 'text-primary-300',
    glow: 'hover:shadow-primary-500/10',
  },
  accent: {
    iconBg: 'bg-accent-500/15',
    iconText: 'text-accent-400',
    glow: 'hover:shadow-accent-500/10',
  },
  success: {
    iconBg: 'bg-green-500/15',
    iconText: 'text-green-400',
    glow: 'hover:shadow-green-500/10',
  },
  warning: {
    iconBg: 'bg-yellow-500/15',
    iconText: 'text-yellow-400',
    glow: 'hover:shadow-yellow-500/10',
  },
  danger: {
    iconBg: 'bg-red-500/15',
    iconText: 'text-red-400',
    glow: 'hover:shadow-red-500/10',
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={clsx(
        'stat-card cursor-default',
        'hover:shadow-lg',
        styles.glow
      )}
    >
      <div className="flex items-start justify-between">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-muted font-medium truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold font-mono text-text-primary tracking-tight">
            <CountUp end={value} duration={1.8} separator="," preserveValue />
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-muted truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={clsx(
                  'text-xs font-semibold font-mono',
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={clsx(
            'flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
            styles.iconBg
          )}
        >
          <Icon className={clsx('w-5 h-5', styles.iconText)} />
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
