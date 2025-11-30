interface MasumiRecommendation {
  outfitId: string;
  name: string;
  items: string[];
  matchScore: number;
  reasons: string[];
  occasion: string;
  season: string[];
  confidence: number;
}

interface MasumiRequest {
  userPreferences: {
    favoriteColors: string[];
    preferredStyles: string[];
    bodyType?: string;
    lifestyle: string;
  };
  wardrobeItems: {
    id: string;
    category: string;
    color: string;
    season: string[];
    tags: string[];
  }[];
  context: {
    weather?: string;
    occasion?: string;
    season: string;
    timeOfDay: string;
  };
}

class MasumiRecommendationService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_MASUMI_API_KEY || 'demo_key';
    this.endpoint = import.meta.env.VITE_MASUMI_ENDPOINT || 'https://api.masumi.io/v1';
  }

  async getOutfitRecommendations(request: MasumiRequest): Promise<MasumiRecommendation[]> {
    try {
      const response = await fetch(`${this.endpoint}/fashion/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          model: 'fashion-stylist-v2',
          maxRecommendations: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Masumi API error: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Masumi API Error:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  private getFallbackRecommendations(request: MasumiRequest): MasumiRecommendation[] {
    const { wardrobeItems, context, userPreferences } = request;
    
    // Smart fallback algorithm
    const recommendations: MasumiRecommendation[] = [];
    
    // Get items suitable for current season and occasion
    const suitableItems = wardrobeItems.filter(item => 
      item.season.includes(context.season) || item.season.includes('All Seasons')
    );

    // Create outfit combinations
    const tops = suitableItems.filter(item => item.category === 'Tops');
    const bottoms = suitableItems.filter(item => item.category === 'Bottoms');
    const footwear = suitableItems.filter(item => item.category === 'Footwear');
    const outerwear = suitableItems.filter(item => item.category === 'Outerwear');

    // Generate 3 outfit recommendations
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      const outfit: MasumiRecommendation = {
        outfitId: `masumi-${Date.now()}-${i}`,
        name: this.generateOutfitName(context.occasion, i + 1),
        items: [],
        matchScore: 0,
        reasons: [],
        occasion: context.occasion || 'Casual',
        season: [context.season],
        confidence: 0.8
      };

      // Add top
      if (tops[i]) {
        outfit.items.push(tops[i].id);
      }

      // Add bottom
      if (bottoms[i % bottoms.length]) {
        outfit.items.push(bottoms[i % bottoms.length].id);
      }

      // Add footwear
      if (footwear[i % footwear.length]) {
        outfit.items.push(footwear[i % footwear.length].id);
      }

      // Add outerwear if needed
      if (outerwear.length > 0 && (context.weather === 'cold' || context.season === 'Winter')) {
        outfit.items.push(outerwear[i % outerwear.length].id);
      }

      // Calculate match score
      outfit.matchScore = this.calculateMatchScore(outfit.items, wardrobeItems, userPreferences);
      
      // Generate reasons
      outfit.reasons = this.generateReasons(outfit.items, wardrobeItems, context);

      if (outfit.items.length >= 2) {
        recommendations.push(outfit);
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  private generateOutfitName(occasion?: string, index: number = 1): string {
    const names = {
      'Casual': [`Effortless Daily Look ${index}`, `Casual Comfort ${index}`, `Relaxed Style ${index}`],
      'Formal': [`Professional Power ${index}`, `Business Excellence ${index}`, `Formal Elegance ${index}`],
      'Party': [`Night Out Glam ${index}`, `Party Perfect ${index}`, `Evening Chic ${index}`],
      'Weekend': [`Weekend Vibes ${index}`, `Leisure Look ${index}`, `Off-Duty Style ${index}`]
    };

    const occasionNames = names[occasion as keyof typeof names] || names['Casual'];
    return occasionNames[(index - 1) % occasionNames.length];
  }

  private calculateMatchScore(itemIds: string[], wardrobeItems: any[], userPreferences: any): number {
    let score = 60; // Base score

    const outfitItems = itemIds.map(id => wardrobeItems.find(item => item.id === id)).filter(Boolean);

    // Color coordination bonus
    const colors = outfitItems.map(item => item.color);
    const uniqueColors = new Set(colors);
    if (uniqueColors.size <= 3) score += 15; // Good color coordination

    // User preference match
    const preferredColors = userPreferences.favoriteColors || [];
    const colorMatch = colors.some(color => preferredColors.includes(color));
    if (colorMatch) score += 10;

    // Style consistency
    const styles = outfitItems.flatMap(item => item.tags);
    const styleConsistency = styles.filter(tag => 
      ['casual', 'formal', 'elegant', 'sporty'].includes(tag)
    ).length;
    if (styleConsistency >= 2) score += 10;

    // Completeness bonus
    const categories = new Set(outfitItems.map(item => item.category));
    if (categories.has('Tops') && categories.has('Bottoms')) score += 5;
    if (categories.has('Footwear')) score += 3;

    return Math.min(score, 98); // Cap at 98%
  }

  private generateReasons(itemIds: string[], wardrobeItems: any[], context: any): string[] {
    const reasons = [];
    const outfitItems = itemIds.map(id => wardrobeItems.find(item => item.id === id)).filter(Boolean);

    // Season appropriateness
    if (outfitItems.some(item => item.season.includes(context.season))) {
      reasons.push(`Perfect for ${context.season.toLowerCase()} weather`);
    }

    // Color harmony
    const colors = outfitItems.map(item => item.color);
    if (new Set(colors).size <= 2) {
      reasons.push('Excellent color coordination');
    }

    // Occasion match
    if (context.occasion) {
      reasons.push(`Ideal for ${context.occasion.toLowerCase()} occasions`);
    }

    // Style consistency
    const casualItems = outfitItems.filter(item => item.tags.includes('casual'));
    const formalItems = outfitItems.filter(item => item.tags.includes('formal'));
    
    if (casualItems.length >= 2) {
      reasons.push('Comfortable and relaxed styling');
    } else if (formalItems.length >= 2) {
      reasons.push('Professional and polished look');
    }

    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  async getStyleInsights(wardrobeItems: any[]): Promise<{
    dominantStyle: string;
    colorPalette: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.endpoint}/fashion/insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wardrobeItems,
          analysisType: 'style-profile'
        })
      });

      if (!response.ok) {
        throw new Error(`Masumi API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Masumi Insights Error:', error);
      return this.getFallbackInsights(wardrobeItems);
    }
  }

  private getFallbackInsights(wardrobeItems: any[]) {
    const styles = wardrobeItems.flatMap(item => item.tags);
    const styleCount = styles.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantStyle = Object.entries(styleCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Casual';

    const colors = wardrobeItems.map(item => item.color);
    const colorCount = colors.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colorPalette = Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);

    return {
      dominantStyle,
      colorPalette,
      recommendations: [
        'Add more versatile pieces to your wardrobe',
        'Consider investing in quality basics',
        'Experiment with new color combinations'
      ]
    };
  }
}

export const masumiService = new MasumiRecommendationService();
export type { MasumiRecommendation, MasumiRequest };