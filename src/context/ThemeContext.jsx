// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const stored = localStorage.getItem('modoOscuro') === 'true';
  const [modoOscuro, setModoOscuro] = useState(stored);

  useEffect(() => {
    localStorage.setItem('modoOscuro', modoOscuro);
    document.documentElement.setAttribute('data-bs-theme', modoOscuro ? 'dark' : 'light');
  }, [modoOscuro]);

  return (
    <ThemeContext.Provider value={{ modoOscuro, setModoOscuro }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
