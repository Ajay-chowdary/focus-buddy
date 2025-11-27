
import React, { useEffect, useState } from 'react';
import { X, Briefcase, Coffee } from 'lucide-react';
import { DuckMood } from '../types';
import { getRandomDuckReaction } from '../utils/reactionManager';

interface FocusNudgeBannerProps {
  visible: boolean;
  message: string;
  mood?: DuckMood; // Optional preferred mood passed from parent
  breakOptions?: number[]; // minutes
  onGetBackToWork: () => void;
  onSelectBreak: (minutes: number) => void;
  onDismiss: () => void;
}

const FocusNudgeBanner: React.FC<FocusNudgeBannerProps> = ({
  visible,
  message,
  mood,
  breakOptions = [5, 10],
  onGetBackToWork,
  onSelectBreak,
  onDismiss,
}) => {
  const [renderVisible, setRenderVisible] = useState(visible);
  
  // Get reaction image based on mood
  const reaction = getRandomDuckReaction(mood);
  const isAngry = mood === 'angry';

  // Handle animation timing
  useEffect(() => {
    if (visible) {
      setRenderVisible(true);
    } else {
      // Wait for animation to finish before removing from DOM
      const timer = setTimeout(() => setRenderVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!renderVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="relative w-full max-w-xl">
        {/* Soft Glow Behind */}
        <div className={`absolute -inset-1 blur-2xl -z-10 rounded-full opacity-60 animate-pulse ${isAngry ? 'bg-red-500/50' : 'bg-brand/30'}`} />
        
        <div className={`
          w-full rounded-2xl shadow-2xl flex items-center p-4 gap-5 border border-white/10 backdrop-blur-xl overflow-hidden relative
          ${isAngry ? 'bg-gradient-to-br from-red-900 to-orange-900 text-white' : 'bg-brand text-white'}
        `}>
          
          {/* Duck Reaction Image - Enhanced Animation Container */}
          {/* Always use the Blue/Sky Premium Circle (duck-premium-circle) as requested in screenshot, even if angry */}
          <div className={`
             shrink-0 w-28 h-28 rounded-full flex items-center justify-center relative 
             border-4 border-white/20 shadow-2xl z-10
             duck-premium-circle
             ${visible ? 'animate-duck-float' : ''}
          `}>
             {/* Inner wrapper for entrance tilt */}
             <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${visible ? 'animate-duck-hello' : ''}`}>
                 <img 
                   src={reaction.gifUrl} 
                   alt={reaction.mood} 
                   onError={(e) => {
                     // Fallback if image fails
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerText = isAngry ? '🤬' : '🦆';
                     e.currentTarget.parentElement!.className += ' text-6xl flex items-center justify-center';
                   }}
                   className={`w-full h-full object-cover ${visible ? 'animate-duck-blink' : ''} ${isAngry ? 'scale-125 translate-y-1' : 'scale-110'}`}
                 />
             </div>
             
             {/* Glossy Overlay/Highlight */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none mix-blend-overlay" />
             {/* Specular Highlight */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 rounded-[100%] blur-[3px] pointer-events-none" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-sm font-bold leading-snug mb-3 text-white pr-6 drop-shadow-sm">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={onGetBackToWork}
                className="bg-white text-brand px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-gray-50 transition-all shadow-sm ios-press-btn"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Get back to work</span>
              </button>

              {breakOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => onSelectBreak(mins)}
                  className="border border-white/40 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center space-x-1.5 ios-press-btn"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{mins}m break</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dismiss */}
          <button 
            onClick={onDismiss}
            className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusNudgeBanner;
