import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DailyStats, UserProfile } from '../types';
import { User, Flame } from 'lucide-react';

interface DashboardProps {
  dailyStats: DailyStats[];
  userProfile: UserProfile | null;
  onOpenMenu: () => void;
  onResetStats: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyStats, userProfile, onOpenMenu, onResetStats }) => {
  const today = dailyStats[dailyStats.length - 1];
  
  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      if (dailyStats[i].focusMinutes > 0) streak++;
      else break;
    }
    return streak;
  };
  const currentStreak = calculateStreak();
  
  // Prepare chart data
  const totalActivity = today.focusMinutes + today.scrollMinutes;
  
  // If no activity, show a full grey circle (placeholder) instead of invisible chart
  const data = totalActivity === 0 
    ? [{ name: 'Empty', value: 1 }] 
    : [
        { name: 'Focus', value: today.focusMinutes },
        { name: 'Scroll', value: today.scrollMinutes },
      ];

  // Updated brand color to match new darker orange definition
  // Use dark grey for empty state
  const COLORS = totalActivity === 0 
    ? ['#27272A'] 
    : ['#C2410C', '#E5E7EB']; 

  // Format time helper
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-6 bg-page sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">FB</div>
          <span className="text-lg font-bold text-primary tracking-tight">FocusBuddy</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={onOpenMenu}
            className="w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all border bg-card text-primary border-border hover:bg-surface"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Top Grid: Streak & Today */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-brand to-orange-800 p-4 rounded-[20px] shadow-lg shadow-brand/20 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Flame className="w-12 h-12" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Current Streak</span>
            <div className="flex items-end space-x-1 mt-2">
                <span className="text-3xl font-bold">{currentStreak}</span>
                <span className="text-sm font-medium mb-1 opacity-90">days</span>
            </div>
          </div>

          {/* Focus Today Card */}
          <div className="bg-card p-4 rounded-[20px] shadow-sm flex flex-col justify-center border border-transparent">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Focus Today</span>
            <span className="text-2xl font-bold text-primary">{formatTime(today.focusMinutes)}</span>
          </div>
        </div>

        {/* Daily Breakdown Donut */}
        <div className="bg-card p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center relative">
          <h3 className="text-primary font-bold text-lg w-full text-left mb-2">Daily Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={totalActivity === 0 ? 0 : 5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={totalActivity === 0 ? 0 : 10}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-4xl font-bold text-primary">{today.productivityPercent}%</span>
               <span className="text-[10px] font-bold text-secondary tracking-widest mt-1">PRODUCTIVITY</span>
             </div>
          </div>
        </div>

        {/* Activity List - Only show if we have history beyond today */}
        {dailyStats.length > 1 && (
          <div>
            <h3 className="text-primary font-bold text-lg mb-4">Last 7 Days</h3>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
              {dailyStats.slice().reverse().map((stat, idx) => (
                <div key={idx} className="min-w-[160px] bg-card p-4 rounded-[20px] shadow-sm flex flex-col border border-transparent snap-center">
                  <span className="text-sm font-semibold text-primary mb-1">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center mb-3">
                     <span className={`text-xs font-bold ${stat.productivityPercent >= 50 ? 'text-accent' : 'text-brand'}`}>
                       {stat.productivityPercent}% productive
                     </span>
                  </div>
                  <div className="mt-auto space-y-1">
                    <div className="text-xs text-secondary">Focus: {formatTime(stat.focusMinutes)}</div>
                    <div className="text-xs text-secondary">Scroll: {formatTime(stat.scrollMinutes)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Action */}
        <div className="pb-8">
          <button 
            onClick={onResetStats} 
            className="w-full py-4 border border-border rounded-2xl text-sm font-semibold text-secondary hover:bg-surface hover:text-brand transition-colors active:scale-95"
          >
            Reset Daily Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;