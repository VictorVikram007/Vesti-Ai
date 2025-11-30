import { wardrobePreferencesService, RecommendationContext } from './wardrobePreferencesService';
import { ClothingItem, Outfit } from '@/context/WardrobeContext';

export interface AIRecommendation {
  type: 'outfit' | 'item' | 'style_tip' | 'wardrobe_gap';
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  items?: string[];
  actionable?: boolean;
}

export class AIAgentService {
  private static instance: AIAgentService;

  private constructor() {}

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Generate personalized recommendations based on user preferences
   */
  generatePersonalizedRecommendations(
    clothingItems: ClothingItem[],
    outfits: Outfit[],
    context: RecommendationContext = {}
  ): AIRecommendation[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) {
      return this.getGenericRecommendations();
    }

    const recommendations: AIRecommendation[] = [];

    // 1. Style-based outfit recommendations
    const styleRecommendations = this.getStyleBasedRecommendations(clothingItems, context);
    recommendations.push(...styleRecommendations);

    // 2. Color coordination suggestions
    const colorRecommendations = this.getColorCoordinationRecommendations(clothingItems);
    recommendations.push(...colorRecommendations);

    // 3. Wardrobe gap analysis
    const gapRecommendations = this.getWardrobeGapRecommendations(clothingItems);
    recommendations.push(...gapRecommendations);

    // 4. Sustainability suggestions
    if (preferences.sustainabilityPreference) {
      const sustainabilityRecommendations = this.getSustainabilityRecommendations(clothingItems);
      recommendations.push(...sustainabilityRecommendations);
    }

