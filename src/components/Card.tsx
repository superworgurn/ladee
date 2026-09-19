import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_-1px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-slate-300/80 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

/* ----------------------------- StatCard ----------------------------- */

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const TONE_STYLES: Record<Tone, { container: string; iconBg: string; text: string; glow: string }> = {
  default: {
    container: 'border-slate-200/80 bg-white hover:border-slate-300',
    iconBg: 'bg-slate-100 text-slate-600',
    text: 'text-slate-900',
    glow: 'from-slate-500/5',
  },
  primary: {
    container: 'border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white hover:border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600',
    text: 'text-indigo-900',
    glow: 'from-indigo-500/5',
  },
  success: {
    container: 'border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white hover:border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-900',
    glow: 'from-emerald-500/5',
  },
  warning: {
    container: 'border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white hover:border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    text: 'text-amber-900',
    glow: 'from-amber-500/5',
  },
  danger: {
    container: 'border-rose-100 bg-gradient-to-br from-rose-50/50 via-white to-white hover:border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600',
    text: 'text-rose-900',
    glow: 'from-rose-500/5',
  },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  icon?: ReactNode;
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
}: StatCardProps) {
  const currentTone = TONE_STYLES[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${currentTone.container}`}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${currentTone.glow} to-transparent blur-xl transition-all duration-300 group-hover:scale-125`} />
      
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {icon ? (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition-transform duration-200 group-hover:scale-110 ${currentTone.iconBg}`}>
            {icon}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3">
        <div className={`text-2xl font-bold tracking-tight sm:text-3xl ${currentTone.text}`}>
          {value}
        </div>
        {hint ? (
          <p className="mt-1.5 flex items-center text-xs font-medium text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}