import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWardrobe } from '@/context/WardrobeContext';
import { aiAgentService, AIRecommendation } from '@/services/aiAgentService';
import { useWardrobePreferences } from '@/services/wardrobePreferencesService';
import { Sparkles, Lightbulb, ShoppingBag, AlertTriangle, RefreshCw } from 'lucide-react';

export const AIRecommendationsDemo: React.FC = () => {
  const { clothingItems, outfits } = useWardrobe();
  const { preferences } = useWardrobePreferences();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const context = {
        occasion: 'Casual',
        season: getCurrentSeason(),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
      };
      
      const newRecommendations = aiAgentService.generatePersonalizedRecommendations(
        clothingItems,
        outfits,
        context
      );
      
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (preferences && clothingItems.length > 0) {
      generateRecommendations();
    }
  }, [preferences, clothingItems]);

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'outfit': return Sparkles;
      case 'style_tip': return Lightbulb;
      case 'wardrobe_gap': return ShoppingBag;
      default: return AlertTriangle;
    }
  };

  const getRecommendationColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Set Your Preferences First</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your wardrobe preferences in Settings to get personalized AI recommendations.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings'}>
              Go to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalized suggestions based on your style preferences
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = getRecommendationIcon(rec.type);
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{rec.title}</h4>
                    </div>
                    <Badge variant={getRecommendationColor(rec.confidence)}>
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  
                  {rec.reasons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Why this works:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {rec.reasons.map((reason, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.actionable && (
                    <Button variant="outline" size="sm" className="w-full">
                      {rec.type === 'outfit' ? 'Create Outfit' : 
                       rec.type === 'wardrobe_gap' ? 'Shop Now' : 'Learn More'}
                    </Button>
                  )}
                </div>
              );
            })}
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">How AI uses your preferences:</p>
              <ul className="space-y-1">
                <li>• Style profile: {preferences.styleProfile}</li>
                <li>• Preferred fit: {preferences.preferredFit}</li>
                <li>• Activity level: {preferences.activityLevel}</li>
                {preferences.likedColors.length > 0 && (
                  <li>• Favorite colors: {preferences.likedColors.join(', ')}</li>
                )}
                {preferences.sustainabilityPreference && (
                  <li>• Sustainability preference: Enabled</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Recommendations Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add more items to your wardrobe to get personalized recommendations.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/closet'}>
              Add Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsDemo;