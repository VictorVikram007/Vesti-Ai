import { ClothingItem, Outfit } from '@/context/WardrobeContext';

export interface UserPreference {
  category: string;
  color: string;
  brand: string;
  style: string;
  location: string;
  region: string;
  confidence: number;
  lastUpdated: Date;
}

export interface AILearningData {
  userPreferences: UserPreference[];
  feedbackHistory: FeedbackEntry[];
  outfitSuccessRate: number;
  styleEvolution: StyleEvolutionEntry[];
  recommendationAccuracy: number;
  locationPreferences: LocationPreference[];
}

export interface LocationPreference {
  location: string;
  region: string;
  country: string;
  climate: string;
  seasonalPatterns: SeasonalPattern[];
  confidence: number;
  lastUpdated: Date;
}

export interface SeasonalPattern {
  season: string;
  preferredCategories: string[];
  preferredColors: string[];
  averageTemperature: number;
  confidence: number;
}

export interface FeedbackEntry {
  itemId: string;
  outfitId?: string;
  feedback: 'like' | 'dislike' | 'neutral';
  timestamp: Date;
  context: {
    weather?: any;
    occasion?: string;
    mood?: string;
  };
}

export interface StyleEvolutionEntry {
  date: Date;
  dominantColors: string[];
  preferredCategories: string[];
  stylePersonality: string;
  confidence: number;
}

// Initialize AI learning data
export const initializeAILearning = (): AILearningData => {
  return {
    userPreferences: [],
    feedbackHistory: [],
    outfitSuccessRate: 0,
    styleEvolution: [],
    recommendationAccuracy: 0,
    locationPreferences: []
  };
};

// Update user preferences based on feedback
export const updateUserPreferences = (
  currentPreferences: UserPreference[],
  feedback: FeedbackEntry,
  clothingItems: ClothingItem[]
): UserPreference[] => {
  const item = clothingItems.find(i => i.id === feedback.itemId);
  if (!item) return currentPreferences;

  const newPreferences = [...currentPreferences];
  const learningRate = 0.1; // How much to adjust preferences

  // Update category preference
  let categoryPref = newPreferences.find(p => p.category === item.category);
  if (!categoryPref) {
    categoryPref = {
      category: item.category,
      color: '',
      brand: '',
      style: '',
      confidence: 0.5,
      lastUpdated: new Date()
    };
    newPreferences.push(categoryPref);
  }

  // Update color preference
  let colorPref = newPreferences.find(p => p.color === item.color);
  if (!colorPref) {
    colorPref = {
      category: '',
      color: item.color,
      brand: '',
      style: '',
      confidence: 0.5,
      lastUpdated: new Date()
    };
    newPreferences.push(colorPref);
  }

  // Update brand preference
  let brandPref = newPreferences.find(p => p.brand === item.brand);
  if (!brandPref) {
    brandPref = {
      category: '',
      color: '',
      brand: item.brand,
      style: '',
      confidence: 0.5,
      lastUpdated: new Date()
    };
    newPreferences.push(brandPref);
  }

  // Adjust confidence based on feedback
  const adjustment = feedback.feedback === 'like' ? learningRate : 
                    feedback.feedback === 'dislike' ? -learningRate : 0;

  if (categoryPref) {
    categoryPref.confidence = Math.max(0, Math.min(1, categoryPref.confidence + adjustment));
    categoryPref.lastUpdated = new Date();
  }

  if (colorPref) {
    colorPref.confidence = Math.max(0, Math.min(1, colorPref.confidence + adjustment));
    colorPref.lastUpdated = new Date();
  }

  if (brandPref) {
    brandPref.confidence = Math.max(0, Math.min(1, brandPref.confidence + adjustment));
    brandPref.lastUpdated = new Date();
  }

  return newPreferences;
};

