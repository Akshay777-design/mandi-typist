import { DEFAULT_VEGETABLES } from '../data/defaultVegetables';
import { Badge, Difficulty, PracticeMode, SessionResult, TypistSettings, UserStats, Vegetable } from '../types';

const STORAGE_KEY_VEGETABLES = 'mandi_typist_vegetables_v2';
const STORAGE_KEY_SETTINGS = 'mandi_typist_settings_v1';
const STORAGE_KEY_STATS = 'mandi_typist_stats_v1';

export const DEFAULT_SETTINGS: TypistSettings = {
  caseSensitive: false,
  showMalayalam: true,
  difficulty: 'medium',
  soundEnabled: true,
  soundVolume: 0.6,
  darkMode: false,
  fontSize: 'large',
  billLength: 10,
  timedDuration: 300,
  showKeypadInNumbersMode: true,
  dailyGoalMinutes: 10,
};

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_bill',
    title: 'First Mandi Entry',
    description: 'Completed your very first practice session.',
    category: 'volume',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'speed_30',
    title: 'Brisk Cashier',
    description: 'Reached 30+ WPM in a session.',
    category: 'speed',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'speed_50',
    title: 'Mandi Flash',
    description: 'Reached 50+ WPM in a session.',
    category: 'speed',
    icon: '🚀',
    unlocked: false,
  },
  {
    id: 'speed_70',
    title: 'Speed Demon Typist',
    description: 'Reached 70+ WPM in a session.',
    category: 'speed',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'accuracy_95',
    title: 'Sharp Eyes',
    description: 'Finished a session with 95%+ accuracy.',
    category: 'accuracy',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'accuracy_99',
    title: 'Zero Shortage Billing',
    description: 'Finished a session with 99%+ accuracy (min 20 characters).',
    category: 'accuracy',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'decimal_master',
    title: 'Decimal Virtuoso',
    description: 'Typed 50 decimal quantities with zero errors on the period key.',
    category: 'decimal',
    icon: '🔢',
    unlocked: false,
  },
  {
    id: 'bill_collector_5',
    title: 'Market Bookkeeper',
    description: 'Completed 5 full bill mode sheets.',
    category: 'volume',
    icon: '🧾',
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: '3-Day Market Habit',
    description: 'Maintained a 3-day consecutive typing streak.',
    category: 'streak',
    icon: '📅',
    unlocked: false,
  },
  {
    id: 'streak_7',
    title: 'Wholesale Master',
    description: 'Maintained a 7-day consecutive typing streak.',
    category: 'streak',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'timed_marathon',
    title: 'Mandi Rush Champion',
    description: 'Conquered a 5, 10, or 15-minute wholesale timed challenge.',
    category: 'speed',
    icon: '⏱️',
    unlocked: false,
  },
];

const INITIAL_STATS: UserStats = {
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayPracticeSeconds: 0,
  totalPracticeSeconds: 0,
  personalBests: {
    overallWpm: 0,
    highestAccuracy: 0,
    singleWpm: 0,
    billWpm: 0,
    timedWpm: 0,
    totalItemsBilled: 0,
  },
  history: [],
  characterMistakeMap: {},
  wordMistakeMap: {},
  wordSpeedMap: {},
  unlockedBadgeIds: [],
};

