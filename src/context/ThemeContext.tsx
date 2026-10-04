// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccentColor, LayoutDensity, User, UserSettings } from '../types';
import { api } from '../services/api';

interface ThemeContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  density: LayoutDensity;
  setDensity: (density: LayoutDensity) => void;
  settings: UserSettings | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  getAccentClasses: () => {
    primaryBg: string;
    primaryText: string;
    border: string;
    badge: string;
    glow: string;
    activeNav: string;
    ring: string;
  };
}

const defaultSettings: UserSettings = {
  theme: 'royal-black',
  accentColor: 'gold',
  layoutDensity: 'comfortable',
  notifications: {
    deadlineReminders: true,
    taskAssignments: true,
    comments: true,
    projectUpdates: true
  },
  preferences: {
    defaultPriority: 'Medium',
    defaultView: 'list',
    startDayOfWeek: 'monday'
  }
};

const defaultUser: User = {
  id: "user_1",
  name: "Alex Vance",
  email: "alex@taskora.io",
  role: "Lead Architect & Product Lead",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  status: "online",
  department: "Engineering"
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUser);
  const [accentColor, setAccentColorState] = useState<AccentColor>('gold');
  const [density, setDensityState] = useState<LayoutDensity>('comfortable');
  const [settings, setSettings] = useState<UserSettings | null>(defaultSettings);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      if (data.accentColor) setAccentColorState(data.accentColor);
      if (data.layoutDensity) setDensityState(data.layoutDensity);
    } catch {
      // fallback
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
      if (updated.accentColor) setAccentColorState(updated.accentColor);
      if (updated.layoutDensity) setDensityState(updated.layoutDensity);
    } catch (err) {
      console.error(err);
    }
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    updateSettings({ accentColor: color });
  };

  const setDensity = (d: LayoutDensity) => {
    setDensityState(d);
    updateSettings({ layoutDensity: d });
  };

  useEffect(() => {
    api.getCurrentUser()
      .then(user => {
        setCurrentUser(user);
      })
      .catch(() => {});
    refreshSettings();
  }, []);

  const getAccentClasses = () => {
    switch (accentColor) {
      case 'purple':
        return {
          primaryBg: 'bg-[#9d7cd8] hover:bg-[#8b68cb] text-black font-semibold',
          primaryText: 'text-[#c4a7e7]',
          border: 'border-[#9d7cd8]/40',
          badge: 'bg-[#9d7cd8]/15 text-[#c4a7e7] border border-[#9d7cd8]/30',
          glow: 'shadow-[0_0_20px_-3px_rgba(157,124,216,0.3)]',
          activeNav: 'bg-[#9d7cd8]/15 text-[#c4a7e7] border-l-2 border-[#9d7cd8]',
          ring: 'focus:ring-[#9d7cd8]'
        };
      case 'emerald':
        return {
          primaryBg: 'bg-[#10b981] hover:bg-[#059669] text-black font-semibold',
          primaryText: 'text-[#34d399]',
          border: 'border-[#10b981]/40',
          badge: 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30',
          glow: 'shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]',
          activeNav: 'bg-[#10b981]/15 text-[#34d399] border-l-2 border-[#10b981]',
          ring: 'focus:ring-[#10b981]'
        };
      case 'cyan':
        return {
          primaryBg: 'bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold',
          primaryText: 'text-[#38bdf8]',
          border: 'border-[#06b6d4]/40',
          badge: 'bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30',
          glow: 'shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)]',
          activeNav: 'bg-[#06b6d4]/15 text-[#38bdf8] border-l-2 border-[#06b6d4]',
          ring: 'focus:ring-[#06b6d4]'
        };
      case 'gold':
      default:
        return {
          primaryBg: 'bg-gradient-to-r from-[#e5c07b] to-[#d4af37] hover:from-[#d4af37] hover:to-[#c69f2e] text-black font-semibold shadow-amber-950/20',
          primaryText: 'text-[#e5c07b]',
          border: 'border-[#e5c07b]/40',
          badge: 'bg-[#e5c07b]/15 text-[#f3e88a] border border-[#e5c07b]/30',
          glow: 'shadow-[0_0_20px_-3px_rgba(229,192,123,0.25)]',
          activeNav: 'bg-[#e5c07b]/10 text-[#e5c07b] border-l-2 border-[#e5c07b]',
          ring: 'focus:ring-[#e5c07b]'
        };
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        accentColor,
        setAccentColor,
        density,
        setDensity,
        settings,
        refreshSettings,
        updateSettings,
        getAccentClasses
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
