import type { DayHours } from './types';

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_HOURS: DayHours[] = WEEK_DAYS.map((day) => ({
  day,
  open: '09:00',
  close: '17:00',
  closed: day === 'Sunday',
}));

export const DEAL_CATEGORIES = [
  'Food & Drink',
  'Entertainment',
  'Shopping',
  'Health & Beauty',
  'Auto',
  'Services',
  'Travel',
  'Other',
];
