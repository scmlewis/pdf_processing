import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check saved preference or default to dark for professional look
    const savedTheme = localStorage.getItem('theme');
    
    let theme = 'dark'; // Default to dark theme
    if (savedTheme) {
      theme = savedTheme; // Use saved preference if exists
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
