import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

/**
 * 🧱 Base Input Component
 * Ô nhập liệu chuẩn hóa về viền, padding, font chữ và trạng thái lỗi.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-950 border ${
              error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500'
            } rounded-xl py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
              error ? 'focus:ring-rose-500/50' : 'focus:ring-amber-500/50'
            } transition-all duration-150 ${leftIcon ? 'pl-10 pr-4' : 'px-4'} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
