const tintColorLight = '#5e5e5c'; // primary
const tintColorDark = '#5e5e5c';

// Zen Corporate Palette
export const ZenColors = {
  surfaceBright: '#fcf8f7',
  surface: '#fcf8f7',
  surfaceContainerLow: '#f7f3f2',
  surfaceContainer: '#f1edec',
  surfaceContainerHigh: '#ebe7e6',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant: '#e5e2e1',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#454742',
  outline: '#767872',
  outlineVariant: '#c6c7c0',
  primary: '#5e5e5c',
  onPrimary: '#ffffff',
  primaryContainer: '#fdfbf7',
  primaryFixed: '#e4e2de',
  primaryFixedDim: '#c8c6c3',
  secondary: '#5f5e5b',
  onSecondary: '#ffffff',
  secondaryContainer: '#e5e2dd',
  onSecondaryContainer: '#656461',
  secondaryFixed: '#e5e2dd',
  secondaryFixedDim: '#c9c6c2',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  
  // Quadrant specific colors
  q1: '#ba1a1a', // error (red)
  q1Container: '#ffdad6',
  q2: '#3b82f6', // blue
  q2Container: '#eff6ff',
  q3: '#f97316', // orange
  q3Container: '#fff7ed',
  q4: '#767872', // outline (grey)
  q4Container: '#f1edec',
};

export default {
  light: {
    text: ZenColors.onSurface,
    background: ZenColors.surfaceBright,
    tint: tintColorLight,
    tabIconDefault: ZenColors.outline,
    tabIconSelected: tintColorLight,
    ...ZenColors,
  },
  dark: {
    // Forcing light mode colors for the entire app for a unified Zen Corporate look
    text: ZenColors.onSurface,
    background: ZenColors.surfaceBright,
    tint: tintColorLight,
    tabIconDefault: ZenColors.outline,
    tabIconSelected: tintColorLight,
    ...ZenColors,
  },
};
