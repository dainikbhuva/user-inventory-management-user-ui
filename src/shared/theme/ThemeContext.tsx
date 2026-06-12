import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeAccent = 'blue' | 'green' | 'purple' | 'orange' | 'teal';

interface ThemeSettings {
  mode: ThemeMode;
  accent: ThemeAccent;
}

export interface ThemeContextType extends ThemeSettings {
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
}

const themeStorageKey = 'admin-ui-theme-settings';

const accentMap: Record<ThemeAccent, { primary: string; primaryDark: string; primarySoft: string; foreground: string }> = {
  blue: { primary: '#3b82f6', primaryDark: '#2563eb', primarySoft: '#bfdbfe', foreground: '#ffffff' },
  green: { primary: '#10b981', primaryDark: '#047857', primarySoft: '#d1fae5', foreground: '#ffffff' },
  purple: { primary: '#8b5cf6', primaryDark: '#6d28d9', primarySoft: '#ede9fe', foreground: '#ffffff' },
  orange: { primary: '#f97316', primaryDark: '#c2410c', primarySoft: '#ffedd5', foreground: '#ffffff' },
  teal: { primary: '#14b8a6', primaryDark: '#0f766e', primarySoft: '#ccfbf1', foreground: '#ffffff' },
};

const defaultTheme: ThemeSettings = {
  mode: 'light',
  accent: 'blue',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = ({ mode, accent }: ThemeSettings) => {
  const root = document.documentElement;
  const accentColors = accentMap[accent];

  root.dataset.theme = mode;
  root.style.setProperty('--color-primary', accentColors.primary);
  root.style.setProperty('--color-primary-dark', accentColors.primaryDark);
  root.style.setProperty('--color-primary-soft', accentColors.primarySoft);
  root.style.setProperty('--color-primary-foreground', accentColors.foreground);

  if (mode === 'dark') {
    root.style.setProperty('--color-background', '#0f172a');
    root.style.setProperty('--color-surface', '#1e293b');
    root.style.setProperty('--color-surface-2', '#334155');
    root.style.setProperty('--color-surface-3', '#475569');
    root.style.setProperty('--color-border', '#64748b');
    root.style.setProperty('--color-text', '#f8fafc');
    root.style.setProperty('--color-muted', '#cbd5e1');
    root.style.setProperty('--color-muted-2', '#94a3b8');
    root.style.setProperty('--color-primary-soft', 'rgba(59,130,246,0.15)');
    root.style.setProperty('--color-shadow', '0 1px 2px rgba(0,0,0,0.25), 0 6px 18px rgba(0,0,0,0.20)');
  } else {
    root.style.setProperty('--color-background', '#f8fafc');
    root.style.setProperty('--color-surface', '#ffffff');
    root.style.setProperty('--color-surface-2', '#f1f5f9');
    root.style.setProperty('--color-surface-3', '#e2e8f0');
    root.style.setProperty('--color-border', '#cbd5e1');
    root.style.setProperty('--color-text', '#1f2937');
    root.style.setProperty('--color-muted', '#64748b');
    root.style.setProperty('--color-muted-2', '#475569');
    root.style.setProperty('--color-shadow', '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }

    try {
      const stored = window.localStorage.getItem(themeStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ThemeSettings;
        if (parsed?.mode && parsed?.accent) {
          return parsed;
        }
      }
    } catch {
      // ignore invalid storage values
    }

    return defaultTheme;
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, JSON.stringify(theme));
  }, [theme]);

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((current) => ({ ...current, mode }));
  }, []);

  const setAccent = useCallback((accent: ThemeAccent) => {
    setTheme((current) => ({ ...current, accent }));
  }, []);

  const contextValue = useMemo(
    () => ({
      mode: theme.mode,
      accent: theme.accent,
      setMode,
      setAccent,
    }),
    [theme.mode, theme.accent, setMode, setAccent]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};