// Calculate recommendation score for an outfit
export const calculateRecommendationScore = (
  outfit: Outfit,
  clothingItems: ClothingItem[],
  userPreferences: UserPreference[],
  weather: any,
  occasion?: string,
  location?: string,
  region?: string,
  locationPreferences?: LocationPreference[]
): number => {
  const outfitItems = clothingItems.filter(item => outfit.items.includes(item.id));
  
  let score = 0;
  let totalWeight = 0;

  // Score based on user preferences
  outfitItems.forEach(item => {
    const categoryPref = userPreferences.find(p => p.category === item.category);
    const colorPref = userPreferences.find(p => p.color === item.color);
    const brandPref = userPreferences.find(p => p.brand === item.brand);

    if (categoryPref) {
      score += categoryPref.confidence * 0.3;
      totalWeight += 0.3;
    }
    if (colorPref) {
      score += colorPref.confidence * 0.2;
      totalWeight += 0.2;
    }
    if (brandPref) {
      score += brandPref.confidence * 0.15;
      totalWeight += 0.15;
    }
  });

  // Score based on weather compatibility
  const weatherScore = calculateWeatherCompatibility(outfit, outfitItems, weather);
  score += weatherScore * 0.25;
  totalWeight += 0.25;

  // Score based on occasion appropriateness
  if (occasion) {
    const occasionScore = calculateOccasionCompatibility(outfit, outfitItems, occasion);
    score += occasionScore * 0.15;
    totalWeight += 0.15;
  }

  // Score based on location/climate compatibility
  if (location && region && locationPreferences) {
    const locationScore = calculateLocationCompatibility(outfit, outfitItems, location, region, locationPreferences);
    score += locationScore * 0.25;
    totalWeight += 0.25;
  }

  // Normalize score
  return totalWeight > 0 ? score / totalWeight : 0;
};

// Calculate weather compatibility score
const calculateWeatherCompatibility = (
  outfit: Outfit,
  items: ClothingItem[],
  weather: any
): number => {
  if (!weather) return 0.5;

  const { temperature, precipitation } = weather;
  let score = 0.5; // Base score

  // Temperature-based scoring
  const hasWarmLayers = items.some(item => 
    ['Outerwear', 'Sweaters'].includes(item.category)
  );
  const hasLightLayers = items.some(item => 
    ['Tops', 'T-shirts'].includes(item.category)
  );

  if (temperature < 15 && hasWarmLayers) score += 0.3;
  if (temperature > 25 && hasLightLayers) score += 0.3;
  if (temperature >= 15 && temperature <= 25) score += 0.2;

  // Precipitation-based scoring
  if (precipitation > 0.3) {
    const hasWaterproof = items.some(item => 
      item.category === 'Outerwear' || item.category === 'Footwear'
    );
    if (hasWaterproof) score += 0.2;
  }

  return Math.min(1, score);
};

// Calculate occasion compatibility score
const calculateOccasionCompatibility = (
  outfit: Outfit,
  items: ClothingItem[],
  occasion: string
): number => {
  const occasionMap: { [key: string]: string[] } = {
    'work': ['Formal', 'Business'],
    'casual': ['Casual', 'Streetwear'],
    'formal': ['Formal', 'Business'],
    'party': ['Formal', 'Dresses'],
    'sport': ['Athletic', 'Sportswear']
  };

  const expectedCategories = occasionMap[occasion.toLowerCase()] || [];
  const hasAppropriateItems = items.some(item => 
    expectedCategories.includes(item.category)
  );

  return hasAppropriateItems ? 0.8 : 0.3;
};

// Calculate location/climate compatibility score
const calculateLocationCompatibility = (
  outfit: Outfit,
  items: ClothingItem[],
  location: string,
  region: string,
  locationPreferences: LocationPreference[]
): number => {
  // Find location preference
  const locationPref = locationPreferences.find(
    pref => pref.location === location || pref.region === region
  );

  if (!locationPref) return 0.5; // Neutral score if no location data

  // Get current season
  const currentSeason = getCurrentSeason();
  const seasonalPattern = locationPref.seasonalPatterns.find(
    pattern => pattern.season === currentSeason
  );

  if (!seasonalPattern) return 0.5;

  let score = 0.5; // Base score

  // Check if outfit items match seasonal preferences
  const hasPreferredCategories = items.some(item =>
    seasonalPattern.preferredCategories.includes(item.category)
  );
  if (hasPreferredCategories) score += 0.2;

  // Check if outfit colors match seasonal preferences
  const hasPreferredColors = items.some(item =>
    seasonalPattern.preferredColors.includes(item.color)
  );
  if (hasPreferredColors) score += 0.2;

  // Adjust based on climate
  if (locationPref.climate === 'Cold' && items.some(item => 
    ['Outerwear', 'Sweaters', 'Thermal'].includes(item.category)
  )) {
    score += 0.1;
  } else if (locationPref.climate === 'Hot' && items.some(item => 
    ['T-shirts', 'Tank Tops', 'Shorts'].includes(item.category)
  )) {
    score += 0.1;
  }

  return Math.min(1, score);
};

