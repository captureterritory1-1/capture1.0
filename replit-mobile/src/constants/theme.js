// Theme constants matching your web app's design
export const COLORS = {
  primary: '#EF4444', // Ruby Red (from web app)
  secondary: '#10B981',
  background: '#0F172A', // Dark theme
  surface: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',

  // Territory colors (matching web app preferences)
  territoryColors: {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};
