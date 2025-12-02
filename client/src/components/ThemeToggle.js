import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference first (auto dark mode detection)
    const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    let theme = 'light';
    if (savedTheme) {
      theme = savedTheme; // Use saved preference
    } else if (prefersColorScheme.matches) {
      theme = 'dark'; // Auto-detect system preference
    }
    
    setIsDark(theme === 'dark');
    applyTheme(theme);
  }, []);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    applyTheme(newTheme);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title="Switch theme (Ctrl+Space)"
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