// Track style evolution over time
export const trackStyleEvolution = (
  clothingItems: ClothingItem[],
  currentEvolution: StyleEvolutionEntry[]
): StyleEvolutionEntry[] => {
  const now = new Date();
  
  // Analyze current wardrobe
  const colorCounts: { [key: string]: number } = {};
  const categoryCounts: { [key: string]: number } = {};

  clothingItems.forEach(item => {
    if (item.color) {
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    }
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  });

  const dominantColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color);

  const preferredCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  // Determine style personality
  const stylePersonality = determineStylePersonality(preferredCategories, dominantColors);

  // Calculate confidence based on wardrobe size
  const confidence = Math.min(1, clothingItems.length / 50);

  const newEntry: StyleEvolutionEntry = {
    date: now,
    dominantColors,
    preferredCategories,
    stylePersonality,
    confidence
  };

  return [...currentEvolution, newEntry];
};

// Determine style personality from wardrobe analysis
const determineStylePersonality = (categories: string[], colors: string[]): string => {
  if (categories.includes('Formal') || categories.includes('Business')) {
    return 'Professional';
  } else if (colors.includes('Black') && colors.includes('White')) {
    return 'Minimalist';
  } else if (categories.includes('Streetwear') || categories.includes('Casual')) {
    return 'Streetwear';
  } else if (colors.some(c => ['Pink', 'Purple', 'Pastel'].includes(c))) {
    return 'Feminine';
  } else if (colors.some(c => ['Navy', 'Brown', 'Beige'].includes(c))) {
    return 'Classic';
  } else {
    return 'Versatile';
  }
};

// Get personalized outfit recommendations
export const getPersonalizedRecommendations = (
  outfits: Outfit[],
  clothingItems: ClothingItem[],
  userPreferences: UserPreference[],
  weather: any,
  occasion?: string,
  location?: string,
  region?: string,
  locationPreferences?: LocationPreference[],
  limit: number = 5
): Outfit[] => {
  return outfits
    .map(outfit => ({
      ...outfit,
      recommendationScore: calculateRecommendationScore(
        outfit,
        clothingItems,
        userPreferences,
        weather,
        occasion,
        location,
        region,
        locationPreferences
      )
    }))
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, limit);
};

