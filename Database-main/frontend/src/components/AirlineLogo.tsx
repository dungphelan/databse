import type { Airline } from '@/types';

export default function AirlineLogo({ airline, size = 'md' }: { airline: Airline; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm`}
      style={{ backgroundColor: airline.logoColor, color: airline.textColor }}
    >
      {airline.logoText}
    </div>
  );
}
