import { Difficulty, PracticeMode, TargetLine, UserStats, Vegetable } from '../types';

/**
 * Generate a mandi billing weight quantity
 * Range 0.25 to 99.999, mix of whole numbers and 1-3 decimals
 */
export function generateQuantity(difficulty: Difficulty): string {
  if (difficulty === 'easy') {
    // 60% whole numbers, 40% simple halves (.5, .25, .75)
    const isWhole = Math.random() < 0.6;
    if (isWhole) {
      const whole = Math.floor(Math.random() * 50) + 1; // 1 to 50
      return whole.toString();
    } else {
      const base = Math.floor(Math.random() * 30);
      const fractions = ['0.5', '0.25', '0.75', '1.5', '2.5', '5.5', '10.5', '12.5', '25.5'];
      return fractions[Math.floor(Math.random() * fractions.length)] || `${base}.5`;
    }
  }

  if (difficulty === 'medium') {
    // 1 to 2 decimal places, occasionally whole numbers
    const roll = Math.random();
    if (roll < 0.2) {
      return (Math.floor(Math.random() * 80) + 1).toString();
    } else if (roll < 0.6) {
      // 1 decimal place (e.g. 12.5, 4.2, 50.8)
      const val = (Math.random() * 75 + 0.5).toFixed(1);
      return val;
    } else {
      // 2 decimal places (e.g. 50.25, 3.75, 18.50)
      const commonFractions = [0.25, 0.5, 0.75, 0.1, 0.2, 0.8, 0.35, 0.65];
      const whole = Math.floor(Math.random() * 60) + 1;
      const frac = commonFractions[Math.floor(Math.random() * commonFractions.length)];
      return (whole + frac).toFixed(2);
    }
  }

  // Hard difficulty: up to 3 decimal places (mandi digital scale format: 3.750, 0.250, 48.625)
  const roll = Math.random();
  if (roll < 0.15) {
    return (Math.floor(Math.random() * 99) + 1).toString();
  } else if (roll < 0.5) {
    return (Math.random() * 90 + 0.25).toFixed(2);
  } else {
    // 3 decimals, typical mandi weigh scale 5g / 25g increments
    const whole = Math.floor(Math.random() * 95);
    const grams = Math.floor(Math.random() * 999) + 1;
    const padGrams = grams.toString().padStart(3, '0');
    return `${whole}.${padGrams}`;
  }
}

/**
 * Filter or pick vegetables suitable for difficulty
 */
export function getVegetablePool(vegetables: Vegetable[], difficulty: Difficulty): Vegetable[] {
  if (vegetables.length === 0) return [];

  if (difficulty === 'easy') {
    const easyPool = vegetables.filter((v) => v.manglish.length <= 8 && !v.manglish.includes(' '));
    return easyPool.length > 5 ? easyPool : vegetables;
  }

  if (difficulty === 'hard') {
    // Include longer names and multi-word names
    const hardPool = vegetables.filter((v) => v.manglish.length >= 8 || v.manglish.includes(' ') || v.manglish.includes('.'));
    return hardPool.length > 8 ? hardPool : vegetables;
  }

  return vegetables;
}

/**
 * Generate a single target billing line
 */
export function createTargetLine(
  mode: PracticeMode,
  vegetables: Vegetable[],
  difficulty: Difficulty,
  weakSpotList?: string[]
): TargetLine {
  const pool = getVegetablePool(vegetables, difficulty);

  let chosenVeg: Vegetable;
  if (mode === 'weak_spots' && weakSpotList && weakSpotList.length > 0) {
    // Pick from weak spot names if available
    const weakName = weakSpotList[Math.floor(Math.random() * weakSpotList.length)];
    const match = vegetables.find((v) => v.manglish.toLowerCase() === weakName.toLowerCase());
    chosenVeg = match || pool[Math.floor(Math.random() * pool.length)];
  } else {
    chosenVeg = pool[Math.floor(Math.random() * pool.length)] || {
      id: 'thakkali',
      manglish: 'Thakkali',
      malayalam: 'തക്കാളി',
    };
  }

  const quantityStr = generateQuantity(difficulty);
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (mode === 'names') {
    return {
      id,
      text: chosenVeg.manglish,
      name: chosenVeg.manglish,
      quantityStr: '',
      malayalam: chosenVeg.malayalam,
    };
  }

  if (mode === 'numbers') {
    return {
      id,
      text: quantityStr,
      name: 'Weight (kg)',
      quantityStr,
      malayalam: 'തൂക്കം',
    };
  }

  // Single line, Bill, Weak spots, or Timed: "<Manglish name> <quantity>"
  return {
    id,
    text: `${chosenVeg.manglish} ${quantityStr}`,
    name: chosenVeg.manglish,
    quantityStr,
    malayalam: chosenVeg.malayalam,
  };
}

/**
 * Generate a batch of lines for Bill Mode
 */
export function generateBillLines(
  vegetables: Vegetable[],
  difficulty: Difficulty,
  count: number = 10
): TargetLine[] {
  const pool = [...vegetables];
  // Shuffle for variety
  pool.sort(() => Math.random() - 0.5);

  const lines: TargetLine[] = [];
  for (let i = 0; i < count; i++) {
    const veg = pool[i % pool.length];
    const qty = generateQuantity(difficulty);
    lines.push({
      id: `bill-${i}-${Date.now()}`,
      text: `${veg.manglish} ${qty}`,
      name: veg.manglish,
      quantityStr: qty,
      malayalam: veg.malayalam,
      isCompleted: false,
    });
  }
  return lines;
}

/**
 * Identify top weak spots from UserStats
 */
export function analyzeWeakSpots(stats: UserStats): {
  topMistypedWords: Array<{ word: string; count: number }>;
  topMistypedChars: Array<{ char: string; count: number }>;
  hasEnoughData: boolean;
} {
  const wordMap = stats.wordMistakeMap || {};
  const charMap = stats.characterMistakeMap || {};

  const topMistypedWords = Object.entries(wordMap)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topMistypedChars = Object.entries(charMap)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalErrors = Object.values(charMap).reduce((a, b) => a + b, 0);

  return {
    topMistypedWords,
    topMistypedChars,
    hasEnoughData: totalErrors >= 5,
  };
}
