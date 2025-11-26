import React, { useState, useEffect, useRef } from 'react';
import { AppView, Goal, DailyStats, UserProfile, DuckMood } from './types';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Tools from './components/Tools';
import AIChat from './components/AIChat';
import FocusNudgeBanner from './components/FocusNudgeBanner';
import { User, Settings, LogOut, X, Bell, Volume2, Moon, ChevronRight, Pencil, Mail } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Initialize with just today's empty stats for a clean "new user" experience
const INITIAL_STATS: DailyStats[] = [{
  date: new Date().toISOString().split('T')[0],
  focusMinutes: 0,
  scrollMinutes: 0,
  productivityPercent: 0,
}];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('focusbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Authentication State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        if (userProfile) {
          // If we are currently on login, go to stats. otherwise keep view
          setView(prev => prev === 'login' ? 'stats' : prev);
        } else {
          setView('onboarding');
        }
      } else {
        // User is signed out
        setView('login');
      }
    });

    return () => unsubscribe();
  }, [userProfile]);
  
  // Focus Mode State & Nudge State
  const [isFocusModeOn, setIsFocusModeOn] = useState(true); // Default to on for immediate testing
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [nudgeMood, setNudgeMood] = useState<DuckMood | undefined>(undefined);
  const [nudgeBreakOptions, setNudgeBreakOptions] = useState<number[]>([5, 10]);

  // Global Menu & Modal States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Profile Edit State (Lifted for global access)
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'professional'>('student');

  // Settings State (Mock)
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    darkMode: true, // Default to true (Dark mode / Black background)
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync edit state when profile changes or modal opens
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditRole(userProfile.role);
    }
  }, [userProfile, showProfileModal]);

  const handleSaveProfile = () => {
    if (editName.trim()) {
        const newProfile = { name: editName, role: editRole };
        handleUpdateProfile(newProfile);
        setShowProfileModal(false);
        setIsMenuOpen(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Load goals from localStorage or default
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('focusbuddy_goals');
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((g: any) => ({
          ...g,
          date: g.date || today,
          day: g.day || 'today', // Default to 'today' if missing from old data
          customDate: g.customDate || (g.day === 'custom' ? g.date : undefined),
          startTime: g.startTime || '09:00',
          endTime: g.endTime || '10:00',
          reminder: g.reminder !== undefined ? g.reminder : false,
          reminderOffsetMinutes: typeof g.reminderOffsetMinutes === 'number' ? g.reminderOffsetMinutes : 15,
          completed: g.completed !== undefined ? g.completed : false,
          isActive: false 
        }));
      } catch (error) {
        console.error("Failed to parse saved goals:", error);
      }
    }

    return [
      { 
        id: '1', 
        title: 'Finish Project Report', 
        startTime: '14:00', 
        endTime: '16:00', 
        isActive: true, 
        completed: false, 
        date: today, 
        day: 'today',
        reminder: true, 
        reminderOffsetMinutes: 15 
      },
      { 
        id: '2', 
        title: 'Read Documentation', 
        startTime: '10:00', 
        endTime: '11:30', 
        isActive: false, 
        completed: false, 
        date: today, 
        day: 'today',
        reminder: false, 
        reminderOffsetMinutes: 30 
      },
    ];
  });

  const [dailyStats, setDailyStats] = useState<DailyStats[]>(INITIAL_STATS);

  const currentStreak = (() => {
    let streak = 0;
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      if (dailyStats[i].focusMinutes > 0) streak++;
      else break;
    }
    return streak;
  })();

  const handleResetDailyStats = () => {
    setDailyStats(prevStats => {
      const newStats = [...prevStats];
      const todayIndex = newStats.length - 1;
      if (todayIndex >= 0) {
        newStats[todayIndex] = {
          ...newStats[todayIndex],
          focusMinutes: 0,
          scrollMinutes: 0,
          productivityPercent: 0
        };
      }
      return newStats;
    });
  };

  useEffect(() => {
    localStorage.setItem('focusbuddy_goals', JSON.stringify(goals));
  }, [goals]);

  // View transition logic is now handled by useEffect/onAuthStateChanged
  // However, Login component still calls onSignIn for immediate feedback or legacy reasons
  const handleLoginSuccess = () => {
    // This is optional if useEffect handles everything, but keeps the flow explicit
    if (userProfile) {
      setView('stats');
    } else {
      setView('onboarding');
    }
  };

  const handleOnboardingComplete = (name: string, role: 'student' | 'professional') => {
    const profile: UserProfile = { name, role };
    setUserProfile(profile);
    localStorage.setItem('focusbuddy_user', JSON.stringify(profile));
    setView('stats');
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('focusbuddy_user', JSON.stringify(newProfile));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      localStorage.removeItem('focusbuddy_user');
      // setView('login') is handled by onAuthStateChanged
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const triggerFocusNudge = (appName: string) => {
    if (!isFocusModeOn) {
      console.log("Focus mode is OFF, no nudge.");
      return;
    }

    // Slightly roast the user based on the app
    let roast = "Distraction isn't the answer.";
    switch (appName) {
      case 'TikTok':
        roast = "That 15-second dopamine hit isn't worth your future.";
        break;
      case 'Instagram':
        roast = "Comparing your life to strangers won't help you build yours.";
        break;
      case 'YouTube':
        roast = "Just 'one' video? We both know that's a lie.";
        break;
      case 'Twitter/X':
        roast = "Doomscrolling won't solve your problems.";
        break;
      default:
        roast = "Stop procrastinating and be legendary.";
    }

    setNudgeMessage(
      `You just opened ${appName}. ${roast} Get back to it or take a short break?`
    );

    // Context Logic for Mood
    // High dopamine/addictive apps -> Angry
    // Social/News -> Disappointed
    const highDistractionApps = ['TikTok', 'Instagram', 'YouTube'];
    const mediumDistractionApps = ['Twitter/X', 'Facebook', 'Reddit'];
    
    if (highDistractionApps.includes(appName)) {
      setNudgeMood('angry');
    } else if (mediumDistractionApps.includes(appName)) {
      setNudgeMood('disappointed');
    } else {
      setNudgeMood('encouraging'); // Default gentle nudge for others
    }

    setNudgeBreakOptions([5, 10]);
    setNudgeVisible(true);
  };

  const handleGetBackToWork = () => {
    setNudgeVisible(false);
    setView('goals');
  };

  const handleSelectBreak = (minutes: number) => {
    console.log(`User chose a ${minutes} minute break`);
    setNudgeVisible(false);
  };

  // Determine global class based on darkMode setting
  // If darkMode is TRUE (default), we use the root vars (Dark).
  // If darkMode is FALSE, we apply 'light-mode' class.
  const themeClass = !settings.darkMode ? 'light-mode' : '';

  if (view === 'login') {
    return (
      <div className={`w-full min-h-screen bg-page text-primary ${themeClass}`}>
         <Login onSignIn={handleLoginSuccess} />
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <div className={`w-full min-h-screen bg-page text-primary ${themeClass}`}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className={`h-screen w-full bg-page text-primary font-sans flex flex-col relative overflow-hidden ${themeClass}`}>
      
      <FocusNudgeBanner
        visible={nudgeVisible}
        message={nudgeMessage}
        mood={nudgeMood}
        breakOptions={nudgeBreakOptions}
        onGetBackToWork={handleGetBackToWork}
        onSelectBreak={handleSelectBreak}
        onDismiss={() => setNudgeVisible(false)}
      />

      {/* --- Global Modals --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-primary">Edit Profile</h3>
                    <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-surface rounded-full transition-colors">
                        <X className="w-5 h-5 text-secondary" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Name</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all text-primary font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Role</label>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setEditRole('student')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${editRole === 'student' ? 'bg-brand text-white border-brand' : 'bg-card text-secondary border-border hover:bg-surface'}`}
                            >
                                Student
                            </button>
                            <button 
                                onClick={() => setEditRole('professional')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${editRole === 'professional' ? 'bg-brand text-white border-brand' : 'bg-card text-secondary border-border hover:bg-surface'}`}
                            >
                                Professional
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        className="w-full bg-brand text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-orange-800 transition-all mt-4 ios-hover-wiggle"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-primary">App Preferences</h3>
                    <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-surface rounded-full transition-colors">
                        <X className="w-5 h-5 text-secondary" />
                    </button>
                </div>

                <div className="space-y-2">
                    <button onClick={() => toggleSetting('notifications')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Bell className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-primary">Notifications</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-1 transition-colors ${settings.notifications ? 'bg-brand' : 'bg-border'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    <button onClick={() => toggleSetting('sounds')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                <Volume2 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-primary">Sound Effects</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-1 transition-colors ${settings.sounds ? 'bg-brand' : 'bg-border'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.sounds ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>

                     <button onClick={() => toggleSetting('darkMode')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-500/10 text-secondary rounded-lg">
                                <Moon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-primary">Dark Mode</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-brand' : 'bg-border'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border text-center">
                    <p className="text-xs text-secondary">Version 1.2.0</p>
                </div>
            </div>
        </div>
      )}

      {/* --- Global Menu Dropdown --- */}
      {isMenuOpen && (
        <div ref={menuRef} className="absolute right-6 top-16 w-72 bg-card rounded-2xl shadow-xl border border-border p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[55]">
            <div className="p-3 border-b border-border mb-2">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Account</p>
                    <button 
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsMenuOpen(false); 
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-500/10 px-2 py-0.5 rounded-full transition-colors"
                    >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand to-orange-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-primary text-sm truncate">{userProfile?.name || 'User'}</p>
                        <p className="text-xs text-secondary capitalize">{userProfile?.role || 'Member'}</p>
                      </div>
                </div>
            </div>

            <button 
                onClick={() => {
                    setShowSettingsModal(true);
                    setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group text-left"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-surface rounded-lg text-secondary group-hover:text-brand group-hover:bg-card transition-colors border border-transparent group-hover:border-border group-hover:shadow-sm">
                        <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">Settings</span>
                        <span className="text-[10px] text-secondary">App preferences</span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary/50" />
            </button>

            {/* Support Link */}
            <button 
                onClick={() => {
                    window.location.href = 'mailto:focusbuddyysup@gmail.com';
                    setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group text-left"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-surface rounded-lg text-secondary group-hover:text-brand group-hover:bg-card transition-colors border border-transparent group-hover:border-border group-hover:shadow-sm">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">Support</span>
                        <span className="text-[10px] text-secondary">focusbuddyysup@gmail.com</span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary/50" />
            </button>

              <div className="h-px bg-border my-2" />

            <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors group"
            >
                  <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">Log Out</span>
            </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {view === 'stats' && (
          <Dashboard 
            dailyStats={dailyStats} 
            userProfile={userProfile}
            onOpenMenu={() => setIsMenuOpen(true)}
            onResetStats={handleResetDailyStats}
          />
        )}
        {view === 'goals' && (
          <Goals 
            goals={goals} 
            setGoals={setGoals} 
            streak={currentStreak}
            userProfile={userProfile}
            onOpenMenu={() => setIsMenuOpen(true)}
          />
        )}
        {view === 'chat' && (
          <AIChat 
            userProfile={userProfile}
            onOpenMenu={() => setIsMenuOpen(true)}
          />
        )}
        {view === 'tools' && (
          <Tools 
            isFocusModeOn={isFocusModeOn} 
            setFocusMode={setIsFocusModeOn}
            onSimulateDistraction={triggerFocusNudge} 
            userProfile={userProfile}
            onOpenMenu={() => setIsMenuOpen(true)}
          />
        )}
      </main>
      
      <BottomNav current={view} onChange={setView} />
    </div>
  );
};

export default App;