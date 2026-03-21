import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const variants = {
      default: 'bg-void-800 border border-void-700 rounded-2xl',
      glass: 'glass rounded-2xl',
      elevated: 'bg-void-800 border border-indigo-neon-600/10 rounded-2xl shadow-lg glow-indigo',
    };

    return (
      <div
        ref={ref}
        className={`${variants[variant]} p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
