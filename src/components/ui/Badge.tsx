interface BadgeProps {
  variant?: 'green' | 'gold' | 'red' | 'gray' | 'blue';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'green', children, className = '' }: BadgeProps) {
  const variants = {
    green: 'bg-nature-green/10 text-nature-green',
    gold: 'bg-gold/10 text-gold-dark',
    red: 'bg-red/10 text-red',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