// Calculate overall AI learning accuracy
export const calculateLearningAccuracy = (
  feedbackHistory: FeedbackEntry[],
  recentDays: number = 30
): number => {
  const recentFeedback = feedbackHistory.filter(feedback => {
    const daysDiff = (Date.now() - feedback.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= recentDays;
  });

  if (recentFeedback.length === 0) return 0;

  const positiveFeedback = recentFeedback.filter(f => f.feedback === 'like').length;
  return positiveFeedback / recentFeedback.length;
};

// Get location-based climate recommendations
export const getLocationBasedRecommendations = (
  location: string,
  region: string,
  country: string,
  weather: any,
  locationPreferences: LocationPreference[]
): any => {
  // Find existing location preference
  let locationPref = locationPreferences.find(
    pref => pref.location === location || pref.region === region
  );

  // If no existing preference, create one based on climate
  if (!locationPref) {
    const climate = determineClimate(region, country, weather);
    locationPref = {
      location,
      region,
      country,
      climate,
      seasonalPatterns: generateSeasonalPatterns(climate),
      confidence: 0.5,
      lastUpdated: new Date()
    };
  }

  // Get current season
  const currentSeason = getCurrentSeason();
  const seasonalPattern = locationPref.seasonalPatterns.find(
    pattern => pattern.season === currentSeason
  );

  return {
    location: locationPref,
    seasonalPattern,
    recommendations: generateLocationBasedOutfitSuggestions(
      locationPref,
      seasonalPattern,
      weather
    )
  };
};

// Determine climate based on location
const determineClimate = (region: string, country: string, weather: any): string => {
  // This would integrate with a climate database
  // For now, use basic heuristics based on temperature patterns
  
  if (weather && weather.temperature) {
    const avgTemp = weather.temperature;
    if (avgTemp < 10) return 'Cold';
    if (avgTemp < 20) return 'Temperate';
    if (avgTemp < 30) return 'Warm';
    return 'Hot';
  }

  // Fallback based on region/country
  const coldRegions = ['north', 'northern', 'alaska', 'canada', 'scandinavia'];
  const hotRegions = ['south', 'southern', 'tropical', 'desert', 'africa'];
  
  const regionLower = region.toLowerCase();
  const countryLower = country.toLowerCase();
  
  if (coldRegions.some(r => regionLower.includes(r) || countryLower.includes(r))) {
    return 'Cold';
  }
  if (hotRegions.some(r => regionLower.includes(r) || countryLower.includes(r))) {
    return 'Hot';
  }
  
  return 'Temperate';
};

// Generate seasonal patterns based on climate
const generateSeasonalPatterns = (climate: string): SeasonalPattern[] => {
  const patterns: SeasonalPattern[] = [];
  
  switch (climate) {
    case 'Cold':
      patterns.push(
        { season: 'Winter', preferredCategories: ['Outerwear', 'Sweaters', 'Thermal'], preferredColors: ['Black', 'Navy', 'Gray'], averageTemperature: -5, confidence: 0.8 },
        { season: 'Spring', preferredCategories: ['Light Jackets', 'Sweaters'], preferredColors: ['Pastel', 'Light Blue', 'Pink'], averageTemperature: 10, confidence: 0.7 },
        { season: 'Summer', preferredCategories: ['T-shirts', 'Light Tops'], preferredColors: ['White', 'Light Colors'], averageTemperature: 20, confidence: 0.6 },
        { season: 'Fall', preferredCategories: ['Jackets', 'Sweaters'], preferredColors: ['Brown', 'Orange', 'Red'], averageTemperature: 5, confidence: 0.8 }
      );
      break;
    case 'Hot':
      patterns.push(
        { season: 'Winter', preferredCategories: ['Light Jackets', 'Long Sleeves'], preferredColors: ['Light Colors'], averageTemperature: 15, confidence: 0.7 },
        { season: 'Spring', preferredCategories: ['T-shirts', 'Light Tops'], preferredColors: ['Bright Colors', 'White'], averageTemperature: 25, confidence: 0.8 },
        { season: 'Summer', preferredCategories: ['Tank Tops', 'Shorts'], preferredColors: ['White', 'Bright Colors'], averageTemperature: 35, confidence: 0.9 },
        { season: 'Fall', preferredCategories: ['T-shirts', 'Light Jackets'], preferredColors: ['Earth Tones', 'Orange'], averageTemperature: 20, confidence: 0.7 }
      );
      break;
    default: // Temperate
      patterns.push(
        { season: 'Winter', preferredCategories: ['Sweaters', 'Jackets'], preferredColors: ['Dark Colors', 'Navy'], averageTemperature: 5, confidence: 0.7 },
        { season: 'Spring', preferredCategories: ['Light Jackets', 'T-shirts'], preferredColors: ['Pastel', 'Light Blue'], averageTemperature: 15, confidence: 0.8 },
        { season: 'Summer', preferredCategories: ['T-shirts', 'Shorts'], preferredColors: ['Bright Colors', 'White'], averageTemperature: 25, confidence: 0.8 },
        { season: 'Fall', preferredCategories: ['Sweaters', 'Jackets'], preferredColors: ['Earth Tones', 'Brown'], averageTemperature: 10, confidence: 0.7 }
      );
  }
  
  return patterns;
};

// Generate location-based outfit suggestions
const generateLocationBasedOutfitSuggestions = (
  locationPref: LocationPreference,
  seasonalPattern: SeasonalPattern | undefined,
  weather: any
): any => {
  if (!seasonalPattern) {
    return {
      outfitType: 'Versatile',
      layers: ['T-shirt', 'Light jacket'],
      accessories: ['Comfortable shoes'],
      reasoning: 'Based on your location and current weather'
    };
  }

  const suggestions = {
    outfitType: `${seasonalPattern.season} ${locationPref.climate}`,
    layers: seasonalPattern.preferredCategories.slice(0, 3),
    colors: seasonalPattern.preferredColors.slice(0, 3),
    accessories: getLocationBasedAccessories(locationPref.climate, weather),
    reasoning: `Optimized for ${locationPref.climate} climate in ${seasonalPattern.season}`
  };

  return suggestions;
};

// Get location-based accessories
const getLocationBasedAccessories = (climate: string, weather: any): string[] => {
  const accessories: string[] = [];
  
  if (climate === 'Cold') {
    accessories.push('Scarf', 'Gloves', 'Winter hat');
  } else if (climate === 'Hot') {
    accessories.push('Sunglasses', 'Hat', 'Light scarf');
  } else {
    accessories.push('Light scarf', 'Comfortable shoes');
  }

  // Add weather-specific accessories
  if (weather && weather.precipitation > 0.3) {
    accessories.push('Umbrella');
  }
  if (weather && weather.windSpeed > 15) {
    accessories.push('Windbreaker');
  }

  return accessories;
};

// Get current season
const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};
