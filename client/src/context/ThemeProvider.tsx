import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Set theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('calculatorTheme', newTheme);
    
    // Also save to database
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          theme: newTheme
        }),
      }).catch(console.error);
    } catch (e) {
      console.error("Failed to save theme to database:", e);
    }
  };

  // Apply theme class to html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#1A2632");
    } else {
      document.documentElement.classList.remove("dark");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#FFFFFF");
    }
  }, [theme]);

  // Check for system preference on first load
  useEffect(() => {
    // First try to get theme from database
    const deviceId = getDeviceId();
    
    fetch(`/api/settings/device/${deviceId}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch settings");
      })
      .then(settings => {
        if (settings && settings.theme) {
          setThemeState(settings.theme as Theme);
        } else {
          fallbackToLocalStorage();
        }
      })
      .catch(() => {
        fallbackToLocalStorage();
      });
      
    function fallbackToLocalStorage() {
      const savedTheme = localStorage.getItem("calculatorTheme");
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeState(prefersDark ? "dark" : "light");
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Generate a simple unique device ID for anonymous users
function getDeviceId() {
  let deviceId = localStorage.getItem("calculatorDeviceId");
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("calculatorDeviceId", deviceId);
  }
  return deviceId;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};