    // 5. Activity-based recommendations
    const activityRecommendations = this.getActivityBasedRecommendations(clothingItems, context);
    recommendations.push(...activityRecommendations);

    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }

  /**
   * Analyze outfit compatibility with user preferences
   */
  analyzeOutfitCompatibility(outfit: Outfit, clothingItems: ClothingItem[]): {
    score: number;
    feedback: string[];
    improvements: string[];
  } {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) {
      return { score: 0.5, feedback: [], improvements: [] };
    }

    const outfitItems = outfit.items
      .map(id => clothingItems.find(item => item.id === id))
      .filter(Boolean) as ClothingItem[];

    let totalScore = 0;
    const feedback: string[] = [];
    const improvements: string[] = [];

    // Analyze each item in the outfit
    outfitItems.forEach(item => {
      const itemScore = wardrobePreferencesService.getStyleCompatibilityScore(item.tags, item.category);
      totalScore += itemScore;

      // Color analysis
      if (wardrobePreferencesService.isColorPreferred(item.color)) {
        feedback.push(`${item.name} matches your preferred ${item.color.toLowerCase()} color palette`);
      } else if (wardrobePreferencesService.isColorDisliked(item.color)) {
        improvements.push(`Consider replacing ${item.name} with a preferred color`);
      }

      // Style analysis
      if (item.tags.includes(preferences.styleProfile.toLowerCase())) {
        feedback.push(`${item.name} aligns with your ${preferences.styleProfile} style`);
      }

      // Fit analysis
      if (item.tags.includes(preferences.preferredFit.toLowerCase())) {
        feedback.push(`${item.name} matches your preferred ${preferences.preferredFit.toLowerCase()} fit`);
      }
    });

    // Overall outfit analysis
    const avgScore = totalScore / Math.max(outfitItems.length, 1);
    
    if (avgScore < 0.4) {
      improvements.push('This outfit may not align well with your style preferences');
    } else if (avgScore > 0.8) {
      feedback.push('This outfit is highly compatible with your preferences!');
    }

    return {
      score: avgScore,
      feedback,
      improvements
    };
  }

  /**
   * Get personalized styling tips based on preferences
   */
  getPersonalizedStylingTips(): string[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) return [];

    const tips: string[] = [];

    // Style-specific tips
    const styleTips = {
      'Casual': [
        'Layer different textures for visual interest',
        'Mix high and low pieces for effortless style',
        'Invest in quality basics that can be styled multiple ways'
      ],
      'Formal': [
        'Ensure proper fit - tailoring makes a huge difference',
        'Stick to classic colors for versatility',
        'Pay attention to fabric quality and care'
      ],
      'Minimalist': [
        'Focus on clean lines and simple silhouettes',
        'Build a capsule wardrobe with versatile pieces',
        'Choose quality over quantity'
      ],
      'Streetwear': [
        'Mix oversized and fitted pieces for balance',
        'Experiment with bold colors and patterns',
        'Accessorize to complete your look'
      ]
    };

    const relevantTips = styleTips[preferences.styleProfile as keyof typeof styleTips] || [];
    tips.push(...relevantTips);

    // Color-specific tips
    if (preferences.likedColors.length > 0) {
      tips.push(`Build outfits around your preferred colors: ${preferences.likedColors.join(', ')}`);
    }

    // Activity-specific tips
    if (preferences.activityLevel === 'High' || preferences.activityLevel === 'Very high') {
      tips.push('Choose breathable, flexible fabrics for your active lifestyle');
      tips.push('Invest in quality athletic wear that transitions well');
    }

    // Sustainability tips
    if (preferences.sustainabilityPreference) {
      tips.push('Consider cost-per-wear when making purchases');
      tips.push('Look for timeless pieces that won\'t go out of style');
      tips.push('Take care of your clothes to extend their lifespan');
    }

    return tips.slice(0, 5);
  }

  private getStyleBasedRecommendations(clothingItems: ClothingItem[], context: RecommendationContext): AIRecommendation[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) return [];

    const recommendations: AIRecommendation[] = [];
    const suggestions = wardrobePreferencesService.getPersonalizedSuggestions(context);

    // Find items that match user's style profile
    const matchingItems = clothingItems.filter(item => 
      item.tags.some(tag => suggestions.priorityTags.includes(tag)) ||
      suggestions.suggestedColors.includes(item.color)
    );

    if (matchingItems.length >= 3) {
      recommendations.push({
        type: 'outfit',
        title: `Perfect ${preferences.styleProfile} Look`,
        description: `Create an outfit using your ${preferences.styleProfile.toLowerCase()} pieces`,
        confidence: 0.85,
        reasons: [
          `Matches your ${preferences.styleProfile} style profile`,
          'Uses your preferred colors',
          'Aligns with your activity level'
        ],
        items: matchingItems.slice(0, 3).map(item => item.id),
        actionable: true
      });
    }

    return recommendations;
  }

  private getColorCoordinationRecommendations(clothingItems: ClothingItem[]): AIRecommendation[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences || preferences.likedColors.length === 0) return [];

    const recommendations: AIRecommendation[] = [];
    const preferredColorItems = clothingItems.filter(item => 
      wardrobePreferencesService.isColorPreferred(item.color)
    );

    if (preferredColorItems.length >= 2) {
      recommendations.push({
        type: 'style_tip',
        title: 'Color Coordination Opportunity',
        description: `You have great pieces in ${preferences.likedColors.join(', ')} - try pairing them together`,
        confidence: 0.75,
        reasons: [
          'Uses your preferred color palette',
          'Creates cohesive looks',
          'Maximizes wardrobe versatility'
        ],
        actionable: true
      });
    }

    return recommendations;
  }

  private getWardrobeGapRecommendations(clothingItems: ClothingItem[]): AIRecommendation[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) return [];

    const recommendations: AIRecommendation[] = [];
    const categories = clothingItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check for missing essential categories
    const essentialCategories = ['Tops', 'Bottoms', 'Footwear', 'Outerwear'];
    const missingCategories = essentialCategories.filter(cat => !categories[cat] || categories[cat] < 2);

    if (missingCategories.length > 0) {
      recommendations.push({
        type: 'wardrobe_gap',
        title: 'Wardrobe Gap Identified',
        description: `Consider adding more ${missingCategories.join(', ').toLowerCase()} to complete your wardrobe`,
        confidence: 0.7,
        reasons: [
          'Improves wardrobe versatility',
          'Enables more outfit combinations',
          'Aligns with your style preferences'
        ],
        actionable: true
      });
    }

    return recommendations;
  }

  private getSustainabilityRecommendations(clothingItems: ClothingItem[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Find underused items
    const underusedItems = clothingItems.filter(item => 
      item.timesWorn < 5 && 
      Math.floor((Date.now() - item.addedAt.getTime()) / (1000 * 60 * 60 * 24)) > 30
    );

    if (underusedItems.length > 0) {
      recommendations.push({
        type: 'style_tip',
        title: 'Maximize Your Wardrobe',
        description: `You have ${underusedItems.length} underused items - let's create new outfits with them`,
        confidence: 0.8,
        reasons: [
          'Improves cost-per-wear',
          'Reduces fashion waste',
          'Discovers new styling possibilities'
        ],
        items: underusedItems.slice(0, 3).map(item => item.id),
        actionable: true
      });
    }

    return recommendations;
  }

  private getActivityBasedRecommendations(clothingItems: ClothingItem[], context: RecommendationContext): AIRecommendation[] {
    const preferences = wardrobePreferencesService.getPreferences();
    if (!preferences) return [];

    const recommendations: AIRecommendation[] = [];

    // Activity-specific recommendations
    if (preferences.activityLevel === 'High' || preferences.activityLevel === 'Very high') {
      const activeWear = clothingItems.filter(item => 
        item.tags.some(tag => ['athletic', 'sporty', 'comfortable', 'breathable'].includes(tag))
      );

      if (activeWear.length >= 2) {
        recommendations.push({
          type: 'outfit',
          title: 'Active Lifestyle Look',
          description: 'Perfect combination for your active lifestyle',
          confidence: 0.8,
          reasons: [
            'Matches your high activity level',
            'Provides comfort and flexibility',
            'Suitable for various activities'
          ],
          items: activeWear.slice(0, 3).map(item => item.id),
          actionable: true
        });
      }
    }

    return recommendations;
  }

  private getGenericRecommendations(): AIRecommendation[] {
    return [
      {
        type: 'style_tip',
        title: 'Complete Your Profile',
        description: 'Set your wardrobe preferences to get personalized AI recommendations',
        confidence: 1.0,
        reasons: ['Enables personalized styling', 'Improves recommendation accuracy'],
        actionable: true
      }
    ];
  }
}

// Singleton instance
export const aiAgentService = AIAgentService.getInstance();