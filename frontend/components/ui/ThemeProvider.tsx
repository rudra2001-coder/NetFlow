'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Button } from './Button';

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

// Theme Configuration
export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// Theme Colors Configuration
const themeColors: Record<ThemeColor, { primary: string; accent: string }> = {
  blue: { primary: '#0ea5e9', accent: '#38bdf8' },
  purple: { primary: '#8b5cf6', accent: '#a78bfa' },
  green: { primary: '#22c55e', accent: '#4ade80' },
  orange: { primary: '#f97316', accent: '#fb923c' },
  red: { primary: '#ef4444', accent: '#f87171' },
  pink: { primary: '#ec4899', accent: '#f472b6' },
};

// Context
interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  setColor: (color: ThemeColor) => void;
  isDark: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Storage Key
const THEME_STORAGE_KEY = 'netflow-theme';

// Default Theme
const defaultTheme: ThemeConfig = {
  mode: 'system',
  color: 'blue',
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
};

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Partial<ThemeConfig>;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme: defaultThemeProp,
  storageKey = THEME_STORAGE_KEY,
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}) => {
  // Initialize theme from storage or defaults
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return { ...defaultTheme, ...defaultThemeProp };
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultTheme, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored theme:', e);
    }

    return { ...defaultTheme, ...defaultThemeProp };
  });

  const [isDark, setIsDark] = useState(false);

  // Calculate isDark based on mode and system preference
  useEffect(() => {
    const updateIsDark = () => {
      if (theme.mode === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme.mode === 'dark');
      }
    };

    updateIsDark();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        updateIsDark();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Add transition blocker if needed
    if (disableTransitionOnChange) {
      root.classList.add('theme-transition-none');
    }

    // Apply dark/light mode
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.setAttribute(attribute, isDark ? 'dark' : 'light');
    }

    // Apply theme color as CSS variables
    const colorConfig = themeColors[theme.color];
    root.style.setProperty('--color-primary', colorConfig.primary);
    root.style.setProperty('--color-accent', colorConfig.accent);

    // Apply compact mode
    root.classList.toggle('compact-mode', theme.compactMode);

    // Apply high contrast
    root.classList.toggle('high-contrast', theme.highContrast);

    // Apply reduced motion
    root.classList.toggle('reduced-motion', theme.reducedMotion);

    // Remove transition blocker
    if (disableTransitionOnChange) {
      requestAnimationFrame(() => {
        root.classList.remove('theme-transition-none');
      });
    }
  }, [isDark, theme.color, theme.compactMode, theme.highContrast, theme.reducedMotion, attribute, disableTransitionOnChange]);

  // Save theme to storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(theme));
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }, [theme, storageKey]);

  // Set theme
  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }));
  }, []);

  // Toggle mode
  const toggleMode = useCallback(() => {
    setThemeState((prev) => {
      const modes: ThemeMode[] = enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'];
      const currentIndex = modes.indexOf(prev.mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, mode: modes[nextIndex] };
    });
  }, [enableSystem]);

  // Set color
  const setColor = useCallback((color: ThemeColor) => {
    setThemeState((prev) => ({ ...prev, color }));
  }, []);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleMode,
    setColor,
    isDark,
    isSystem: theme.mode === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'icon' | 'button';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  showLabel = false,
  variant = 'icon',
}) => {
  const { theme, toggleMode, isDark } = useTheme();

  const icon = theme.mode === 'system' ? (
    <Monitor className="w-5 h-5" />
  ) : isDark ? (
    <Moon className="w-5 h-5" />
  ) : (
    <Sun className="w-5 h-5" />
  );

  const label = theme.mode === 'system' ? 'System' : isDark ? 'Dark' : 'Light';

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleMode}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          className
        )}
        aria-label={`Switch to ${label} mode`}
        title={`Current: ${label} mode`}
      >
        {icon}
        {showLabel && <span className="ml-2 text-sm">{label}</span>}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleMode}
      leftIcon={icon}
      className={className}
    >
      {showLabel && label}
    </Button>
  );
};

// Theme Color Picker Component
export interface ThemeColorPickerProps {
  className?: string;
  colors?: ThemeColor[];
}

export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({
  className,
  colors = ['blue', 'purple', 'green', 'orange', 'red', 'pink'],
}) => {
  const { theme, setColor } = useTheme();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => setColor(color)}
          className={cn(
            'w-6 h-6 rounded-full transition-transform',
            'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900',
            theme.color === color ? 'ring-neutral-900 dark:ring-white scale-110' : 'ring-transparent hover:scale-105'
          )}
          style={{ backgroundColor: themeColors[color].primary }}
          aria-label={`Set theme color to ${color}`}
          title={color.charAt(0).toUpperCase() + color.slice(1)}
        />
      ))}
    </div>
  );
};

// Theme Settings Panel Component
export interface ThemeSettingsPanelProps {
  className?: string;
}

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({ className }) => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Mode Selection */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme({ mode })}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                theme.mode === mode
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              )}
            >
              {mode === 'light' && <Sun className="w-5 h-5" />}
              {mode === 'dark' && <Moon className="w-5 h-5" />}
              {mode === 'system' && <Monitor className="w-5 h-5" />}
              <span className="text-xs font-medium capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
          Accent Color
        </h3>
        <ThemeColorPicker />
      </div>

      {/* Accessibility Options */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
          Accessibility
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Compact Mode
            </span>
            <input
              type="checkbox"
              checked={theme.compactMode}
              onChange={(e) => setTheme({ compactMode: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              High Contrast
            </span>
            <input
              type="checkbox"
              checked={theme.highContrast}
              onChange={(e) => setTheme({ highContrast: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Reduced Motion
            </span>
            <input
              type="checkbox"
              checked={theme.reducedMotion}
              onChange={(e) => setTheme({ reducedMotion: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

// CSS for theme transitions
export const themeTransitionStyles = `
  .theme-transition-none,
  .theme-transition-none *,
  .theme-transition-none *::before,
  .theme-transition-none *::after {
    transition: none !important;
    animation: none !important;
  }

  .compact-mode {
    --spacing-unit: 0.75rem;
  }

  .high-contrast {
    --contrast-multiplier: 1.2;
  }

  .reduced-motion,
  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

export default ThemeProvider;