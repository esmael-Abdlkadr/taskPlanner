import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore'; 

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const user = useAuthStore(state => state.user);
  
  // Get initial theme from user preferences or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    // First check user preference from auth store
    if (user?.preferences?.theme) {
      return user.preferences.theme as Theme;
    }
    
    // Then check local storage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Apply theme to document when it changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Sync with user preferences
  useEffect(() => {
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme as Theme);
    }
  }, [user?.preferences?.theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const value = {
    theme,
    toggleTheme,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;