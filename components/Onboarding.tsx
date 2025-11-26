import React, { useState } from 'react';
import { User, GraduationCap, Briefcase, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, role: 'student' | 'professional') => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'professional' | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-page">
      <div className="bg-card w-full max-w-sm rounded-[24px] shadow-xl p-8 flex flex-col animate-in fade-in zoom-in-95 duration-500 ease-out">
        
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationFillMode: 'both' }}>
            <h1 className="text-2xl font-bold text-primary mb-2">Let's get to know you</h1>
            <p className="text-secondary mb-8">To personalize your FocusBuddy experience.</p>
        </div>

        {/* Name Input */}
        <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <label className="block text-sm font-medium text-secondary mb-2">What should I call you?</label>
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all placeholder:text-white/30"
              placeholder="Your Name"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <label className="block text-sm font-medium text-secondary mb-3">Are you a student or working pro?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('student')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center space-y-2 active:scale-95 ${
                role === 'student' 
                ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                : 'border-gray-100 bg-white text-secondary hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className={`w-6 h-6 transition-transform duration-300 ${role === 'student' ? 'text-brand scale-110' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">Student</span>
            </button>

            <button
              onClick={() => setRole('professional')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center space-y-2 active:scale-95 ${
                role === 'professional' 
                ? 'border-brand bg-brand/5 text-brand shadow-sm' 
                : 'border-gray-100 bg-white text-secondary hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Briefcase className={`w-6 h-6 transition-transform duration-300 ${role === 'professional' ? 'text-brand scale-110' : 'text-gray-400'}`} />
              <span className="text-sm font-medium leading-tight">Working Pro</span>
            </button>
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <button
            onClick={() => name.trim() && role && onComplete(name, role)}
            disabled={!name.trim() || !role}
            className={`w-full py-3.5 rounded-full font-medium shadow-md flex items-center justify-center space-x-2 transition-all duration-300 ios-hover-wiggle ${
                name.trim() && role
                ? 'bg-brand text-white hover:bg-orange-800 opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
            }`}
            >
            <span>Get Started</span>
            <ArrowRight className={`w-4 h-4 transition-transform ${name.trim() && role ? 'translate-x-1' : ''}`} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;