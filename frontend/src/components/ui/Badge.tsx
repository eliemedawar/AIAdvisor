import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const variants = {
      default: 'bg-indigo-neon-600/20 text-indigo-neon-300 border border-indigo-neon-600/30',
      success: 'bg-success/20 text-success border border-success/30',
      warning: 'bg-warning/20 text-warning border border-warning/30',
      danger: 'bg-danger/20 text-danger border border-danger/30',
      info: 'bg-info/20 text-info border border-info/30',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
