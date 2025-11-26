import React, { useState } from 'react';
import { Bell, Target, Plus, Trash2, Clock, X, Shield, ShieldAlert, User, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface ToolsProps {
  isFocusModeOn: boolean;
  setFocusMode: (on: boolean) => void;
  onSimulateDistraction: (appName: string) => void;
  userProfile: UserProfile | null;
  onOpenMenu: () => void;
}

const Tools: React.FC<ToolsProps> = ({ isFocusModeOn, setFocusMode, onSimulateDistraction, userProfile, onOpenMenu }) => {
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Daily Check-in', time: '09:00', enabled: true, icon: Bell },
    { id: 2, title: 'Goal Review', time: '17:00', enabled: false, icon: Target },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [showAdd, setShowAdd] = useState(false);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateTime = (id: number, newTime: string) => {
     setReminders(reminders.map(r => r.id === id ? { ...r, time: newTime } : r));
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setReminders([
      ...reminders,
      {
        id: Date.now(),
        title: newTitle,
        time: newTime,
        enabled: true,
        icon: Bell
      }
    ]);
    setNewTitle('');
    setNewTime('09:00');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col h-full pb-24 pt-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto no-scrollbar">
      {/* Header with User Icon */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Tools & Reminders</h1>
        <button 
            onClick={onOpenMenu}
            className="w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all border bg-card text-primary border-border hover:bg-surface ios-press-btn"
        >
            <User className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">Schedule</h2>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-card border border-border text-brand hover:bg-surface w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-90 ios-press-btn"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {showAdd && (
          <div className="bg-card p-4 rounded-[20px] shadow-sm mb-4 border border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Reminder title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 placeholder:text-secondary text-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 flex items-center">
                   <Clock className="w-4 h-4 text-secondary mr-2" />
                   <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-transparent text-sm text-primary focus:outline-none w-full"
                   />
                </div>
                <button 
                  onClick={handleAdd}
                  className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-orange-800 transition-all ios-press-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-[24px] shadow-sm overflow-hidden border border-transparent">
          {reminders.length === 0 ? (
             <div className="p-6 text-center text-secondary text-sm">No reminders set. Tap + to add one.</div>
          ) : (
            reminders.map((reminder, index) => {
              const Icon = reminder.icon;
              return (
                <div key={reminder.id} className={`p-4 flex items-center justify-between ios-float-card ${index !== reminders.length -1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-primary truncate pr-2">{reminder.title}</div>
                      <input 
                          type="time" 
                          value={reminder.time}
                          onChange={(e) => updateTime(reminder.id, e.target.value)}
                          className="text-sm text-secondary bg-transparent focus:outline-none cursor-pointer hover:text-brand transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 shrink-0">
                    <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 text-secondary hover:text-red-500 transition-colors active:scale-90"
                        title="Delete reminder"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => toggleReminder(reminder.id)}
                        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand/20 ${reminder.enabled ? 'bg-brand' : 'bg-border'}`}
                    >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${reminder.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mb-10 relative">
         <div className="absolute inset-0 z-10 flex items-center justify-center">
             <div className="bg-black/80 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full shadow-xl">
                 <span className="text-[10px] font-bold text-white uppercase tracking-wider">Coming Soon</span>
             </div>
         </div>
         
         <div className="opacity-40 pointer-events-none select-none filter blur-[1px]">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">Integrations</h2>
            </div>
            <div className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-border">
               <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <div className="font-semibold text-primary">Calendar Sync</div>
                     <div className="text-xs text-secondary">Sync with Google Calendar</div>
                  </div>
               </div>
               <div className="w-11 h-6 bg-border rounded-full" />
            </div>
         </div>
      </section>

      {/* Temptation Simulator */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider ml-1">Temptation Simulator</h2>
          
          {/* Focus Mode Toggle for Testing */}
          <div className="flex items-center space-x-2 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
            <span className={`text-[10px] font-bold ${isFocusModeOn ? 'text-brand' : 'text-secondary'}`}>FOCUS MODE</span>
             <button 
                onClick={() => setFocusMode(!isFocusModeOn)}
                className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out ${isFocusModeOn ? 'bg-brand' : 'bg-border'}`}
            >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${isFocusModeOn ? 'translate-x-3' : 'translate-x-0'} ${isFocusModeOn ? 'animate-shimmer' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-6 shadow-sm ios-float-card">
          <div className="flex items-center space-x-3 mb-4">
             <div className={`p-2 rounded-lg transition-colors ${isFocusModeOn ? 'bg-red-500/10' : 'bg-surface'}`}>
                {isFocusModeOn ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <Shield className="w-5 h-5 text-secondary" />}
             </div>
             <p className="text-sm text-secondary leading-tight">
               {isFocusModeOn 
                 ? "Focus Mode is ON. Opening these apps will trigger an intervention." 
                 : "Focus Mode is OFF. You can open these apps freely."}
             </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-2">
             <button onClick={() => onSimulateDistraction('TikTok')} className="aspect-square rounded-2xl bg-black text-white font-bold text-[10px] flex items-center justify-center hover:opacity-80 transition-all shadow-sm ios-press-btn">TikTok</button>
             <button onClick={() => onSimulateDistraction('Instagram')} className="aspect-square rounded-2xl bg-gradient-to-tr from-yellow-400 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center hover:opacity-80 transition-all shadow-sm ios-press-btn">Insta</button>
             <button onClick={() => onSimulateDistraction('YouTube')} className="aspect-square rounded-2xl bg-red-600 text-white font-bold text-[10px] flex items-center justify-center hover:opacity-80 transition-all shadow-sm ios-press-btn">YT</button>
             <button onClick={() => onSimulateDistraction('Twitter/X')} className="aspect-square rounded-2xl bg-blue-400 text-white font-bold text-[10px] flex items-center justify-center hover:opacity-80 transition-all shadow-sm ios-press-btn">X</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tools;