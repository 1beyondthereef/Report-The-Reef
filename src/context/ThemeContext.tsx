"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  const setTheme = () => {
    // No-op, always dark
  };

  return (
    <ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
