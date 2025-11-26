import React from 'react';
import { BarChart2, Target, MessageSquare, Package } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  current: AppView;
  onChange: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onChange }) => {
  const navItems: { id: AppView; label: string; icon: React.FC<any> }[] = [
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tools', label: 'Tools', icon: Package },
  ];

  const activeIndex = navItems.findIndex(item => item.id === current);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none w-full px-4">
      {/* Container with refined glassmorphism: tighter blur, shadow, and border */}
      <div className="glass-nav w-full max-w-[380px] h-[76px] rounded-[30px] pointer-events-auto relative flex items-center p-2 transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-2xl bg-black/30">
        
        <div className="relative w-full h-full grid grid-cols-4">
            {/* Liquid Indicator with custom spring easing */}
            <div 
              className="liquid-indicator absolute top-0 bottom-0 rounded-[22px] overflow-hidden border border-white/5 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              style={{
                width: '25%',
                left: 0,
                transform: `translateX(${activeIndex * 100}%)`,
                transition: 'transform 0.5s cubic-bezier(0.25, 1.25, 0.3, 1)', // Snappy spring effect
              }}
            >
              {/* Internal subtle shimmer/glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-40" />
            </div>

            {navItems.map((item) => {
              const isActive = current === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className="nav-item group relative z-10 flex flex-col items-center justify-center w-full h-full outline-none rounded-[22px] hover:bg-white/5 transition-colors duration-200"
                >
                  {/* Content wrapper for hover animations */}
                  <div className={`nav-content flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-active:scale-95`}>
                    <div className="relative">
                      <Icon 
                        className={`w-6 h-6 mb-1.5 transition-all duration-300 ${
                          isActive 
                            ? 'text-white stroke-[2.5px] drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)] scale-110' 
                            : 'text-secondary group-hover:text-primary group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]'
                        }`} 
                      />
                      {item.id === 'chat' && (
                         <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1C1C1E] animate-pulse shadow-sm"></span>
                      )}
                    </div>
                    {/* Label fades in/out on hover for inactive, stays for active */}
                    <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? 'text-white translate-y-0 opacity-100' 
                        : 'text-secondary translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;