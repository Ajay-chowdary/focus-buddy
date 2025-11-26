
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, CheckCircle2, Calendar, Bell, ChevronDown, ChevronUp, Flame, Play, Pause, Square, User, Clock, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Goal, UserProfile, GoalDay } from '../types';

interface GoalsProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  streak: number;
  userProfile: UserProfile | null;
  onOpenMenu: () => void;
}

// --- Components for Custom Pickers ---

const SimpleCalendar = ({ value, onChange, onClose }: { value: string, onChange: (d: string) => void, onClose?: () => void }) => {
    const date = value ? new Date(value) : new Date();
    // Use local state for navigation
    const [viewDate, setViewDate] = useState(new Date(date));
    
    // Sync view if value changes externally far from current view
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (Math.abs(d.getTime() - viewDate.getTime()) > 40 * 24 * 60 * 60 * 1000) {
                setViewDate(d);
            }
        }
    }, [value]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const changeMonth = (delta: number) => {
        setViewDate(new Date(year, month + delta, 1));
    };

    const isSelected = (d: number) => {
        const checkDate = new Date(year, month, d);
        // Format to YYYY-MM-DD for comparison
        const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
        return checkStr === value;
    };

    const handleSelect = (d: number) => {
        const newDate = new Date(year, month, d);
        const yearStr = newDate.getFullYear();
        const monthStr = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(newDate.getDate()).padStart(2, '0');
        onChange(`${yearStr}-${monthStr}-${dayStr}`);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-4 mt-3 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-card rounded-full text-secondary hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <span className="font-bold text-sm text-primary">{months[month]} {year}</span>
                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-card rounded-full text-secondary hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] text-secondary font-bold">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                    d === null ? <div key={i} /> : 
                    <button 
                        key={i} 
                        onClick={() => handleSelect(d)}
                        className={`
                            h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-all
                            ${isSelected(d) ? 'bg-brand text-white shadow-md scale-105' : 'text-primary hover:bg-card'}
                        `}
                    >
                        {d}
                    </button>
                ))}
            </div>
            
            {onClose && (
                <div className="flex justify-end mt-4 pt-2 border-t border-white/5">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-orange-800 transition-colors"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
};

const ScrollWheel = ({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Auto scroll to value on mount or change
    useEffect(() => {
        if (containerRef.current) {
            const index = options.indexOf(value);
            if (index !== -1) {
                // Item height 40px
                containerRef.current.scrollTop = index * 40;
            }
        }
    }, []);

    return (
        <div className="relative h-[120px] flex-1 overflow-hidden group bg-surface rounded-lg">
             <div className="absolute inset-x-0 top-0 h-[40px] bg-gradient-to-b from-surface via-surface/90 to-transparent z-10 pointer-events-none" />
             <div className="absolute inset-x-0 bottom-0 h-[40px] bg-gradient-to-t from-surface via-surface/90 to-transparent z-10 pointer-events-none" />
             
             <div className="absolute inset-x-0 top-[40px] bottom-[40px] bg-card border-y border-brand/20 z-0" />

             <div 
                ref={containerRef}
                className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[40px] relative z-20"
             >
                 {options.map((opt) => (
                     <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`
                            h-[40px] w-full flex items-center justify-center snap-center text-lg transition-all
                            ${opt === value ? 'font-bold text-brand scale-110' : 'text-secondary opacity-50 scale-90'}
                        `}
                     >
                         {opt}
                     </button>
                 ))}
             </div>
        </div>
    );
};

const TimePickerWheel = ({ time, onChange }: { time: string, onChange: (t: string) => void }) => {
    const [h, m] = time.split(':');
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    // Generate minutes 00-59
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const updateHour = (val: string) => onChange(`${val}:${m}`);
    const updateMinute = (val: string) => onChange(`${h}:${val}`);

    return (
        <div className="flex justify-center gap-2 animate-in slide-in-from-top-2 fade-in mt-2 px-12">
            <ScrollWheel options={hours} value={h} onChange={updateHour} />
            <ScrollWheel options={minutes} value={m} onChange={updateMinute} />
        </div>
    );
};

const Confetti = () => {
  const colors = ['#16A34A', '#22C55E', '#FBBF24', '#3B82F6', '#EC4899'];
  const particles = Array.from({ length: 50 });
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex justify-center">
      {particles.map((_, i) => (
        <div
          key={i}
          className="absolute top-[-20px] animate-fall"
          style={{
            left: `${Math.random() * 100}vw`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            animationDuration: `${Math.random() * 2 + 1.5}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
        `}
      </style>
    </div>
  );
};

const Goals: React.FC<GoalsProps> = ({ goals, setGoals, streak, userProfile, onOpenMenu }) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeSession, setActiveSession] = useState<{ goalId: string; title: string } | null>(null);
  const [timerState, setTimerState] = useState({ total: 0, remaining: 0, isPaused: false });
  const [isStartingSession, setIsStartingSession] = useState<string | null>(null);
  
  // Track which time field is being edited for wheel visibility
  const [editingTime, setEditingTime] = useState<{ id: string, field: 'startTime' | 'endTime' } | null>(null);
  
  // Track which title is being edited
  const [editingTitle, setEditingTitle] = useState<{ id: string, text: string } | null>(null);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession && !timerState.isPaused && timerState.remaining > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({ ...prev, remaining: prev.remaining - 1 }));
      }, 1000);
    } else if (activeSession && timerState.remaining === 0) {
      setShowCelebration(true);
      setActiveSession(null);
    }
    return () => clearInterval(interval);
  }, [activeSession, timerState.isPaused, timerState.remaining]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      startTime: '09:00',
      endTime: '10:00',
      isActive: true,
      completed: false,
      date: getTodayString(),
      day: 'today',
      reminder: true,
      reminderOffsetMinutes: 15, 
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleComplete = (id: string) => {
    setGoals(prevGoals => {
        const target = prevGoals.find(g => g.id === id);
        if (target && !target.completed) {
            setShowCelebration(true);
        }
        return prevGoals.map(g => ({
            ...g,
            completed: g.id === id ? !g.completed : g.completed,
            isActive: g.id === id && !g.completed ? false : g.isActive 
        }));
    });
  };

  const toggleExpand = (id: string) => {
    setGoals(prev => prev.map(g => ({
      ...g,
      isActive: g.id === id ? !g.isActive : g.isActive
    })));
  };

  const updateGoalField = (id: string, field: keyof Goal, value: any) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const saveTitle = () => {
    if (editingTitle && editingTitle.text.trim()) {
      setGoals(prev => prev.map(g => g.id === editingTitle.id ? { ...g, title: editingTitle.text } : g));
    }
    setEditingTitle(null);
  };

  const updateGoalDay = (id: string, day: GoalDay) => {
      const today = getTodayString();
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split('T')[0];

      setGoals(prev => prev.map(g => {
          if (g.id !== id) return g;
          
          let newDate = g.date;
          if (day === 'today') newDate = today;
          else if (day === 'tomorrow') newDate = tomorrow;
          else if (day === 'custom' && g.customDate) newDate = g.customDate;
          
          return { ...g, day, date: newDate };
      }));
  };

  const updateCustomDate = (id: string, dateStr: string) => {
      setGoals(prev => prev.map(g => {
          if (g.id !== id) return g;
          return { ...g, customDate: dateStr, date: dateStr, day: 'custom' };
      }));
  };

  const getDurationSeconds = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60; 
    return (endMin - startMin) * 60;
  };

  const formatTimerDisplay = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startFocusSession = (goal: Goal) => {
    const duration = getDurationSeconds(goal.startTime, goal.endTime);
    if (duration <= 0) {
        alert("Please check the start and end times.");
        return;
    }
    setIsStartingSession(goal.id);
    setTimeout(() => {
        setTimerState({ total: duration, remaining: duration, isPaused: false });
        setActiveSession({ goalId: goal.id, title: goal.title });
        setIsStartingSession(null);
    }, 600);
  };

  const REMINDER_OPTIONS = [
    { label: "At time", value: 0 },
    { label: "5m", value: 5 },
    { label: "10m", value: 10 },
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "1h", value: 60 },
  ];

  const progressPercent = timerState.total > 0 
    ? Math.max(0, Math.min(100, ((timerState.total - timerState.remaining) / timerState.total) * 100))
    : 0;

  return (
    <div className={`flex flex-col h-full pb-24 pt-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative transition-opacity duration-500 ${isStartingSession ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {showCelebration && <Confetti />}
      
      {activeSession && createPortal(
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[320px] bg-brand rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center py-8 px-6 animate-in zoom-in-95 duration-500 ring-4 ring-white/10 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="relative z-10 flex flex-col items-center text-center mb-8 w-full">
                     <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md line-clamp-2 px-2">{activeSession.title}</h2>
                </div>

                <div className="relative z-10 mb-8 flex items-center justify-center">
                     <div className="relative w-[220px] h-[220px] rounded-full border-[6px] border-white/10 bg-black/20 shadow-inner overflow-hidden isolate ring-1 ring-white/20">
                        <div 
                            className="absolute bottom-0 left-0 w-full z-0 transition-all duration-1000 ease-linear" 
                            style={{ height: `${progressPercent}%` }}
                        >
                            <div className="absolute bottom-0 left-[20%] w-2 h-2 bg-white/30 rounded-full animate-bubble" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-0 left-[50%] w-3 h-3 bg-white/20 rounded-full animate-bubble" style={{ animationDelay: '1.2s', animationDuration: '5s' }}></div>
                            <div className="absolute bottom-0 left-[80%] w-1.5 h-1.5 bg-white/40 rounded-full animate-bubble" style={{ animationDelay: '2.5s' }}></div>

                            <div className="absolute -top-[24px] left-0 w-[200%] h-10 flex animate-wave-slide opacity-60">
                                 <svg className="w-1/2 h-full text-blue-600 fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                      <path d="M 0 50 Q 250 10 500 50 T 1000 50 V 100 H 0 Z" />
                                 </svg>
                                 <svg className="w-1/2 h-full text-blue-600 fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                      <path d="M 0 50 Q 250 10 500 50 T 1000 50 V 100 H 0 Z" />
                                 </svg>
                            </div>
                            
                            <div className="absolute -top-[24px] left-[-15%] w-[200%] h-10 flex animate-wave-slide-fast opacity-90" style={{ animationDirection: 'reverse' }}>
                                 <svg className="w-1/2 h-full text-cyan-400 fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                      <path d="M 0 50 Q 250 90 500 50 T 1000 50 V 100 H 0 Z" />
                                 </svg>
                                 <svg className="w-1/2 h-full text-cyan-400 fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                      <path d="M 0 50 Q 250 90 500 50 T 1000 50 V 100 H 0 Z" />
                                 </svg>
                            </div>

                            <div className="w-full h-full bg-gradient-to-b from-cyan-400 to-blue-600"></div>
                        </div>

                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            <span className="text-5xl font-bold text-white tracking-tighter tabular-nums leading-none font-variant-numeric">
                                {formatTimerDisplay(timerState.remaining)}
                            </span>
                            <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-[0.25em] transition-colors ${timerState.isPaused ? 'text-yellow-300 animate-pulse' : 'text-white/80'}`}>
                                {timerState.isPaused ? 'Paused' : 'Remaining'}
                            </span>
                        </div>
                     </div>
                </div>

                <div className="relative z-10 flex items-center gap-5">
                     <button 
                        onClick={() => setActiveSession(null)}
                        className="group flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/20 ios-press-btn"
                     >
                        <Square className="w-4 h-4 fill-current text-white/90 group-hover:text-white" />
                        <span className="text-[8px] font-bold text-white/70 mt-0.5 uppercase tracking-wider group-hover:text-white">End</span>
                     </button>

                     <button 
                        onClick={() => setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white text-brand shadow-2xl ios-press-btn"
                     >
                        {timerState.isPaused ? (
                            <Play className="w-6 h-6 fill-current ml-1" />
                        ) : (
                            <Pause className="w-6 h-6 fill-current" />
                        )}
                     </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-primary">Your Goals</h1>
            {streak > 0 && (
                <div className="inline-flex items-center space-x-1 bg-orange-500/10 text-brand px-2 py-0.5 rounded-md mt-1 border border-orange-500/20">
                    <Flame className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold">{streak} day streak</span>
                </div>
            )}
        </div>
        
        <button 
            onClick={onOpenMenu}
            className="w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all border bg-card text-primary border-border hover:bg-surface ios-press-btn"
        >
            <User className="w-5 h-5" />
        </button>
      </div>

      <div className="flex space-x-3 mb-8">
        <input
          type="text"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          placeholder="Add a new goal..."
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/10 shadow-sm placeholder:text-secondary text-primary transition-all duration-300"
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
        />
        <button 
          onClick={addGoal}
          className="bg-brand text-white w-12 rounded-xl flex items-center justify-center shadow-md hover:bg-orange-800 ios-hover-wiggle"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto no-scrollbar pb-20">
        {goals.length === 0 && (
            <div className="text-center text-secondary mt-12">
                <p>No goals set yet.</p>
                <p className="text-sm opacity-60">Add one above to get started.</p>
            </div>
        )}

        {goals.map(goal => (
          <div 
            key={goal.id} 
            className={`
                bg-card rounded-[24px] p-5 shadow-sm transition-all duration-300 border relative 
                ios-float-card
                ${goal.isActive ? 'border-brand ring-1 ring-brand/5' : 'border-transparent'}
                ${isStartingSession === goal.id ? 'scale-105 z-50 shadow-2xl ring-4 ring-brand/20' : ''}
            `}
          >
            {goal.isActive && !goal.completed && (
                <div className="absolute inset-0 rounded-[24px] pointer-events-none opacity-5 overflow-hidden">
                    <div className="w-full h-full animate-shimmer" />
                </div>
            )}

            <div className="flex items-start justify-between mb-2 relative z-10">
              <div className="flex items-center space-x-3 flex-1 mr-2 relative">
                <button onClick={() => toggleComplete(goal.id)} className="shrink-0 mt-1 transition-transform active:scale-90 group">
                    {goal.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-accent fill-current animate-pop" />
                    ) : (
                    <div className={`w-6 h-6 rounded-full border-[2.5px] ${goal.isActive ? 'border-brand' : 'border-gray-300'} group-hover:border-brand transition-colors`} />
                    )}
                </button>
                
                {editingTitle?.id === goal.id ? (
                  <div className="flex-1 flex items-center">
                     <input 
                       autoFocus
                       value={editingTitle.text}
                       onChange={(e) => setEditingTitle({ ...editingTitle, text: e.target.value })}
                       onBlur={saveTitle}
                       onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                       onClick={(e) => e.stopPropagation()}
                       className="w-full bg-surface border border-brand/50 rounded-lg px-2 py-1 text-lg font-bold text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                     />
                  </div>
                ) : (
                  <div 
                      onClick={() => toggleExpand(goal.id)} 
                      className="flex-1 cursor-pointer group flex items-center"
                  >
                      <span className={`font-bold text-lg transition-all ${goal.completed ? 'text-secondary line-through opacity-50' : 'text-primary group-hover:opacity-80'}`}>
                          {goal.title}
                      </span>
                      {goal.isActive && !goal.completed && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setEditingTitle({ id: goal.id, text: goal.title });
                           }}
                           className="ml-2 p-1.5 rounded-full bg-surface text-secondary hover:text-brand transition-colors"
                         >
                           <Pencil className="w-3.5 h-3.5" />
                         </button>
                      )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                  <button onClick={() => toggleExpand(goal.id)} className="text-secondary hover:text-brand p-1 transition-colors">
                      {goal.isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button onClick={() => deleteGoal(goal.id)} className="text-secondary hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
              </div>
            </div>

            {goal.isActive && !goal.completed && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300 space-y-5 relative z-10">
                    
                    {/* Day Selector with Calendar */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                             <Calendar className="w-3.5 h-3.5 text-secondary" />
                             <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">When</span>
                        </div>
                        <div className="bg-surface-highlight p-1 rounded-xl flex text-center">
                            {(['today', 'tomorrow', 'custom'] as GoalDay[]).map(d => {
                                const isSelected = goal.day === d;
                                return (
                                    <button
                                        key={d}
                                        onClick={() => updateGoalDay(goal.id, d)}
                                        className={`
                                            flex-1 py-2 rounded-lg text-[11px] font-bold select-none ios-hover-wiggle
                                            ${isSelected 
                                                ? 'bg-card text-brand shadow-sm animate-pop' 
                                                : 'text-secondary hover:text-primary'
                                            }
                                        `}
                                    >
                                        {d === 'today' ? 'Today' : d === 'tomorrow' ? 'Tomorrow' : 'Pick Date'}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Custom Calendar replaces text input */}
                         {goal.day === 'custom' && (
                            <SimpleCalendar 
                                value={goal.customDate || goal.date}
                                onChange={(d) => updateCustomDate(goal.id, d)}
                                onClose={() => toggleExpand(goal.id)}
                            />
                        )}
                    </div>

                     {/* Time Selector with Scroll Wheels */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                             <Clock className="w-3.5 h-3.5 text-secondary" />
                             <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Time</span>
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                            <button 
                                onClick={() => setEditingTime(editingTime?.id === goal.id && editingTime.field === 'startTime' ? null : { id: goal.id, field: 'startTime' })}
                                className={`flex-1 py-3 rounded-xl border text-center transition-all ${editingTime?.id === goal.id && editingTime.field === 'startTime' ? 'bg-surface border-brand ring-1 ring-brand/20' : 'bg-surface border-border hover:bg-surface-highlight'}`}
                            >
                                <span className="text-xs text-secondary block mb-0.5">Start</span>
                                <span className="text-xl font-bold text-primary tabular-nums">{goal.startTime}</span>
                            </button>

                            <button 
                                onClick={() => setEditingTime(editingTime?.id === goal.id && editingTime.field === 'endTime' ? null : { id: goal.id, field: 'endTime' })}
                                className={`flex-1 py-3 rounded-xl border text-center transition-all ${editingTime?.id === goal.id && editingTime.field === 'endTime' ? 'bg-surface border-brand ring-1 ring-brand/20' : 'bg-surface border-border hover:bg-surface-highlight'}`}
                            >
                                <span className="text-xs text-secondary block mb-0.5">End</span>
                                <span className="text-xl font-bold text-primary tabular-nums">{goal.endTime}</span>
                            </button>
                        </div>

                        {/* Expandable Time Wheel Area */}
                        {editingTime?.id === goal.id && (
                            <div className="bg-surface/50 border border-border rounded-xl p-3">
                                <div className="text-center text-[10px] font-bold text-brand uppercase tracking-widest mb-1">
                                    Set {editingTime.field === 'startTime' ? 'Start' : 'End'} Time
                                </div>
                                <TimePickerWheel 
                                    time={editingTime.field === 'startTime' ? goal.startTime : goal.endTime}
                                    onChange={(val) => updateGoalField(goal.id, editingTime.field, val)}
                                />
                                <div className="text-center mt-2">
                                     <button 
                                        onClick={() => setEditingTime(null)}
                                        className="text-xs font-bold text-brand hover:text-orange-600 underline decoration-dotted transition-colors"
                                    >
                                        Done
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Bell className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Reminder</span>
                        </div>
                        
                        <div className="bg-surface-highlight p-1 rounded-xl flex text-center">
                            {REMINDER_OPTIONS.map(opt => {
                                const isSelected = goal.reminder && goal.reminderOffsetMinutes === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            updateGoalField(goal.id, 'reminderOffsetMinutes', opt.value);
                                            updateGoalField(goal.id, 'reminder', true);
                                        }}
                                        className={`
                                            flex-1 py-2 rounded-lg text-[11px] font-bold select-none ios-hover-wiggle
                                            ${isSelected 
                                                ? 'bg-card text-brand shadow-sm scale-100 animate-pop' 
                                                : 'text-secondary hover:text-primary'
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={() => startFocusSession(goal)}
                        className="w-full bg-gradient-to-r from-brand to-orange-700 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-brand/25 hover:shadow-brand/40 flex items-center justify-center space-x-2 group relative overflow-hidden ios-hover-wiggle"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <div className="absolute inset-0 opacity-20 animate-shimmer" />
                        <Play className="w-5 h-5 fill-current relative z-10" />
                        <span className="relative z-10">Start Focus Session</span>
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;
