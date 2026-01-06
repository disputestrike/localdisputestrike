import { useState, useEffect } from 'react';

interface CreditScoreAnimationProps {
  className?: string;
}

export function CreditScoreAnimation({ className = '' }: CreditScoreAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const frames = [
    '/anim-frame-1-worried.png',
    '/anim-frame-2-transition.png',
    '/anim-frame-3-improving.png',
    '/anim-frame-4-celebrating.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 2500); // Change frame every 2.5 seconds

    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {frames.map((frame, index) => (
        <img
          key={frame}
          src={frame}
          alt={`Credit score transformation step ${index + 1}`}
          className={`w-full rounded-2xl shadow-2xl transition-opacity duration-1000 ${
            index === currentFrame ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />
      ))}
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {frames.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentFrame ? 'bg-orange-600 w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
