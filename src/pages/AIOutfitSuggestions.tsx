import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWardrobe } from '@/context/WardrobeContext';
import { useWardrobePreferences } from '@/services/wardrobePreferencesService';
import { aiAgentService } from '@/services/aiAgentService';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Heart, RefreshCw, Save, Calendar, MapPin, Thermometer } from 'lucide-react';

const AIOutfitSuggestions = () => {
  const { clothingItems, addOutfit } = useWardrobe();
  const { preferences, getPersonalizedSuggestions } = useWardrobePreferences();
  const { toast } = useToast();
  
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const occasions = ['Work', 'Casual', 'Date night', 'Special events', 'Travel', 'Party', 'Meeting'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];

  const generateOutfits = async () => {
    if (!selectedOccasion) {
      toast({ title: "Select an occasion", description: "Please choose an occasion to get suggestions." });
      return;
    }

    setIsGenerating(true);
    try {
      const context = {
        occasion: selectedOccasion,
        season: selectedSeason || getCurrentSeason(),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
      };

      const personalizedSuggestions = getPersonalizedSuggestions(context);
      const outfitCombinations = generateAIOutfitCombinations(context, personalizedSuggestions);
      
      setSuggestions(outfitCombinations);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate outfit suggestions." });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIOutfitCombinations = (context: any, personalizedSuggestions: any) => {
    const filteredItems = clothingItems.filter(item => {
      // Filter by season
      if (context.season && !item.season.includes(context.season) && !item.season.includes('All Seasons')) {
        return false;
      }
      
      // Filter by user preferences
      if (preferences) {
        if (preferences.dislikedColors.includes(item.color)) return false;
        if (item.tags.some(tag => preferences.avoidPatterns.includes(tag))) return false;
      }
      
      return true;
    });

    const tops = filteredItems.filter(item => item.category === 'Tops');
    const bottoms = filteredItems.filter(item => item.category === 'Bottoms');
    const footwear = filteredItems.filter(item => item.category === 'Footwear');
    const outerwear = filteredItems.filter(item => item.category === 'Outerwear');

    const combinations = [];
    
    // Generate 6 outfit combinations
    for (let i = 0; i < Math.min(6, tops.length); i++) {
      const top = tops[i];
      const bottom = bottoms[i % bottoms.length];
      const shoes = footwear[i % footwear.length];
      const jacket = outerwear[i % outerwear.length];

      if (top && bottom && shoes) {
        const outfitItems = [top, bottom, shoes];
        if (jacket && (context.season === 'Fall' || context.season === 'Winter')) {
          outfitItems.push(jacket);
        }

        const score = calculateOutfitScore(outfitItems, context);
        const reasons = generateOutfitReasons(outfitItems, context);

        combinations.push({
          id: `ai-${Date.now()}-${i}`,
          name: `${context.occasion} Look ${i + 1}`,
          items: outfitItems,
          score,
          reasons,
          occasion: context.occasion,
          season: context.season
        });
      }
    }

    return combinations.sort((a, b) => b.score - a.score);
  };

  const calculateOutfitScore = (items: any[], context: any) => {
    let score = 50; // Base score

    // Occasion matching
    const occasionTags = {
      'Work': ['professional', 'formal', 'business'],
      'Casual': ['casual', 'comfortable', 'relaxed'],
      'Date night': ['elegant', 'stylish', 'romantic'],
      'Party': ['trendy', 'bold', 'fashionable'],
      'Meeting': ['professional', 'formal', 'polished']
    };

    const relevantTags = occasionTags[context.occasion as keyof typeof occasionTags] || [];
    items.forEach(item => {
      if (item.tags.some((tag: string) => relevantTags.includes(tag))) {
        score += 15;
      }
    });

    // User preference matching
    if (preferences) {
      items.forEach(item => {
        if (preferences.likedColors.includes(item.color)) score += 10;
        if (item.tags.includes(preferences.styleProfile.toLowerCase())) score += 15;
        if (item.tags.includes(preferences.preferredFit.toLowerCase())) score += 10;
      });
    }

    // Color coordination
    const colors = items.map(item => item.color);
    const uniqueColors = new Set(colors);
    if (uniqueColors.size <= 3) score += 10; // Good color coordination

    return Math.min(score, 100);
  };

  const generateOutfitReasons = (items: any[], context: any) => {
    const reasons = [];
    
    if (preferences) {
      const matchingColors = items.filter(item => preferences.likedColors.includes(item.color));
      if (matchingColors.length > 0) {
        reasons.push(`Uses your preferred ${matchingColors[0].color.toLowerCase()} color`);
      }
      
      const styleMatch = items.find(item => item.tags.includes(preferences.styleProfile.toLowerCase()));
      if (styleMatch) {
        reasons.push(`Matches your ${preferences.styleProfile} style`);
      }
    }
    
    reasons.push(`Perfect for ${context.occasion.toLowerCase()} occasions`);
    reasons.push(`Weather-appropriate for ${context.season || 'current season'}`);
    
    return reasons.slice(0, 3);
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const saveOutfit = (suggestion: any) => {
    addOutfit({
      name: suggestion.name,
      items: suggestion.items.map((item: any) => item.id),
      season: [suggestion.season],
      occasion: suggestion.occasion,
      favorite: false,
      reasons: suggestion.reasons
    });
    
    toast({ 
      title: "Outfit saved!", 
      description: `${suggestion.name} has been added to your outfits.` 
    });
  };

  useEffect(() => {
    setSelectedSeason(getCurrentSeason());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Outfit Suggestions
          </h1>
          <p className="text-muted-foreground">Get personalized outfit recommendations based on your preferences</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tell us about your needs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Occasion *</label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map(occasion => (
                    <SelectItem key={occasion} value={occasion}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {occasion}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Season</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season} value={season}>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        {season}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateOutfits} 
                disabled={isGenerating || !selectedOccasion}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Outfits
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {preferences && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Using your preferences:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{preferences.styleProfile}</Badge>
                <Badge variant="outline">{preferences.preferredFit} fit</Badge>
                {preferences.likedColors.slice(0, 3).map(color => (
                  <Badge key={color} variant="secondary">{color}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your AI-Generated Outfits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                    <Badge variant={suggestion.score >= 80 ? "default" : suggestion.score >= 60 ? "secondary" : "outline"}>
                      {suggestion.score}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outfit Items */}
                  <div className="grid grid-cols-2 gap-2">
                    {suggestion.items.map((item: any, index: number) => (
                      <div key={index} className="text-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-20 object-cover rounded mb-1"
                        />
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Reasons */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Why this works:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {suggestion.reasons.map((reason: string, index: number) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => saveOutfit(suggestion)}
                      className="flex-1"
                      size="sm"
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {suggestions.length === 0 && !isGenerating && (
        <Card className="text-center p-12">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to create amazing outfits?</h3>
          <p className="text-muted-foreground mb-4">
            Select an occasion and let our AI create personalized outfit combinations for you.
          </p>
          <p className="text-sm text-muted-foreground">
            Our AI considers your style preferences, favorite colors, and the occasion to suggest the perfect look.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AIOutfitSuggestions;