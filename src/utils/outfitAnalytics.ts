import { ClothingItem, Outfit } from '@/context/WardrobeContext';

export interface StyleAnalysis {
  mostWornColors: { color: string; count: number }[];
  mostWornCategories: { category: string; count: number }[];
  averageOutfitCost: number;
  stylePersonality: string;
  colorPalette: string[];
  seasonalPreferences: { season: string; count: number }[];
  brandPreferences: { brand: string; count: number }[];
  outfitFreshnessScore: number;
}

export interface OutfitAnalytics {
  totalCost: number;
  costPerWear: number;
  timesWorn: number;
  freshnessScore: number;
  styleMatch: number;
  weatherCompatibility: number;
}

// Calculate outfit CPW (Cost Per Wear)
export const calculateOutfitCPW = (outfit: Outfit, clothingItems: ClothingItem[]): OutfitAnalytics => {
  const outfitItems = clothingItems.filter(item => 
    outfit.items.includes(item.id)
  );

  const totalCost = outfitItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const timesWorn = outfit.timesWorn || 0;
  const costPerWear = timesWorn > 0 ? totalCost / timesWorn : totalCost;

  // Calculate freshness score (higher = more recently worn)
  const daysSinceLastWorn = outfit.lastWorn 
    ? Math.floor((Date.now() - new Date(outfit.lastWorn).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const freshnessScore = Math.max(0, 100 - daysSinceLastWorn);

  // Calculate style match based on user preferences (placeholder)
  const styleMatch = Math.random() * 40 + 60; // 60-100% range

  // Calculate weather compatibility (placeholder)
  const weatherCompatibility = Math.random() * 30 + 70; // 70-100% range

  return {
    totalCost,
    costPerWear,
    timesWorn,
    freshnessScore,
    styleMatch,
    weatherCompatibility
  };
};

// Analyze user's style patterns
export const analyzeStyle = (clothingItems: ClothingItem[], outfits: Outfit[]): StyleAnalysis => {
  // Color analysis
  const colorCounts: { [key: string]: number } = {};
  clothingItems.forEach(item => {
    if (item.color) {
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    }
  });
  const mostWornColors = Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Category analysis
  const categoryCounts: { [key: string]: number } = {};
  clothingItems.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  });
  const mostWornCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Brand analysis
  const brandCounts: { [key: string]: number } = {};
  clothingItems.forEach(item => {
    if (item.brand) {
      brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
    }
  });
  const brandPreferences = Object.entries(brandCounts)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Average outfit cost
  const totalCost = clothingItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const averageOutfitCost = clothingItems.length > 0 ? totalCost / clothingItems.length : 0;

  // Determine style personality based on categories and colors
  const stylePersonality = determineStylePersonality(mostWornCategories, mostWornColors);

  // Color palette (top 3 colors)
  const colorPalette = mostWornColors.slice(0, 3).map(c => c.color);

  // Seasonal preferences (placeholder - would need season data)
  const seasonalPreferences = [
    { season: 'Spring', count: Math.floor(Math.random() * 20) + 10 },
    { season: 'Summer', count: Math.floor(Math.random() * 20) + 10 },
    { season: 'Fall', count: Math.floor(Math.random() * 20) + 10 },
    { season: 'Winter', count: Math.floor(Math.random() * 20) + 10 }
  ];

  // Calculate overall outfit freshness score
  const outfitFreshnessScore = calculateOverallFreshness(outfits);

  return {
    mostWornColors,
    mostWornCategories,
    averageOutfitCost,
    stylePersonality,
    colorPalette,
    seasonalPreferences,
    brandPreferences,
    outfitFreshnessScore
  };
};

// Determine style personality based on wardrobe analysis
const determineStylePersonality = (
  categories: { category: string; count: number }[],
  colors: { color: string; count: number }[]
): string => {
  const categoryNames = categories.map(c => c.category.toLowerCase());
  const colorNames = colors.map(c => c.color.toLowerCase());

  if (categoryNames.includes('formal') || categoryNames.includes('business')) {
    return 'Professional';
  } else if (colorNames.includes('black') && colorNames.includes('white')) {
    return 'Minimalist';
  } else if (categoryNames.includes('streetwear') || categoryNames.includes('casual')) {
    return 'Streetwear';
  } else if (colorNames.some(c => ['pink', 'purple', 'pastel'].includes(c))) {
    return 'Feminine';
  } else if (colorNames.some(c => ['navy', 'brown', 'beige'].includes(c))) {
    return 'Classic';
  } else {
    return 'Versatile';
  }
};

// Calculate overall freshness score
const calculateOverallFreshness = (outfits: Outfit[]): number => {
  if (outfits.length === 0) return 100;

  const freshnessScores = outfits.map(outfit => {
    const daysSinceLastWorn = outfit.lastWorn 
      ? Math.floor((Date.now() - new Date(outfit.lastWorn).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    return Math.max(0, 100 - daysSinceLastWorn);
  });

  return Math.round(freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length);
};

// Get outfit recommendations based on weather and style
export const getOutfitRecommendations = (
  outfits: Outfit[],
  clothingItems: ClothingItem[],
  weather: any,
  stylePreferences: any
): Outfit[] => {
  return outfits
    .map(outfit => {
      const analytics = calculateOutfitCPW(outfit, clothingItems);
      const weatherScore = calculateWeatherCompatibility(outfit, clothingItems, weather);
      const styleScore = calculateStyleCompatibility(outfit, clothingItems, stylePreferences);
      
      return {
        ...outfit,
        recommendationScore: (weatherScore + styleScore + analytics.freshnessScore) / 3
      };
    })
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, 5);
};

// Calculate weather compatibility for an outfit
const calculateWeatherCompatibility = (outfit: Outfit, clothingItems: ClothingItem[], weather: any): number => {
  // This would integrate with actual weather data
  // For now, return a placeholder score
  return Math.random() * 40 + 60; // 60-100% range
};

// Calculate style compatibility based on user preferences
const calculateStyleCompatibility = (outfit: Outfit, clothingItems: ClothingItem[], preferences: any): number => {
  // This would use actual user preferences from settings
  // For now, return a placeholder score
  return Math.random() * 30 + 70; // 70-100% range
};

