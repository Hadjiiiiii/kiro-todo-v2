export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Learning'];

// Keep the old export name as an alias for static references (e.g. CATEGORY_COLORS keys)
export const CATEGORIES = DEFAULT_CATEGORIES;

export const PRIORITIES = ['High', 'Medium', 'Low'];

export const STORAGE_KEY = 'task-manager-tasks';
export const SETTINGS_KEY = 'task-manager-settings';
export const CATEGORIES_KEY = 'task-manager-categories';

export const VIEWS = {
  KANBAN: 'kanban',
  LIST: 'list',
  CALENDAR: 'calendar',
  STATS: 'stats',
  HABITS: 'habits',
  JOURNAL: 'journal',
  FINANCE: 'finance',
};

export const FINANCE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Salary', 'Freelance', 'Other'];

export const RECURRENCE_PATTERNS = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

/* -------------------------------------------------------------------------- */
/*  Claude-inspired design tokens (warm dark theme, terracotta accent)        */
/* -------------------------------------------------------------------------- */

export const THEME = {
  // Backgrounds & surfaces (warm near-blacks)
  bg: '#141413', // app background (warmest base)
  surface: '#1f1e1d', // panels / rails
  surfaceHover: '#262624', // hover / slightly elevated
  elevated: '#2b2a27', // dialogs, popovers

  // Borders (subtle warm)
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',

  // Text
  text: '#faf9f5', // primary (warm cream)
  textSecondary: '#b0aea5', // secondary
  textMuted: '#8a887f', // muted / captions

  // Accent (terracotta / clay)
  accent: '#d97757',
  accentHover: '#c15f3c',
  accentSoft: 'rgba(217, 119, 87, 0.14)', // tinted background
  accentSoftBorder: 'rgba(217, 119, 87, 0.3)',

  // Secondary accents
  blue: '#6a9bcc',
  green: '#788c5d',

  // Status
  error: '#e07856',
  success: '#788c5d',
  warning: '#d9a441',

  // Radii
  radius: 12,
  radiusLg: 16,
  radiusXl: 20,

  // Subtle shadows (soft, warm dark)
  shadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
  shadowLight: '0 2px 12px rgba(0, 0, 0, 0.25)',
};

export const PRIORITY_COLORS = {
  High: '#d97757', // terracotta
  Medium: '#d9a441', // warm amber
  Low: '#788c5d', // warm green
};

export const CATEGORY_COLORS = {
  Work: '#d97757', // terracotta
  Personal: '#6a9bcc', // blue
  Shopping: '#c98a5e', // warm tan
  Health: '#788c5d', // green
  Learning: '#d9a441', // amber
};

/**
 * Extended warm palette used to assign colors to user-created categories.
 * When a category isn't in the static map above, we pick from this list
 * based on its index.
 */
export const CATEGORY_COLOR_PALETTE = [
  '#d97757', '#6a9bcc', '#c98a5e', '#788c5d', '#d9a441',
  '#b07bb0', '#5da3a0', '#cf7e7e', '#8a9b4e', '#c78d3d',
];

/**
 * Get a color for any category — mapped if known, or cycled from palette.
 */
export function getCategoryColor(category, allCategories = []) {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const idx = allCategories.indexOf(category);
  return CATEGORY_COLOR_PALETTE[(idx >= 0 ? idx : 0) % CATEGORY_COLOR_PALETTE.length];
}

/**
 * Flat warm surface tokens. Kept under the historical `GLASS` export name so
 * existing imports keep working, but the values are now flat (no blur / no
 * translucent-white glassmorphism) to match the Claude aesthetic.
 */
export const GLASS = {
  background: THEME.surface,
  backgroundHover: THEME.surfaceHover,
  border: `1px solid ${THEME.border}`,
  borderLight: `1px solid ${THEME.borderStrong}`,
  blur: 'none',
  blurHeavy: 'none',
  shadow: THEME.shadow,
  shadowLight: THEME.shadowLight,
};

// Alias for clearer intent in new code.
export const SURFACE = GLASS;
