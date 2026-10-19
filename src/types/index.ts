export type PracticeMode = 'single' | 'bill' | 'numbers' | 'names' | 'weak_spots' | 'timed';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type FontSizePreference = 'normal' | 'large' | 'xlarge';

export type BillLength = 5 | 10 | 15;

export interface Vegetable {
  id: string;
  manglish: string;
  malayalam: string;
  category?: string;
  isCustom?: boolean;
}

export interface TypistSettings {
  caseSensitive: boolean;
  showMalayalam: boolean;
  difficulty: Difficulty;
  soundEnabled: boolean;
  soundVolume: number;
  darkMode: boolean;
  fontSize: FontSizePreference;
  billLength: BillLength;
  timedDuration: number; // Duration in seconds (e.g. 300 for 5m, 600 for 10m, 900 for 15m)
  showKeypadInNumbersMode: boolean;
  dailyGoalMinutes: number;
}

export interface TargetLine {
  id: string;
  text: string;           // e.g. "Thakkali 12.5"
  name: string;           // "Thakkali"
  quantityStr: string;     // "12.5"
  malayalam: string;      // "തക്കാളി"
  isCompleted?: boolean;
  timeSpentMs?: number;
  errorsCount?: number;
}

export interface SessionResult {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  mode: PracticeMode;
  difficulty: Difficulty;
  durationSeconds: number;
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  totalMistakes: number;
  completedItemsCount: number;
  itemsPerMinute: number;
  slowestItems: Array<{ text: string; timeMs: number }>;
  mostMistypedItems: Array<{ text: string; mistakes: number }>;
  mistypedCharacters: Array<{ char: string; count: number }>;
}

export interface PersonalBests {
  overallWpm: number;
  highestAccuracy: number;
  singleWpm: number;
  billWpm: number;
  timedWpm: number;
  totalItemsBilled: number;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayPracticeSeconds: number;
  totalPracticeSeconds: number;
  personalBests: PersonalBests;
  history: SessionResult[];
  characterMistakeMap: Record<string, number>;
  wordMistakeMap: Record<string, number>;
  wordSpeedMap: Record<string, { totalMs: number; count: number }>;
  unlockedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: 'speed' | 'accuracy' | 'volume' | 'streak' | 'decimal';
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}
