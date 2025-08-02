import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  mode: 'light',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1f2937',
  secondaryText: '#6b7280',
  accent: '#8b5cf6',
  border: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.25)',
  gradientBackground: {
    colors: ['#edceffff', '#fcd8ecff'],
  },
  tabColor: '#ffffff',
};

const darkTheme = {
  mode: 'dark',
  background: '#18181b',
  card: '#23232a',
  text: '#f3f4f6',
  secondaryText: '#a1a1aa',
  accent: '#a78bfa',
  border: '#27272a',
  overlay: 'rgba(0,0,0,0.5)',
  gradientBackground: {
    colors: ['#1b1b20ff', '#0c0c0eff'],
  },
  tabColor: '#000000',
};


type ThemeMode = 'system' | 'light' | 'dark';
const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'system' as ThemeMode,
  setThemeMode: (mode: ThemeMode) => {},
});


export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  // Load user preference from AsyncStorage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('themeMode');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setMode(stored);
      }
    })();
  }, []);

  // Save user preference
  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  // Determine theme
  const theme = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
