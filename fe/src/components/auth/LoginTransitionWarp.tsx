import React, { useEffect, useState } from 'react';
import { DarkSunLogo } from '../common/DarkSunLogo';

interface LoginTransitionWarpProps {
  onComplete: () => void;
}

export const LoginTransitionWarp: React.FC<LoginTransitionWarpProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'burst' | 'sweep' | 'done'>('burst');

  useEffect(() => {
    // Phase 1: Solar Nova Burst (0 - 300ms)
    const t1 = setTimeout(() => {
      setPhase('sweep');
    }, 300);

    // Phase 2: Meteor Warp Sweep (300ms - 750ms)
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#030712] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 solar-grid-pattern opacity-40" />

      {/* Phase 1: Solar Nova Burst */}
      {phase === 'burst' && (
        <div className="relative flex flex-col items-center justify-center animate-solar-nova">
          <DarkSunLogo className="w-36 h-36 filter drop-shadow-[0_0_50px_rgba(245,158,11,0.8)]" />
          <span className="mt-6 font-extrabold text-xl tracking-widest text-amber-300 animate-pulse">
            SOLARIS
          </span>
        </div>
      )}

      {/* Phase 2: Meteor Sweep Trail */}
      {phase === 'sweep' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[150vw] h-48 bg-gradient-to-r from-transparent via-amber-500/40 via-purple-600/50 to-emerald-500/40 blur-2xl transform animate-meteor-warp" />
        </div>
      )}
    </div>
  );
};
