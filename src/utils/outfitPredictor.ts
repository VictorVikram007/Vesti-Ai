
// A simplified outfit recommendation engine
// This is a frontend approximation of the ML model

interface WeatherContext {
  temperature: number;   // in celsius
  precipitation: number; // 0-1 (0 = no rain, 1 = heavy rain)
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  occasion: string;      // matches our outfit occasions
}

// Map weather conditions to appropriate clothing attributes
const getSeasonCompatibility = (itemSeasons: string[], currentSeason: string): number => {
  // All seasons is always compatible
  if (itemSeasons.includes('All Seasons')) return 1.0;
  
  // Exact match is best
  if (itemSeasons.includes(currentSeason)) return 1.0;
  
  // Adjacent seasons have some compatibility
  const seasonMap: Record<string, string[]> = {
    'Spring': ['Summer'],
    'Summer': ['Spring', 'Fall'],
    'Fall': ['Summer', 'Winter'],
    'Winter': ['Fall']
  };
  
  const adjacentSeasons = seasonMap[currentSeason] || [];
  for (const season of itemSeasons) {
    if (adjacentSeasons.includes(season)) return 0.5;
  }
  
  // Not compatible
  return 0.0;
};

// Score an outfit based on weather and occasion
export const scoreOutfit = (
  outfit: any, 
  items: any[], 
  context: WeatherContext
): { score: number; reasons: string[] } => {
  let score = 0.5; // Start with neutral score
  const reasons: string[] = [];
  
  // Check if items exist
  if (!outfit.items || !Array.isArray(outfit.items) || outfit.items.length === 0) {
    return { score: 0, reasons: ['No items in outfit'] };
  }
  
  // 1. Match occasion (highest weight)
  if (outfit.occasion.toLowerCase() === context.occasion.toLowerCase()) {
    score += 0.25;
    reasons.push(`Perfect for ${context.occasion} occasions`);
  } else {
    score -= 0.2;
    reasons.push(`Not ideal for ${context.occasion} occasions`);
  }
  
  // 2. Weather/season compatibility
  const outfitItems = outfit.items.map(id => items.find(item => item.id === id)).filter(Boolean);
  
  if (outfitItems.length === 0) {
    return { score: 0, reasons: ['Missing items in outfit'] };
  }
  
  // Calculate average season compatibility
  let seasonCompatibilityScore = 0;
  outfitItems.forEach(item => {
    if (item && item.season) {
      seasonCompatibilityScore += getSeasonCompatibility(item.season, context.season);
    }
  });
  seasonCompatibilityScore /= outfitItems.length;
  
  if (seasonCompatibilityScore > 0.7) {
    score += 0.2;
    reasons.push(`Great for ${context.season} weather`);
  } else if (seasonCompatibilityScore > 0.4) {
    score += 0.1;
    reasons.push(`Acceptable for ${context.season} weather`);
  } else {
    score -= 0.15;
    reasons.push(`Not suited for ${context.season} weather`);
  }
  
  // 3. Temperature considerations
  const hasWarmItems = outfitItems.some(item => 
    item && item.season && (item.season.includes('Winter') || item.season.includes('Fall'))
  );
  
  const hasLightItems = outfitItems.some(item => 
    item && item.season && (item.season.includes('Summer') || item.season.includes('Spring'))
  );
  
  if (context.temperature <= 10 && hasWarmItems) {
    score += 0.15;
    reasons.push('Includes warm items for cold weather');
  } else if (context.temperature <= 10 && !hasWarmItems) {
    score -= 0.2;
    reasons.push('Missing warm items for cold weather');
  }
  
  if (context.temperature >= 25 && hasLightItems) {
    score += 0.15;
    reasons.push('Includes light items for hot weather');
  } else if (context.temperature >= 25 && !hasLightItems) {
    score -= 0.2;
    reasons.push('Too warm for hot weather');
  }
  
  // 4. Precipitation factor
  if (context.precipitation > 0.3) {
    // Check if the outfit has appropriate rain gear
    const hasWaterproofItems = outfitItems.some(item => 
      item && item.material && ['waterproof', 'leather'].includes(item.material?.toLowerCase())
    );
    
    if (hasWaterproofItems) {
      score += 0.1;
      reasons.push('Suitable for rainy conditions');
    } else {
      score -= 0.1;
      reasons.push('Not ideal for rainy conditions');
    }
  }
  
  // 5. Consider favorite status as a bonus
  if (outfit.favorite) {
    score += 0.05;
    reasons.push('One of your favorites');
  }
  
  // Clamp score between 0 and 1
  score = Math.min(Math.max(score, 0), 1);
  
  return { score, reasons };
};

// Get the current season based on month
export const getCurrentSeason = (): 'Spring' | 'Summer' | 'Fall' | 'Winter' => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};

// Get weather-appropriate outfits
export const getWeatherBasedOutfits = (
  outfits: any[],
  items: any[],
  weather: WeatherContext,
  limit = 3
) => {
  // Score each outfit
  const scoredOutfits = outfits.map(outfit => ({
    ...outfit,
    prediction: scoreOutfit(outfit, items, weather)
  }));
  
  // Sort by score (highest first)
  return scoredOutfits
    .sort((a, b) => b.prediction.score - a.prediction.score)
    .slice(0, limit);
};
