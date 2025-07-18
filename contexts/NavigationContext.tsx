import React, { createContext, useContext, useState } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

interface NavigationContextType {
  scrollPositions: { [key: string]: ScrollPosition };
  saveScrollPosition: (routeName: string, position: ScrollPosition) => void;
  getScrollPosition: (routeName: string) => ScrollPosition | null;
  clearScrollPosition: (routeName: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  scrollPositions: {},
  saveScrollPosition: () => {},
  getScrollPosition: () => null,
  clearScrollPosition: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: ScrollPosition }>({});

  const saveScrollPosition = (routeName: string, position: ScrollPosition) => {
    setScrollPositions(prev => ({
      ...prev,
      [routeName]: position
    }));
  };

  const getScrollPosition = (routeName: string): ScrollPosition | null => {
    return scrollPositions[routeName] || null;
  };

  const clearScrollPosition = (routeName: string) => {
    setScrollPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[routeName];
      return newPositions;
    });
  };

  return (
    <NavigationContext.Provider value={{
      scrollPositions,
      saveScrollPosition,
      getScrollPosition,
      clearScrollPosition
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
} 