export type AppView = 'login' | 'onboarding' | 'stats' | 'goals' | 'chat' | 'tools';

export interface UserProfile {
  name: string;
  role: 'student' | 'professional';
}

export type GoalDay = 'today' | 'tomorrow' | 'custom';

export interface Goal {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  isActive: boolean;
  completed: boolean; // New field
  date: string;      // "YYYY-MM-DD" (Effective date)
  day: GoalDay;      // "today" | "tomorrow" | "custom"
  customDate?: string; // "YYYY-MM-DD" (Stored custom date)
  reminder: boolean;
  reminderOffsetMinutes: number; // e.g. 0, 5, 10, 15, 30, 60
}

export interface DailyStats {
  date: string;            // 'YYYY-MM-DD'
  focusMinutes: number;
  scrollMinutes: number;
  productivityPercent: number; // 0–100
}

export type DuckMood = 'angry' | 'disappointed' | 'encouraging';