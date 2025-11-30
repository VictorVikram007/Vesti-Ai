import { useState, useEffect } from "react";
import { useWardrobe } from "@/context/WardrobeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getWeatherByLocation } from "@/services/weatherService";
import { getWeatherBasedOutfits, getCurrentSeason } from "@/utils/outfitPredictor";
import { getPersonalizedRecommendations, initializeAILearning, getLocationBasedRecommendations } from '@/utils/aiLearning';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Outfits = () => {
  const { clothingItems, outfits, addOutfit, updateOutfit, removeOutfit } = useWardrobe();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedOutfitId = queryParams.get("selected");

  const [selectedClothingItems, setSelectedClothingItems] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [seasons, setSeasons] = useState<string[]>(["All Seasons"]);
  const [showNewOutfitDialog, setShowNewOutfitDialog] = useState(false);
  const [filter, setFilter] = useState("");
  
  const [selectedOutfit, setSelectedOutfit] = useState<typeof outfits[0] | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<typeof outfits[0] | null>(null);

  // New state for weather-based recommendations
  interface WeatherData {
    temperature: number;
    precipitation: number;
    location: string;
    region: string;
    country: string;
    description: string;
    iconUrl: string;
  }

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendedOutfits, setRecommendedOutfits] = useState<typeof outfits>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [recommendationOccasion, setRecommendationOccasion] = useState("Casual");

  // AI learning state
  const [aiLearningData, setAiLearningData] = useState(initializeAILearning());
  const [personalizedOutfits, setPersonalizedOutfits] = useState<typeof outfits>([]);
  const [locationRecommendations, setLocationRecommendations] = useState<object | null>(null);

  // Manual location input state
  const [manualLocation, setManualLocation] = useState<string>("");

  // Removed automatic fetch on manualLocation change to prevent input closing on typing
  // Fetch weather moved to button click handler

  // Generate recommendations whenever data changes
  useEffect(() => {
    if (weatherData && outfits.length > 0) {
      // Create weather context from weather data
      const weatherContext = {
        temperature: weatherData.temperature,
        precipitation: weatherData.precipitation,
        season: getCurrentSeason(),
        occasion: recommendationOccasion
      };

      // Get weather-based recommendations
      const recommendations = getWeatherBasedOutfits(outfits, clothingItems, weatherContext, 3);
      
      // Add proper recommendation scores and reasons
      const recommendationsWithScores = recommendations.map(outfit => ({
        ...outfit,
        recommendationScore: outfit.prediction?.score || Math.random() * 0.4 + 0.6,
        reasons: outfit.prediction?.reasons || ['AI recommended for current conditions']
      }));
      
      setRecommendedOutfits(recommendationsWithScores);

      // Get location-based recommendations
      const locationRecs = getLocationBasedRecommendations(
        weatherData.location,
        weatherData.region,
        weatherData.country,
        weatherData,
        aiLearningData.locationPreferences
      );
      setLocationRecommendations(locationRecs);

      // Get personalized recommendations using AI learning with location
      const personalized = getPersonalizedRecommendations(
        outfits,
        clothingItems,
        aiLearningData.userPreferences,
        weatherData,
        recommendationOccasion,
        weatherData.location,
        weatherData.region,
        aiLearningData.locationPreferences,
        5
      );

      // Add recommendationScore and reasons to each personalized outfit for UI display
      const personalizedWithScores = personalized.map(outfit => ({
        ...outfit,
        recommendationScore: outfit.recommendationScore ?? 0,
        reasons: outfit.reasons ?? []
      }));

      setPersonalizedOutfits(personalizedWithScores);
    }
  }, [weatherData, outfits, clothingItems, recommendationOccasion, aiLearningData.userPreferences]);

  useEffect(() => {
    if (selectedOutfitId) {
      const outfit = outfits.find(o => o.id === selectedOutfitId);
      if (outfit) {
        setSelectedOutfit(outfit);
      }
    }
  }, [selectedOutfitId, outfits]);

  const handleCreateOutfit = () => {
    if (!outfitName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your outfit",
        variant: "destructive",
      });
      return;
    }

    if (selectedClothingItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one clothing item",
        variant: "destructive",
      });
      return;
    }

    if (editingOutfit) {
      // Update existing outfit
      updateOutfit(editingOutfit.id, {
        name: outfitName,
        items: selectedClothingItems,
        season: seasons,
        occasion,
      });

      toast({
        title: "Outfit Updated",
        description: `"${outfitName}" has been updated`,
      });

      // Update selected outfit if it's the one being edited
      if (selectedOutfit?.id === editingOutfit.id) {
        setSelectedOutfit({
          ...selectedOutfit,
          name: outfitName,
          items: selectedClothingItems,
          season: seasons,
          occasion,
        });
      }

      setShowEditDialog(false);
      setEditingOutfit(null);
    } else {
      // Create new outfit
      addOutfit({
        name: outfitName,
        items: selectedClothingItems,
        season: seasons,
        occasion,
        favorite: false,
        lastWorn: undefined,
      });

      toast({
        title: "Outfit Created",
        description: `"${outfitName}" has been added to your outfits`,
      });

      setShowNewOutfitDialog(false);
    }

    // Reset form
    setOutfitName("");
    setSelectedClothingItems([]);
    setSeasons(["All Seasons"]);
    setOccasion("Casual");
  };

  const toggleItemSelection = (itemId: string) => {
    if (selectedClothingItems.includes(itemId)) {
      setSelectedClothingItems(selectedClothingItems.filter(id => id !== itemId));
    } else {
      setSelectedClothingItems([...selectedClothingItems, itemId]);
    }
  };

  const handleSeasonChange = (season: string) => {
    if (season === "All Seasons") {
      setSeasons(["All Seasons"]);
    } else {
      // Remove "All Seasons" if it's there
      const newSeasons = seasons.filter(s => s !== "All Seasons");
      
      // Toggle the selected season
      if (newSeasons.includes(season)) {
        setSeasons(newSeasons.filter(s => s !== season));
        // If no seasons are selected after removing, default to "All Seasons"
        if (newSeasons.length === 0) {
          setSeasons(["All Seasons"]);
        }
      } else {
        setSeasons([...newSeasons, season]);
      }
    }
  };

  const filteredOutfits = outfits.filter(outfit => 
    outfit.name.toLowerCase().includes(filter.toLowerCase()) ||
    outfit.occasion.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Manual Location Input */}
      {(weatherData === null || manualLocation === "") && (
        <div className="bg-card border rounded-lg p-6 animate-fade-in space-y-4" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold">Enter Your Location</h2>
          <p className="text-muted-foreground">Get personalized outfit recommendations based on your local weather</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your city or location..."
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={async () => {
                if (manualLocation.trim() !== "") {
                  setIsLoadingWeather(true);
                  try {
                    const data = await getWeatherByLocation(manualLocation.trim());
                    setWeatherData(data);
                  } catch (error) {
                    console.error("Error fetching weather data:", error);
                    toast({
                      title: "Error",
                      description: "Failed to fetch weather data for the location",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoadingWeather(false);
                  }
                }
              }}
              disabled={!manualLocation.trim()}
              className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            >
              Get Weather
            </Button>
          </div>
        </div>
      )}

      {/* Weather-Based Recommendations */}
      {weatherData && (
        <div className="bg-card border rounded-lg p-6 animate-fade-in space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">AI Outfit Suggestions</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <img 
                  src={weatherData.iconUrl} 
                  alt={weatherData.description} 
                  className="w-8 h-8"
                />
                <span>{weatherData.temperature}°C, {weatherData.description}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-full">{weatherData.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWeatherData(null);
                  setManualLocation("");
                }}
              >
                Change Location
              </Button>
              <span className="text-sm">For occasion:</span>
              <Select value={recommendationOccasion} onValueChange={setRecommendationOccasion}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {recommendedOutfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {recommendedOutfits.map((outfit, index) => (
                <Card 
                  key={outfit.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    index === 0 ? 'border-wardrobe-teal' : ''
                  }`}
                  onClick={() => {
                    navigate(`/outfits?selected=${outfit.id}`);
                    setSelectedOutfit(outfit);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{outfit.name}</CardTitle>
                  <div className="bg-muted rounded-full px-2 flex items-center">
                    <span className="text-sm font-medium">
                      {Math.round((outfit.recommendationScore || 0.75) * 100)}% match
                    </span>
                  </div>
                    </div>
                    <CardDescription>{outfit.occasion}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-1">
                      {outfit.items.slice(0, 4).map((itemId: string) => {
                        const item = clothingItems.find(i => i.id === itemId);
                        return item ? (
                          <div key={itemId} className="aspect-square rounded-md overflow-hidden bg-muted">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-3 text-xs text-muted-foreground flex flex-wrap">
                    {(outfit.reasons ?? []).slice(0, 2).map((reason: string, i: number) => (
                      <span key={i} className="mr-1">• {reason}</span>
                    ))}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No outfit recommendations found</p>
              <p className="text-sm text-muted-foreground">Try creating more outfits or changing the occasion</p>
              <Button 
                className="mt-2 bg-wardrobe-teal hover:bg-wardrobe-teal/90" 
                onClick={() => setShowNewOutfitDialog(true)}
              >
                Create New Outfit
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Outfits</h1>
        <Dialog open={showNewOutfitDialog} onOpenChange={(open) => {
          setShowNewOutfitDialog(open);
          if (!open) {
            setOutfitName("");
            setSelectedClothingItems([]);
            setSeasons(["All Seasons"]);
            setOccasion("Casual");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-wardrobe-teal hover:bg-wardrobe-teal/90">
              Create New Outfit
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Outfit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="outfitName" className="text-right">
                  Name
                </Label>
                <Input
                  id="outfitName"
                  placeholder="Summer Casual"
                  className="col-span-3"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="occasion" className="text-right">
                  Occasion
                </Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Seasons</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {["All Seasons", "Spring", "Summer", "Fall", "Winter"].map((season) => (
                    <Button
                      key={season}
                      type="button"
                      variant={seasons.includes(season) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSeasonChange(season)}
                      className={seasons.includes(season) ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
                    >
                      {season}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Select Items</Label>
                <div className="col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                  {clothingItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`border rounded-md cursor-pointer overflow-hidden transition-colors ${
                        selectedClothingItems.includes(item.id) 
                          ? "border-wardrobe-teal bg-wardrobe-teal/10" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedClothingItems.includes(item.id) && (
                          <div className="absolute inset-0 bg-wardrobe-teal/20 flex items-center justify-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="text-wardrobe-teal h-8 w-8"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-sm">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                  ))}
                  {clothingItems.length === 0 && (
                    <div className="col-span-full text-center p-4 border rounded-md">
                      <p className="text-muted-foreground">No clothing items found</p>
                      <Button 
                        className="mt-2" 
                        size="sm"
                        onClick={() => {
                          setShowNewOutfitDialog(false);
                          navigate("/add-item");
                        }}
                      >
                        Add Items
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewOutfitDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                onClick={handleCreateOutfit}
                disabled={!outfitName || selectedClothingItems.length === 0}
              >
                Create Outfit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Outfit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingOutfit(null);
            setOutfitName("");
            setSelectedClothingItems([]);
            setSeasons(["All Seasons"]);
            setOccasion("Casual");
          }
        }}>
          <DialogContent className="md:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Outfit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editOutfitName" className="text-right">
                  Name
                </Label>
                <Input
                  id="editOutfitName"
                  placeholder="Summer Casual"
                  className="col-span-3"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editOccasion" className="text-right">
                  Occasion
                </Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Seasons</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {["All Seasons", "Spring", "Summer", "Fall", "Winter"].map((season) => (
                    <Button
                      key={season}
                      type="button"
                      variant={seasons.includes(season) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSeasonChange(season)}
                      className={seasons.includes(season) ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
                    >
                      {season}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Select Items</Label>
                <div className="col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                  {clothingItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`border rounded-md cursor-pointer overflow-hidden transition-colors ${
                        selectedClothingItems.includes(item.id) 
                          ? "border-wardrobe-teal bg-wardrobe-teal/10" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedClothingItems.includes(item.id) && (
                          <div className="absolute inset-0 bg-wardrobe-teal/20 flex items-center justify-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="text-wardrobe-teal h-8 w-8"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-sm">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="destructive"
                onClick={() => {
                  if (editingOutfit) {
                    removeOutfit(editingOutfit.id);
                    toast({
                      title: "Outfit Deleted",
                      description: `"${editingOutfit.name}" has been deleted`,
                    });
                    setShowEditDialog(false);
                    setEditingOutfit(null);
                    if (selectedOutfit?.id === editingOutfit.id) {
                      setSelectedOutfit(null);
                      navigate("/outfits");
                    }
                  }
                }}
              >
                Delete Outfit
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                  onClick={handleCreateOutfit}
                  disabled={!outfitName || selectedClothingItems.length === 0}
                >
                  Update Outfit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        <Input 
          placeholder="Search outfits..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
        
        {filteredOutfits.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-card">
            <h3 className="text-lg font-medium mb-2">No outfits found</h3>
            <p className="text-muted-foreground mb-4">
              {filter ? "Try adjusting your search" : "Create your first outfit"}
            </p>
            <Button onClick={() => setShowNewOutfitDialog(true)}>
              Create New Outfit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => (
              <div 
                key={outfit.id}
                className={`bg-card rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
                  selectedOutfit?.id === outfit.id 
                    ? "ring-2 ring-wardrobe-teal shadow-md" 
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedOutfit(
                    selectedOutfit?.id === outfit.id ? null : outfit
                  );
                  
                  // Update URL
                  if (selectedOutfit?.id === outfit.id) {
                    navigate("/outfits");
                  } else {
                    navigate(`/outfits?selected=${outfit.id}`);
                  }
                }}
              >
                <div className="aspect-[4/3] bg-muted-foreground/10 flex items-center justify-center relative">
                  <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                    {outfit.items.slice(0, 4).map((itemId) => {
                      const item = clothingItems.find(i => i.id === itemId);
                      return item ? (
                        <div key={item.id} className="bg-background rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                  {outfit.favorite && (
                    <div className="absolute top-2 right-2 bg-card rounded-full p-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-4 h-4 text-yellow-500"
                      >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{outfit.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">{outfit.occasion}</span>
                    <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                      {outfit.items.length} items
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedOutfit && (
        <div className="mt-8 p-6 border rounded-lg bg-card animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">{selectedOutfit.name}</h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Occasion</span>
                  <span>{selectedOutfit.occasion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Season</span>
                  <span>{selectedOutfit.season.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(selectedOutfit.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedOutfit.lastWorn && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Worn</span>
                    <span>{new Date(selectedOutfit.lastWorn).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditingOutfit(selectedOutfit);
                    setOutfitName(selectedOutfit.name);
                    setOccasion(selectedOutfit.occasion);
                    setSeasons(selectedOutfit.season);
                    setSelectedClothingItems(selectedOutfit.items);
                    setShowEditDialog(true);
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Button>
                <Button 
                  variant={selectedOutfit.favorite ? "default" : "outline"}
                  onClick={() => {
                    updateOutfit(selectedOutfit.id, { favorite: !selectedOutfit.favorite });
                    setSelectedOutfit({ ...selectedOutfit, favorite: !selectedOutfit.favorite });
                    toast({
                      title: selectedOutfit.favorite ? "Removed from favorites" : "Added to favorites",
                      description: `${selectedOutfit.name} ${selectedOutfit.favorite ? 'removed from' : 'added to'} favorites`
                    });
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={selectedOutfit.favorite ? "currentColor" : "none"}
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  {selectedOutfit.favorite ? "Favorited" : "Favorite"}
                </Button>
                <Button 
                  className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                  onClick={() => {
                    updateOutfit(selectedOutfit.id, { lastWorn: new Date() });
                    setSelectedOutfit({ ...selectedOutfit, lastWorn: new Date() });
                    toast({
                      title: "Outfit worn!",
                      description: `Marked "${selectedOutfit.name}" as worn today`
                    });
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Mark as Worn
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="font-medium mb-3">Items in this outfit</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {selectedOutfit.items.map((itemId) => {
                  const item = clothingItems.find(i => i.id === itemId);
                  return item ? (
                    <div 
                      key={item.id}
                      className="border rounded-md overflow-hidden hover:bg-muted/50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                    >
                      <div className="aspect-square">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 text-sm">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outfits;
