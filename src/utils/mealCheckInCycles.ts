import {
  addDays,
  isAfter,
  isBefore,
} from 'date-fns';
import type {
  MealCheckIn,
  MealCheckInCycleConfig,
  MealCheckInCycleStats,
} from '../types';

export interface MealCheckInCycleRange {
  config: MealCheckInCycleConfig;
  index: number;
  startDate: Date;
  endDate: Date;
}

const parseDate = (dateStr: string): Date => new Date(`${dateStr}T00:00:00`);

export const normalizeMealCheckInCycles = (
  configs: MealCheckInCycleConfig[]
): MealCheckInCycleConfig[] => {
  const byStartDate = new Map<string, MealCheckInCycleConfig>();

  configs.forEach((config) => {
    if (!config.startDate || config.cycleDays < 1) return;
    byStartDate.set(config.startDate, config);
  });

  return Array.from(byStartDate.values()).sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
};

export const getMealCheckInCycleRanges = (
  configs: MealCheckInCycleConfig[]
): MealCheckInCycleRange[] => {
  return normalizeMealCheckInCycles(configs).map((config, index) => {
    const startDate = parseDate(config.startDate);
    return {
      config,
      index: index + 1,
      startDate,
      endDate: addDays(startDate, config.cycleDays - 1),
    };
  });
};

export const getMealCheckInCycleForDate = (
  dateStr: string,
  configs: MealCheckInCycleConfig[]
): MealCheckInCycleRange | null => {
  const date = parseDate(dateStr);

  return (
    getMealCheckInCycleRanges(configs).find(
      (range) =>
        !isBefore(date, range.startDate) && !isAfter(date, range.endDate)
    ) ?? null
  );
};

export const getEarliestMealCheckInCycleStart = (
  configs: MealCheckInCycleConfig[]
): string | null => normalizeMealCheckInCycles(configs)[0]?.startDate ?? null;

export const calculateMealCheckInCycleStats = (
  configs: MealCheckInCycleConfig[],
  checkIns: MealCheckIn[]
): MealCheckInCycleStats => {
  const ranges = getMealCheckInCycleRanges(configs);
  const totalCycleDays = ranges.reduce(
    (total, range) => total + range.config.cycleDays,
    0
  );

  const checkedInDays = new Set(
    checkIns
      .filter((checkIn) => {
        const checkInDate = parseDate(checkIn.date);
        return ranges.some(
          (range) =>
            !isBefore(checkInDate, range.startDate) &&
            !isAfter(checkInDate, range.endDate)
        );
      })
      .map((checkIn) => checkIn.date)
  ).size;

  return {
    totalCycleDays,
    checkedInDays,
    percentage:
      totalCycleDays === 0
        ? 0
        : Math.min(100, Math.round((checkedInDays / totalCycleDays) * 100)),
  };
};
