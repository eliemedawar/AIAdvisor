import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-neon-600 focus-visible:ring-offset-2 focus-visible:ring-offset-void-950 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

    const variants = {
      primary:
        'bg-indigo-neon-600 text-void-950 hover:bg-indigo-neon-500 hover:shadow-glow-indigo active:scale-95',
      secondary:
        'bg-glass text-indigo-neon-600 hover:bg-glass-strong hover:text-indigo-neon-500 border border-indigo-neon-600/20 hover:border-indigo-neon-600/40',
      ghost: 'text-gray-400 hover:text-indigo-neon-600 hover:bg-glass',
      danger: 'bg-danger text-white hover:bg-red-600 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
