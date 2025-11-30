import { useWardrobe } from "@/context/WardrobeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Clock, Palette, Plus, HelpCircle, X, Cloud } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { getCurrentWeather, WeatherData } from "@/services/weatherService";
import { GamifiedTutorial } from "@/components/GamifiedTutorial";

const Dashboard = () => {
  const { clothingItems, outfits, getRecommendedOutfits } = useWardrobe();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getCurrentWeather();
        setWeather(weatherData);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };
    fetchWeather();
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('vesti-onboarding-seen');
    if (!hasSeenOnboarding && clothingItems.length === 0) {
      setShowOnboarding(true);
    }
    
    // Show tutorial for new users
    const hasSeenTutorial = localStorage.getItem('vesti-tutorial-skipped') || localStorage.getItem('vesti-tutorial-progress');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [clothingItems.length]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤️";
    if (hour < 21) return "Good evening! 🌅";
    return "Good night! 🌙";
  };

  const getGreetingMessage = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Ready to start your day in style?";
    if (hour < 17) return "Time to refresh your look?";
    if (hour < 21) return "Ready to look amazing tonight?";
    return "Planning tomorrow's outfit?";
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('vesti-onboarding-seen', 'true');
  };
  
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };
  
  const currentSeason = getCurrentSeason();
  const recommendedOutfits = getRecommendedOutfits(undefined, currentSeason);
  
  // Calculate wardrobe stats
  const totalItems = clothingItems.length;
  const totalOutfits = outfits.length;
  
  // Category distribution
  const categoryCounts: Record<string, number> = {};
  clothingItems.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
  
  // Color distribution
  const colorCounts: Record<string, number> = {};
  clothingItems.forEach(item => {
    colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
  });
  
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  
  // AI Insights
  const getAIInsights = () => {
    const insights = [];
    
    // Unused items insight
    const oldItems = clothingItems.filter(item => {
      if (!item.lastWorn) return true;
      const daysSince = Math.floor((Date.now() - new Date(item.lastWorn).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    });
    
    if (oldItems.length > 0) {
      insights.push(`You haven't worn your ${oldItems[0].name} in a while. Let's create an outfit with it!`);
    }
    
    // Color analysis
    const neutralColors = ['Black', 'White', 'Grey', 'Beige', 'Navy'];
    const neutralCount = clothingItems.filter(item => neutralColors.includes(item.color)).length;
    const neutralPercentage = Math.round((neutralCount / totalItems) * 100);
    
    if (neutralPercentage > 50) {
      insights.push(`Your wardrobe is ${neutralPercentage}% neutral colors - perfect for versatile styling!`);
    }
    
    // Pairing suggestions
    const jeans = clothingItems.filter(item => item.name.toLowerCase().includes('jean'));
    const tops = clothingItems.filter(item => item.category === 'Tops');
    
    if (jeans.length > 0 && tops.length > 0) {
      insights.push(`You have ${tops.length} tops that pair well with your favorite jeans.`);
    }
    
    return insights.slice(0, 2);
  };
  
  const aiInsights = getAIInsights();
  
  // Today's outfit recommendation
  const getTodaysOutfit = () => {
    if (recommendedOutfits.length === 0) return null;
    return recommendedOutfits[0];
  };
  
  const todaysOutfit = getTodaysOutfit();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
            <p className="text-muted-foreground">{getGreetingMessage()}</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-wardrobe-teal/10 rounded-lg">
              <Clock className="h-4 w-4 text-wardrobe-teal" />
              <span className="text-sm font-medium text-wardrobe-teal">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {weather && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Cloud className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {weather.temperature}°C • {weather.description}
                </span>
              </div>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              className="h-12 px-6 hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
              onClick={() => navigate("/add-item")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </TooltipTrigger>
          {showOnboarding && (
            <TooltipContent side="bottom" className="bg-wardrobe-teal text-white">
              <p>Start by adding items to your wardrobe!</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <Card className="bg-gradient-to-r from-blue-50 to-wardrobe-teal/10 border-wardrobe-teal/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wardrobe-teal/20 rounded-full">
                  <HelpCircle className="h-5 w-5 text-wardrobe-teal" />
                </div>
                <div>
                  <h3 className="font-semibold">Welcome to Vesti AI! 👋</h3>
                  <p className="text-sm text-muted-foreground">Let's get you started with your smart wardrobe</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTutorial(true)}
                    className="mt-2"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Tutorial
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={dismissOnboarding}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Outfit Recommendation */}
      {todaysOutfit && (
        <Card className="bg-gradient-to-r from-wardrobe-teal/10 to-blue-50 border-wardrobe-teal/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-wardrobe-teal" />
              Today's AI Recommendation
            </CardTitle>
            <CardDescription>Perfect for {currentSeason.toLowerCase()} weather</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-2 gap-1 w-20 h-20 bg-white rounded-lg p-2">
                  {todaysOutfit.items.slice(0, 4).map((itemId, index) => {
                    const item = clothingItems.find(i => i.id === itemId);
                    return item ? (
                      <div key={item.id} className="bg-gray-100 rounded-sm overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div key={index} className="bg-gray-200 rounded-sm"></div>
                    );
                  })}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{todaysOutfit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Recommended for {todaysOutfit.occasion.toLowerCase()} occasions
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate(`/outfits?selected=${todaysOutfit.id}`)}
                className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
              >
                Style Me Today
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Wardrobe Overview */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/closet")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-wardrobe-teal" />
                  Wardrobe Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center cursor-pointer hover:text-wardrobe-teal">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium text-2xl">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center cursor-pointer hover:text-wardrobe-teal">
                    <span className="text-muted-foreground">Total Outfits</span>
                    <span className="font-medium text-2xl">{totalOutfits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Season</span>
                    <span className="font-medium">{currentSeason}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          {showOnboarding && (
            <TooltipContent side="right" className="bg-wardrobe-teal text-white">
              <p>Click to view your full closet</p>
            </TooltipContent>
          )}
        </Tooltip>
        
        {/* Closet at a Glance */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/closet")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-wardrobe-teal" />
                  Closet at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {totalItems > 0 ? (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-medium">Categories</p>
                          <span className="text-xs text-muted-foreground">{Object.keys(categoryCounts).length} types</span>
                        </div>
                        {topCategories.slice(0, 3).map(([category, count]) => (
                          <div key={category} className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">{category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-wardrobe-teal to-blue-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${(count / totalItems) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-6 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-medium">Top Colors</p>
                          <span className="text-xs text-muted-foreground">{Object.keys(colorCounts).length} colors</span>
                        </div>
                        <div className="flex justify-between items-center">
                          {topColors.slice(0, 5).map(([color, count]) => (
                            <div key={color} className="text-center flex-1">
                              <div 
                                className="w-10 h-10 mx-auto rounded-full border-2 border-gray-200 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                style={{ 
                                  backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : 
                                                 color.toLowerCase() === 'navy' ? '#000080' :
                                                 color.toLowerCase() === 'grey' ? '#808080' :
                                                 color.toLowerCase()
                                }}
                                title={`${color}: ${count} items`}
                              ></div>
                              <span className="text-xs text-muted-foreground mt-1 block">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-wardrobe-teal">{Math.round((clothingItems.filter(item => item.isFavorite).length / totalItems) * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Favorites</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{Math.round((clothingItems.filter(item => item.timesWorn === 0).length / totalItems) * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Unworn</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Palette className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Your closet is empty</p>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/add-item");
                        }}
                        className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                      >
                        Add First Item
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          {showOnboarding && (
            <TooltipContent side="top" className="bg-wardrobe-teal text-white">
              <p>Visual breakdown of your wardrobe</p>
            </TooltipContent>
          )}
        </Tooltip>
        
        {/* AI Insights */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-wardrobe-teal" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-wardrobe-teal">
                    <p className="text-sm">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Add more items to get personalized insights!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Get Feedback Call-to-Action */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Get Community Feedback</h3>
                <p className="text-sm text-purple-700">
                  Share your outfits with the community and get valuable style feedback to improve your fashion game!
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/feedback")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit Outfit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button 
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
              onClick={() => navigate("/closet")}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">View Closet</span>
            </Button>
            <Button 
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
              onClick={() => navigate("/outfits")}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">Browse Outfits</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
              onClick={() => navigate("/add-item")}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add Item</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
              disabled={totalItems < 2}
              onClick={() => navigate("/outfits")}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm">Create Outfit</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-purple-100 hover:border-purple-300 border-2"
              onClick={() => navigate("/feedback")}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm">Get Feedback</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Recommendations */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">More Recommendations for {currentSeason}</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/outfits")}
            className="text-wardrobe-teal hover:text-wardrobe-teal/90"
          >
            See All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedOutfits.length > 1 ? (
            recommendedOutfits.slice(1, 4).map((outfit) => (
              <div 
                key={outfit.id}
                className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/outfits?selected=${outfit.id}`)}
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
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{outfit.name}</h3>
                  <p className="text-sm text-muted-foreground">{outfit.occasion}</p>
                  <p className="text-xs text-wardrobe-teal mt-1">
                    Perfect for {outfit.season.join(", ").toLowerCase()} weather
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="p-3 bg-wardrobe-teal/10 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-wardrobe-teal" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready for more recommendations?</h3>
                <p className="text-muted-foreground mb-4">
                  {totalItems < 5 
                    ? "Add more items to your wardrobe to get personalized outfit recommendations!"
                    : "Create your first outfit to unlock AI-powered styling suggestions."
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {totalItems < 5 && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/add-item")}
                      className="hover:bg-wardrobe-teal/10 hover:border-wardrobe-teal border-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Items
                    </Button>
                  )}
                  <Button 
                    onClick={() => navigate("/outfits")}
                    className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Outfit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <GamifiedTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </div>
  );
};

export default Dashboard;