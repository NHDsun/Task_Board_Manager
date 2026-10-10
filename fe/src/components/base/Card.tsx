import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

const cardVariants = {
  default: 'bg-slate-900 border border-slate-800 text-slate-100',
  glass: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 text-slate-100 shadow-xl',
  elevated: 'bg-slate-950 border border-slate-800/80 shadow-2xl shadow-black/60 text-slate-100',
  bordered: 'bg-transparent border border-slate-700 text-slate-100',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * 🧱 Base Card Component
 * Container khung cho mọi panel, widget, preview box trong ứng dụng.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  children,
  className = '',
  ...props
}) => {
  const hoverClass = hoverEffect ? 'hover:border-slate-700 transition-all duration-200' : '';

  return (
    <div
      className={`rounded-2xl ${cardVariants[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
