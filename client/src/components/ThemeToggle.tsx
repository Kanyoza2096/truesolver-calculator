import React from "react";
import { useTheme } from "@/context/ThemeProvider";
import { SunMedium, Moon } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <button
      id="themeToggle"
      onClick={toggleTheme}
      className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition duration-300 focus:outline-none shadow relative"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md flex justify-center items-center transform transition-transform duration-300 ${
          theme === "dark" ? "translate-x-6" : "translate-x-1"
        }`}
      >
        {theme === "light" ? (
          <SunMedium className="text-amber-500" size={12} />
        ) : (
          <Moon className="text-primary" size={12} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
