import React, { createContext, useState, useContext } from 'react';

interface AppContextType {
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
}

const AppContext = createContext<AppContextType>({
  language: 'hi',
  setLanguage: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  return (
    <AppContext.Provider value={{ language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
