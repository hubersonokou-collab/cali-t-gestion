import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent transition-colors ${
            error ? 'border-red' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