export const storage = {
  loadVegetables(): Vegetable[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VEGETABLES);
      if (!data) return DEFAULT_VEGETABLES;
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return DEFAULT_VEGETABLES;
    } catch {
      return DEFAULT_VEGETABLES;
    }
  },

  saveVegetables(vegetables: Vegetable[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_VEGETABLES, JSON.stringify(vegetables));
    } catch (e) {
      console.error('Failed to save vegetables:', e);
    }
  },

  resetVegetables(): Vegetable[] {
    this.saveVegetables(DEFAULT_VEGETABLES);
    return DEFAULT_VEGETABLES;
  },

  loadSettings(): TypistSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: TypistSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  loadStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (!data) return INITIAL_STATS;
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_STATS,
        ...parsed,
        personalBests: { ...INITIAL_STATS.personalBests, ...(parsed.personalBests || {}) },
      };
    } catch {
      return INITIAL_STATS;
    }
  },

  saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  recordSession(result: SessionResult): { updatedStats: UserStats; newlyUnlockedBadges: Badge[] } {
    const stats = this.loadStats();
    const todayStr = new Date().toISOString().split('T')[0];

    // Update streak logic
    let streakDays = stats.streakDays || 1;
    if (stats.lastActiveDate) {
      const lastDate = new Date(stats.lastActiveDate);
      const today = new Date(todayStr);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    // Accumulate time
    const todayPracticeSeconds = (stats.lastActiveDate === todayStr ? stats.todayPracticeSeconds : 0) + result.durationSeconds;
    const totalPracticeSeconds = stats.totalPracticeSeconds + result.durationSeconds;

    // Update PB
    const pb = { ...stats.personalBests };
    if (result.wpm > pb.overallWpm) pb.overallWpm = result.wpm;
    if (result.accuracy > pb.highestAccuracy) pb.highestAccuracy = result.accuracy;
    if (result.mode === 'single' && result.wpm > pb.singleWpm) pb.singleWpm = result.wpm;
    if (result.mode === 'bill' && result.wpm > pb.billWpm) pb.billWpm = result.wpm;
    if (result.mode === 'timed' && result.wpm > pb.timedWpm) pb.timedWpm = result.wpm;
    pb.totalItemsBilled += result.completedItemsCount;

    // History (keep last 100 sessions)
    const history = [result, ...(stats.history || [])].slice(0, 100);

    // Mistake maps
    const charMap = { ...(stats.characterMistakeMap || {}) };
    result.mistypedCharacters.forEach((item) => {
      charMap[item.char] = (charMap[item.char] || 0) + item.count;
    });

    const wordMap = { ...(stats.wordMistakeMap || {}) };
    result.mostMistypedItems.forEach((item) => {
      wordMap[item.text] = (wordMap[item.text] || 0) + item.mistakes;
    });

    const speedMap = { ...(stats.wordSpeedMap || {}) };
    result.slowestItems.forEach((item) => {
      const prev = speedMap[item.text] || { totalMs: 0, count: 0 };
      speedMap[item.text] = {
        totalMs: prev.totalMs + item.timeMs,
        count: prev.count + 1,
      };
    });

    // Check Badges
    const newlyUnlockedBadges: Badge[] = [];
    const currentUnlocked = new Set(stats.unlockedBadgeIds || []);

    const tryUnlock = (badgeId: string) => {
      if (!currentUnlocked.has(badgeId)) {
        currentUnlocked.add(badgeId);
        const b = ALL_BADGES.find((x) => x.id === badgeId);
        if (b) {
          newlyUnlockedBadges.push({ ...b, unlocked: true, unlockedAt: Date.now() });
        }
      }
    };

    // First session
    tryUnlock('first_bill');

    // Speeds
    if (result.wpm >= 30) tryUnlock('speed_30');
    if (result.wpm >= 50) tryUnlock('speed_50');
    if (result.wpm >= 70) tryUnlock('speed_70');

    // Accuracy
    if (result.accuracy >= 95 && result.totalCharacters >= 15) tryUnlock('accuracy_95');
    if (result.accuracy >= 99 && result.totalCharacters >= 25) tryUnlock('accuracy_99');

    // Bill count
    const billSessions = history.filter((s) => s.mode === 'bill').length;
    if (billSessions >= 5) tryUnlock('bill_collector_5');

    // Timed challenge check
    if (result.mode === 'timed' && result.durationSeconds >= 270) {
      tryUnlock('timed_marathon');
    }

    // Decimal master check
    const dotErrors = charMap['.'] || 0;
    if (dotErrors === 0 && pb.totalItemsBilled >= 30) tryUnlock('decimal_master');

    // Streaks
    if (streakDays >= 3) tryUnlock('streak_3');
    if (streakDays >= 7) tryUnlock('streak_7');

    const updatedStats: UserStats = {
      streakDays,
      lastActiveDate: todayStr,
      todayPracticeSeconds,
      totalPracticeSeconds,
      personalBests: pb,
      history,
      characterMistakeMap: charMap,
      wordMistakeMap: wordMap,
      wordSpeedMap: speedMap,
      unlockedBadgeIds: Array.from(currentUnlocked),
    };

    this.saveStats(updatedStats);
    return { updatedStats, newlyUnlockedBadges };
  },

  exportAllDataJson(): string {
    const vegetables = this.loadVegetables();
    const settings = this.loadSettings();
    const stats = this.loadStats();
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        vegetables,
        settings,
        stats,
      },
      null,
      2
    );
  },

  importDataJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON file format' };
      }
      if (Array.isArray(data.vegetables)) {
        this.saveVegetables(data.vegetables);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      if (data.stats && typeof data.stats === 'object') {
        this.saveStats({ ...INITIAL_STATS, ...data.stats });
      }
      return { success: true, message: 'Data imported successfully!' };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, message: err?.message || 'Failed to parse JSON file' };
    }
  },
};
