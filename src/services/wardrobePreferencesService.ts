import { useSettings } from '@/hooks/use-settings';

export interface WardrobePreferences {
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
}

export interface RecommendationContext {
  occasion?: string;
  weather?: string;
  season?: string;
  timeOfDay?: string;
  activityType?: string;
}

export class WardrobePreferencesService {
  private static instance: WardrobePreferencesService;
  private preferences: WardrobePreferences | null = null;

  private constructor() {}

  static getInstance(): WardrobePreferencesService {
    if (!WardrobePreferencesService.instance) {
      WardrobePreferencesService.instance = new WardrobePreferencesService();
    }
    return WardrobePreferencesService.instance;
  }

  // Initialize preferences from settings
  setPreferences(preferences: WardrobePreferences): void {
    this.preferences = preferences;
  }

  // Get current user preferences
  getPreferences(): WardrobePreferences | null {
    return this.preferences;
  }

  // Check if a color is preferred by the user
  isColorPreferred(color: string): boolean {
    if (!this.preferences) return true;
    return this.preferences.likedColors.length === 0 || 
           this.preferences.likedColors.includes(color);
  }

  // Check if a color should be avoided
  isColorDisliked(color: string): boolean {
    if (!this.preferences) return false;
    return this.preferences.dislikedColors.includes(color);
  }

  // Check if a pattern should be avoided
  isPatternAvoided(pattern: string): boolean {
    if (!this.preferences) return false;
    return this.preferences.avoidPatterns.includes(pattern);
  }

