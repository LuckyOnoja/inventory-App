import React, { createContext, useContext, ReactNode, useState } from 'react';
import { lightTheme, darkTheme } from '../theme';

type AnyTheme = typeof lightTheme | typeof darkTheme;

interface ThemeContextType {
  theme: AnyTheme & { mode: 'light' | 'dark' };
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const themeWithMode = {
    ...currentTheme,
    mode,
  } as AnyTheme & { mode: 'light' | 'dark' };

  return (
    <ThemeContext.Provider value={{ theme: themeWithMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};