// Point values for different activities
export const POINTS = {
  CONTENT_SUBMISSION: 10,
  CONTENT_APPROVED: 50,
  CONTENT_REJECTED: 0,
  REVIEW_SUBMISSION: 5,
  FIRST_CONTRIBUTION: 20,
  FIRST_REVIEW: 10,
} as const;

// Level thresholds
export const LEVELS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 4000,
  8: 8000,
  9: 16000,
  10: 32000,
} as const;

type LevelKey = keyof typeof LEVELS;

// Calculate level based on points
export function calculateLevel(points: number): number {
  const levels = Object.entries(LEVELS)
    .map(([level, threshold]) => ({
      level: parseInt(level),
      threshold
    }))
    .sort((a, b) => b.threshold - a.threshold);

  for (const { level, threshold } of levels) {
    if (points >= threshold) {
      return level;
    }
  }
  return 1;
}

// Calculate points needed for next level
export function pointsToNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevel = (currentLevel + 1) as LevelKey;
  const nextLevelThreshold = LEVELS[nextLevel];
  return nextLevelThreshold ? nextLevelThreshold - currentPoints : 0;
}