  // Get style compatibility score for an item
  getStyleCompatibilityScore(itemTags: string[], category: string): number {
    if (!this.preferences) return 0.5;

    let score = 0.5; // Base score

    // Style profile matching
    if (itemTags.includes(this.preferences.styleProfile.toLowerCase())) {
      score += 0.3;
    }

    // Fit preference matching
    if (itemTags.includes(this.preferences.preferredFit.toLowerCase())) {
      score += 0.2;
    }

    // Activity level matching
    const activityTags = {
      'Low': ['comfortable', 'relaxed', 'casual'],
      'Moderate': ['versatile', 'balanced', 'everyday'],
      'High': ['active', 'sporty', 'athletic', 'performance'],
      'Very high': ['athletic', 'performance', 'technical', 'sport']
    };

    const relevantActivityTags = activityTags[this.preferences.activityLevel as keyof typeof activityTags] || [];
    if (itemTags.some(tag => relevantActivityTags.includes(tag))) {
      score += 0.15;
    }

    // Sustainability preference
    if (this.preferences.sustainabilityPreference && 
        itemTags.some(tag => ['sustainable', 'eco-friendly', 'organic', 'recycled'].includes(tag))) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  // Get weather appropriateness score
  getWeatherAppropriatenessScore(itemSeason: string[], currentWeather: string): number {
    if (!this.preferences) return 0.5;

    const weatherMapping = {
      'sunny': ['Spring', 'Summer'],
      'rainy': ['Fall', 'Spring'],
      'cold': ['Winter', 'Fall'],
      'hot': ['Summer'],
      'mild': ['Spring', 'Fall']
    };

    const appropriateSeasons = weatherMapping[currentWeather as keyof typeof weatherMapping] || [];
    const hasSeasonMatch = itemSeason.some(season => 
      appropriateSeasons.includes(season) || season === 'All Seasons'
    );

    let score = hasSeasonMatch ? 0.8 : 0.3;

    // Adjust based on weather sensitivity
    if (this.preferences.weatherSensitivity === 'Very sensitive') {
      score = hasSeasonMatch ? 0.9 : 0.1;
    } else if (this.preferences.weatherSensitivity === 'Not sensitive') {
      score = Math.max(score, 0.6);
    }

    return score;
  }

  // Generate recommendation reasons based on preferences
  generateRecommendationReasons(
    itemTags: string[], 
    itemColor: string, 
    context: RecommendationContext
  ): string[] {
    if (!this.preferences) return [];

    const reasons: string[] = [];

    // Color preferences
    if (this.isColorPreferred(itemColor)) {
      reasons.push(`Matches your preferred ${itemColor.toLowerCase()} color palette`);
    }

    // Style matching
    if (itemTags.includes(this.preferences.styleProfile.toLowerCase())) {
      reasons.push(`Fits your ${this.preferences.styleProfile} style profile`);
    }

    // Fit preferences
    if (itemTags.includes(this.preferences.preferredFit.toLowerCase())) {
      reasons.push(`Matches your preferred ${this.preferences.preferredFit.toLowerCase()} fit`);
    }

    // Occasion matching
    if (context.occasion && this.preferences.occasions.includes(context.occasion)) {
      reasons.push(`Perfect for ${context.occasion.toLowerCase()} occasions`);
    }

    // Activity level
    const activityMatch = this.getActivityLevelMatch(itemTags);
    if (activityMatch) {
      reasons.push(`Suitable for your ${this.preferences.activityLevel.toLowerCase()} activity level`);
    }

    // Sustainability
    if (this.preferences.sustainabilityPreference && 
        itemTags.some(tag => ['sustainable', 'eco-friendly', 'organic'].includes(tag))) {
      reasons.push('Aligns with your sustainability preferences');
    }

    return reasons;
  }

  private getActivityLevelMatch(itemTags: string[]): boolean {
    const activityTags = {
      'Low': ['comfortable', 'relaxed', 'casual'],
      'Moderate': ['versatile', 'balanced', 'everyday'],
      'High': ['active', 'sporty', 'athletic'],
      'Very high': ['athletic', 'performance', 'technical']
    };

    const relevantTags = activityTags[this.preferences?.activityLevel as keyof typeof activityTags] || [];
    return itemTags.some(tag => relevantTags.includes(tag));
  }

  // Filter items based on preferences
  filterItemsByPreferences<T extends { color: string; tags: string[] }>(items: T[]): T[] {
    if (!this.preferences) return items;

    return items.filter(item => {
      // Filter out disliked colors
      if (this.isColorDisliked(item.color)) return false;

      // Filter out avoided patterns
      if (item.tags.some(tag => this.isPatternAvoided(tag))) return false;

      return true;
    });
  }

  // Get personalized outfit suggestions based on context
  getPersonalizedSuggestions(context: RecommendationContext): {
    suggestedStyles: string[];
    suggestedColors: string[];
    avoidColors: string[];
    priorityTags: string[];
  } {
    if (!this.preferences) {
      return {
        suggestedStyles: ['casual'],
        suggestedColors: [],
        avoidColors: [],
        priorityTags: []
      };
    }

    const suggestions = {
      suggestedStyles: [this.preferences.styleProfile.toLowerCase()],
      suggestedColors: [...this.preferences.likedColors],
      avoidColors: [...this.preferences.dislikedColors],
      priorityTags: [this.preferences.preferredFit.toLowerCase()]
    };

    // Add context-specific suggestions
    if (context.occasion) {
      if (context.occasion === 'Work') {
        suggestions.suggestedStyles.push('professional', 'formal');
        suggestions.priorityTags.push('business', 'office');
      } else if (context.occasion === 'Casual') {
        suggestions.suggestedStyles.push('relaxed', 'comfortable');
        suggestions.priorityTags.push('everyday', 'casual');
      }
    }

    // Add activity-based suggestions
    if (this.preferences.activityLevel === 'High' || this.preferences.activityLevel === 'Very high') {
      suggestions.priorityTags.push('comfortable', 'flexible', 'breathable');
    }

    // Add sustainability tags if preferred
    if (this.preferences.sustainabilityPreference) {
      suggestions.priorityTags.push('sustainable', 'eco-friendly', 'ethical');
    }

    return suggestions;
  }
}

// Singleton instance
export const wardrobePreferencesService = WardrobePreferencesService.getInstance();

// Hook to use the service with current settings
export const useWardrobePreferences = () => {
  const { settings } = useSettings();
  
  // Update service with current preferences
  wardrobePreferencesService.setPreferences(settings.wardrobe);
  
  return {
    preferences: settings.wardrobe,
    service: wardrobePreferencesService,
    isColorPreferred: (color: string) => wardrobePreferencesService.isColorPreferred(color),
    isColorDisliked: (color: string) => wardrobePreferencesService.isColorDisliked(color),
    getStyleCompatibilityScore: (itemTags: string[], category: string) => 
      wardrobePreferencesService.getStyleCompatibilityScore(itemTags, category),
    getPersonalizedSuggestions: (context: RecommendationContext) => 
      wardrobePreferencesService.getPersonalizedSuggestions(context),
    generateRecommendationReasons: (itemTags: string[], itemColor: string, context: RecommendationContext) =>
      wardrobePreferencesService.generateRecommendationReasons(itemTags, itemColor, context)
  };
};