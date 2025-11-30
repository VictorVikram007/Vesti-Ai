import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const getSettingsKey = (userId: string) => `vesti.settings.${userId}`;

type SettingsModel = {
  profile: {
    name: string;
    email: string;
    pronouns: string;
    avatarDataUrl?: string;
  };
  notifications: {
    outfitSuggestions: boolean;
    newFeatures: boolean;
    wardrobeInsights: boolean;
    promotions: boolean;
    inApp: boolean;
  };
  appearance: {
    darkMode: boolean;
    highContrast: boolean;
    fontSizePct: number;
  };
  privacy: {
    personalized: boolean;
  };
  wardrobe: {
    styleProfile: string;
    likedColors: string[];
    dislikedColors: string[];
    occasions: string[];
    bodyType: string;
    preferredFit: string;
    budgetRange: string;
    sustainabilityPreference: boolean;
    weatherSensitivity: string;
    activityLevel: string;
    colorTemperature: string;
    avoidPatterns: string[];
    preferredBrands: string[];
    sizePreferences: Record<string, string>;
  };
};

const DEFAULT_SETTINGS: SettingsModel = {
  profile: {
    name: "User",
    email: "user@example.com",
    pronouns: "they/them",
    avatarDataUrl: undefined,
  },
  notifications: {
    outfitSuggestions: true,
    newFeatures: true,
    wardrobeInsights: true,
    promotions: false,
    inApp: true,
  },
  appearance: {
    darkMode: false,
    highContrast: false,
    fontSizePct: 100,
  },
  privacy: {
    personalized: true,
  },
  wardrobe: {
    styleProfile: "Casual",
    likedColors: [],
    dislikedColors: [],
    occasions: ["Work", "Casual"],
    bodyType: "Not specified",
    preferredFit: "Regular",
    budgetRange: "Medium",
    sustainabilityPreference: false,
    weatherSensitivity: "Normal",
    activityLevel: "Moderate",
    colorTemperature: "Neutral",
    avoidPatterns: [],
    preferredBrands: [],
    sizePreferences: {},
  },
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsModel>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const userSettingsKey = getSettingsKey(user.id);
    const raw = localStorage.getItem(userSettingsKey);
    
    if (raw) {
      try {
        const savedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        // Always update with latest user data from Supabase
        savedSettings.profile.name = user.name;
        savedSettings.profile.email = user.email;
        // Use Google avatar if no custom avatar is set
        if (user.avatar_url && !savedSettings.profile.avatarDataUrl) {
          savedSettings.profile.avatarDataUrl = user.avatar_url;
        }
        setSettings(savedSettings);
      } catch {
        // If parsing fails, create new settings with user data
        const newSettings = {
          ...DEFAULT_SETTINGS,
          profile: {
            ...DEFAULT_SETTINGS.profile,
            name: user.name,
            email: user.email,
            avatarDataUrl: user.avatar_url
          }
        };
        setSettings(newSettings);
      }
    } else {
      // No saved settings, create new with user data
      const newSettings = {
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          name: user.name,
          email: user.email,
          avatarDataUrl: user.avatar_url
        }
      };
      setSettings(newSettings);
    }
  }, [user]);

  // Listen for storage changes from other components
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      const userSettingsKey = getSettingsKey(user.id);
      if (e.key === userSettingsKey && e.newValue) {
        try {
          const updatedSettings = JSON.parse(e.newValue);
          setSettings(updatedSettings);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const updateSettings = (newSettings: SettingsModel) => {
    if (!user) return;
    
    setSettings(newSettings);
    const userSettingsKey = getSettingsKey(user.id);
    localStorage.setItem(userSettingsKey, JSON.stringify(newSettings));
    
    // Trigger storage event to update other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: userSettingsKey,
      newValue: JSON.stringify(newSettings)
    }));
  };

  return { settings, updateSettings };
};