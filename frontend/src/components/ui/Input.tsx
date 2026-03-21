import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'underline';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'default', className = '', ...props }, ref) => {
    const baseStyles =
      'w-full font-medium text-base transition-all duration-200 focus-visible:outline-none';

    const variants = {
      default:
        'bg-glass border border-indigo-neon-600/20 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus-visible:border-indigo-neon-600 focus-visible:shadow-glow-indigo',
      underline:
        'bg-transparent border-b-2 border-gray-600 rounded-none px-0 py-2 text-gray-100 placeholder-gray-500 focus-visible:border-indigo-neon-600',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${variants[variant]} ${className}`}
          {...props}
        />
        {error && <p className="text-danger text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
