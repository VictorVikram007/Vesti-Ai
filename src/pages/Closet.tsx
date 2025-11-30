import { useState, useEffect, useMemo } from "react";
import { useWardrobe } from "@/context/WardrobeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Search, Edit, Trash2, Sparkles, Plus, Filter, SortAsc, ChevronLeft, ChevronRight, Heart, Eye, BarChart3, Calendar, Users, Zap, CheckSquare, Star, TrendingUp, Clock, Palette, Brain, DollarSign, Target, Lightbulb, Shirt, ShoppingBag, Share2, Camera, Trophy, Smile, ExternalLink, ThumbsUp, ThumbsDown, Briefcase, UserCheck, MapPin, Cloud } from "lucide-react";
import { imageClothingItems, matchingOutfits } from '@/services/imageImportService';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { StylePersonalityQuiz } from "@/components/StylePersonalityQuiz";
import { EditItemForm } from "@/components/EditItemForm";
import { OutfitCalendar } from "@/components/OutfitCalendar";


const Closet = () => {
  const { clothingItems, removeClothingItem, updateClothingItem, addOutfit, getSimilarItems, generateAIOutfits, getWardrobeAnalytics, getWardrobeGaps, getCostPerWearAnalysis, getOutfitAnalytics, rateAIOutfit, stylePersonality, generatePackingList, resetToSampleData, importImageItems } = useWardrobe();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showItemDetails, setShowItemDetails] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<string>("");
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showAIOutfits, setShowAIOutfits] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [aiOutfits, setAiOutfits] = useState<Array<{ id: string; name: string; items: string[]; confidence: number; occasion: string; style: string; }>>([]);

  const [showResaleModal, setShowResaleModal] = useState<string | null>(null);
  const [showOOTDModal, setShowOOTDModal] = useState(false);
  const [userMood, setUserMood] = useState<string>("");
  const [selectedOOTDItems, setSelectedOOTDItems] = useState<string[]>([]);
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);
  const [showOutfitCalendar, setShowOutfitCalendar] = useState(false);
  const [showPackingList, setShowPackingList] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [weather, setWeather] = useState<{temp: number, condition: string, humidity: number} | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Weather fetch function
  const fetchWeather = async (location: string) => {
    try {
      const mockWeather = {
        temp: Math.floor(Math.random() * 15) + 20,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40
      };
      setWeather(mockWeather);
    } catch (error) {
      console.error('Weather fetch failed:', error);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchWeather(userLocation);
      const interval = setInterval(() => fetchWeather(userLocation), 300000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  // Simulate loading for demo
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, colorFilter, brandFilter, seasonFilter, sortBy]);

  // Get unique values for filters
  const categories = useMemo(() => Array.from(new Set(clothingItems.map(item => item.category))), [clothingItems]);
  const colors = useMemo(() => Array.from(new Set(clothingItems.map(item => item.color))), [clothingItems]);
  const brands = useMemo(() => Array.from(new Set(clothingItems.map(item => item.brand).filter(Boolean))), [clothingItems]);
  const seasons = useMemo(() => Array.from(new Set(clothingItems.flatMap(item => item.season))), [clothingItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = clothingItems;
    
    // Quick filters
    if (quickFilter) {
      switch (quickFilter) {
        case 'unworn':
          filtered = filtered.filter(item => item.timesWorn === 0);
          break;
        case 'favorites':
          filtered = filtered.filter(item => item.isFavorite);
          break;
        case 'recent':
          filtered = filtered.filter(item => {
            const daysSinceAdded = Math.floor((Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceAdded <= 7;
          });
          break;
        case 'underused':
          filtered = filtered.filter(item => (item.timesWorn || 0) < 3);
          break;
        case 'expensive':
          filtered = filtered.filter(item => {
            const costPerWear = (item.price || 100) / Math.max(item.timesWorn || 1, 1);
            return costPerWear > 100;
          });
          break;
        case 'public':
          filtered = filtered.filter(item => item.isPublic);
          break;
      }
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.category === activeTab);
    }

    if (colorFilter !== "all") {
      filtered = filtered.filter((item) => item.color === colorFilter);
    }

    if (brandFilter !== "all") {
      filtered = filtered.filter((item) => item.brand === brandFilter);
    }

    if (seasonFilter !== "all") {
      filtered = filtered.filter((item) => item.season.includes(seasonFilter));
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        case "color":
          return a.color.localeCompare(b.color);
        case "least-worn":
          return (a.timesWorn || 0) - (b.timesWorn || 0);
        case "most-worn":
          return (b.timesWorn || 0) - (a.timesWorn || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [clothingItems, activeTab, colorFilter, brandFilter, seasonFilter, sortBy, searchQuery, quickFilter]);

  // Data arrays and helper component definitions
  const quickFilters = [
    { id: 'unworn', label: 'Unworn Items', icon: <Zap className="h-4 w-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="h-4 w-4" /> },
    { id: 'recent', label: 'Recently Added', icon: <Clock className="h-4 w-4" /> },
    { id: 'underused', label: 'Needs Styling', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'public', label: 'Public Items', icon: <Users className="h-4 w-4" /> },
    { id: 'expensive', label: 'High Cost/Wear', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'trending', label: 'On Trend', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const shoppingSuggestions = [
    { category: 'Blazer', price: '₹2,500-₹8,000', retailers: ['Myntra', 'Ajio', 'Zara'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { category: 'Formal Shoes', price: '₹3,000-₹12,000', retailers: ['Amazon', 'Flipkart', 'Bata'], image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop' },
    { category: 'White Shirt', price: '₹800-₹3,500', retailers: ['H&M', 'Uniqlo', 'Van Heusen'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop' },
  ];

  const moodOptions = [
    { id: 'confident', label: 'Feeling Confident', icon: '💪' },
    { id: 'creative', label: 'Creative Mood', icon: '🎨' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'relaxed', label: 'Relaxed Vibe', icon: '😌' },
    { id: 'adventurous', label: 'Adventurous', icon: '🌟' },
  ];

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg overflow-hidden border shadow-sm">
      <Skeleton className="w-full h-40" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );

  const handleDelete = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeClothingItem(itemId);
    toast({ title: "Item removed", description: `${itemName} has been removed from your wardrobe.` });
  };

  const handleEdit = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(itemId);
  };

  const handleSaveEdit = (itemId: string, updatedData: Partial<ClothingItem>) => {
    updateClothingItem(itemId, updatedData);
    setEditingItem(null);
    toast({ title: "Item updated", description: "Your clothing item has been updated successfully." });
  };

  const handleStyleIt = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/outfits?item=${itemId}`);
  };

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = clothingItems.find(i => i.id === itemId);
    if (item) {
      updateClothingItem(itemId, { isFavorite: !item.isFavorite });
      toast({ 
        title: item.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${item.name} ${item.isFavorite ? 'removed from' : 'added to'} your favorites.`
      });
    }
  };

  const handleBulkAction = () => {
    if (selectedItems.length === 0 || !bulkAction) return;
    
    switch (bulkAction) {
      case 'delete':
        selectedItems.forEach(id => {
          const item = clothingItems.find(i => i.id === id);
          if (item) removeClothingItem(id);
        });
        toast({ title: "Items deleted", description: `${selectedItems.length} items removed from your wardrobe.` });
        break;
      case 'favorite':
        selectedItems.forEach(id => updateClothingItem(id, { isFavorite: true }));
        toast({ title: "Items favorited", description: `${selectedItems.length} items added to favorites.` });
        break;
      case 'public':
        selectedItems.forEach(id => updateClothingItem(id, { isPublic: true }));
        toast({ title: "Items made public", description: `${selectedItems.length} items are now public.` });
        break;
    }
    setSelectedItems([]);
    setBulkAction("");
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'overused': return 'text-red-600 bg-red-50';
      case 'balanced': return 'text-green-600 bg-green-50';
      case 'underused': return 'text-yellow-600 bg-yellow-50';
      case 'new': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'overused': return <TrendingUp className="h-3 w-3" />;
      case 'balanced': return <BarChart3 className="h-3 w-3" />;
      case 'underused': return <Clock className="h-3 w-3" />;
      case 'new': return <Star className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  const handleColorFilter = (color: string) => {
    setColorFilter(color);
    setActiveTab("all");
  };

  const clearFilters = () => {
    setColorFilter("all");
    setBrandFilter("all");
    setSeasonFilter("all");
    setActiveTab("all");
    setSearchQuery("");
    setQuickFilter("");
  };

  const hasActiveFilters = colorFilter !== "all" || brandFilter !== "all" || seasonFilter !== "all" || searchQuery || quickFilter;

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, colorFilter, brandFilter, seasonFilter, sortBy, quickFilter]);

  const handleGenerateAIOutfits = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const outfits = generateAIOutfits(itemId, 'Casual');
    setAiOutfits(outfits);
    setShowAIOutfits(itemId);
  };

  const analytics = getWardrobeAnalytics();
  const wardrobeGaps = getWardrobeGaps();
  const costAnalysis = getCostPerWearAnalysis();
  const outfitAnalytics = getOutfitAnalytics();

  const handleResaleItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResaleModal(itemId);
  };

  const handleCreateOOTD = () => {
    setShowOOTDModal(true);
  };

  // Empty state for new users
  if (clothingItems.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">My Closet</h1>
        </div>
        
        <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-wardrobe-teal/10 rounded-full w-fit mx-auto mb-6">
              <Plus className="h-12 w-12 text-wardrobe-teal" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Start Building Your Wardrobe</h2>
            <p className="text-muted-foreground mb-6">
              Add your first clothing item to begin organizing your wardrobe and getting AI-powered outfit recommendations.
            </p>
            <Button 
              onClick={() => navigate("/add-item")}
              className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Closet</h1>
          <p className="text-muted-foreground">{clothingItems.length} items in your wardrobe</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline"
            onClick={() => setShowLocationInput(true)}
            className={userLocation ? "bg-blue-50 border-blue-200" : ""}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {userLocation || "Set Location"}
          </Button>
          {weather && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border">
              <Cloud className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{weather.temp}°C</span>
              <span className="text-sm text-muted-foreground">{weather.condition}</span>
            </div>
          )}
          <Button 
            variant="outline"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowOutfitCalendar(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Plan Outfits
          </Button>
          <Button 
            variant="outline"
            onClick={handleCreateOOTD}
          >
            <Camera className="mr-2 h-4 w-4" />
            Share OOTD
          </Button>
          {!stylePersonality && (
            <Button 
              variant="outline"
              onClick={() => setShowStyleQuiz(true)}
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Style Quiz
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => {
              resetToSampleData();
              toast({ title: "Sample data loaded", description: "Your closet has been populated with sample items." });
            }}
          >
            Load Sample Data
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              importImageItems();
              toast({ 
                title: "Items & Outfits Added!", 
                description: `Added ${imageClothingItems.length} clothing items and ${matchingOutfits.length} matching outfits. Check the Outfits page!` 
              });
            }}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Shirt className="mr-2 h-4 w-4" />
            Import Image Items
          </Button>
          <Button 
            className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            onClick={() => navigate("/add-item")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your wardrobe..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={colorFilter} onValueChange={setColorFilter}>
              <SelectTrigger className="w-32">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase() }}
                      />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand!}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map(season => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="worn">Most Worn</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="health">Health Status</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Mood Selector */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Smile className="h-4 w-4" />
            What's your mood today?
          </h3>
          <div className="flex gap-2 overflow-x-auto">
            {moodOptions.map(mood => (
              <Button
                key={mood.id}
                variant={userMood === mood.id ? "default" : "outline"}
                size="sm"
                onClick={() => setUserMood(userMood === mood.id ? "" : mood.id)}
                className={userMood === mood.id ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <span className="mr-1">{mood.icon}</span>
                <span className="hidden sm:inline">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Quick Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickFilters.map(filter => (
            <Button
              key={filter.id}
              variant={quickFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(quickFilter === filter.id ? "" : filter.id)}
              className={quickFilter === filter.id ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
            >
              {filter.icon}
              <span className="ml-1 hidden sm:inline">{filter.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">{selectedItems.length} items selected</span>
            <div className="flex gap-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="favorite">Add to Favorites</SelectItem>
                  <SelectItem value="public">Make Public</SelectItem>
                  <SelectItem value="delete">Delete Items</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction} size="sm">
                Apply
              </Button>
              <Button variant="outline" onClick={() => setSelectedItems([])} size="sm">
                Clear
              </Button>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex overflow-x-auto pb-px">
            <TabsTrigger value="all">All ({clothingItems.length})</TabsTrigger>
            {categories.map(category => {
              const count = clothingItems.filter(item => item.category === category).length;
              return (
                <TabsTrigger key={category} value={category}>
                  {category} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="max-w-md mx-auto">
                  <div className="p-3 bg-gray-200 rounded-full w-fit mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No items match your criteria</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || hasActiveFilters
                      ? "Try adjusting your search terms or filters to find what you're looking for." 
                      : "Add items to your wardrobe to get started."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => navigate("/add-item")} className="bg-wardrobe-teal hover:bg-wardrobe-teal/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Item
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {paginatedItems.map((item) => (
                    <div 
                      key={item.id}
                      className="group relative bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => setShowItemDetails(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/80 border-white"
                        />
                      </div>
                      
                      {/* Favorite Heart */}
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        >
                          <Heart className={`h-4 w-4 ${item.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-40 object-cover"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                        
                        {/* Hover Actions */}
                        {hoveredItem === item.id && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => handleEdit(item.id, e)}
                              className="opacity-90 hover:opacity-100"
                              title="Edit item"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => handleGenerateAIOutfits(item.id, e)}
                              className="opacity-90 hover:opacity-100"
                              title="AI Style Suggestions"
                            >
                              <Brain className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowItemDetails(item.id);
                              }}
                              className="opacity-90 hover:opacity-100"
                              title="View details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => handleResaleItem(item.id, e)}
                              className="opacity-90 hover:opacity-100"
                              title="Sell this item"
                            >
                              <ShoppingBag className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => handleDelete(item.id, item.name, e)}
                              className="opacity-90 hover:opacity-100"
                              title="Delete item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Health Status Badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge className={`text-xs ${getHealthColor(item.healthStatus)}`}>
                            {getHealthIcon(item.healthStatus)}
                            <span className="ml-1 hidden sm:inline">{item.healthStatus}</span>
                          </Badge>
                        </div>
                        
                        {/* Public Badge */}
                        {item.isPublic && (
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="outline" className="text-xs bg-white/80">
                              <Users className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <span className="text-xs font-medium text-white">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-medium truncate flex-1">{item.name}</h3>
                          <button
                            className="w-4 h-4 rounded-full border border-gray-300 hover:scale-110 transition-transform ml-2" 
                            style={{ backgroundColor: item.color.toLowerCase() === 'beige' ? '#F5F5DC' : item.color.toLowerCase() }}
                            title={`Filter by ${item.color}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColorFilter(item.color);
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{item.brand}</span>
                          <div className="flex items-center gap-2">
                            <span>Worn {item.timesWorn}x</span>
                            {item.costPerWear && (
                              <span className="text-green-600">₹{item.costPerWear.toFixed(1)}/wear</span>
                            )}
                          </div>
                        </div>
                        
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {item.suggestedTags.slice(0, 1).map(tag => (
                              <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="px-2">...</span>
                            <Button
                              variant={currentPage === totalPages ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className={currentPage === totalPages ? "bg-wardrobe-teal hover:bg-wardrobe-teal/90" : ""}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Item Details Modal */}
      <Dialog open={!!showItemDetails} onOpenChange={() => setShowItemDetails(null)}>
        {showItemDetails && (() => {
          const item = clothingItems.find(i => i.id === showItemDetails);
          if (!item) return null;
          const similarItems = getSimilarItems(showItemDetails);
          const topPairings = item.topPairings.map(id => clothingItems.find(i => i.id === id)).filter(Boolean);
          return (
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {item.name}
                  {item.isFavorite && <Heart className="h-5 w-5 text-red-500 fill-current" />}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg" />
                  <div className="mt-4 space-y-2">
                    <Badge className={getHealthColor(item.healthStatus)}>
                      {getHealthIcon(item.healthStatus)}
                      {item.healthStatus}
                    </Badge>
                    {item.isPublic && <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Public</Badge>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Item Analytics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Times Worn:</span>
                        <span className="font-medium">{item.timesWorn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Worn:</span>
                        <span className="font-medium">
                          {item.lastWorn ? new Date(item.lastWorn).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Added:</span>
                        <span className="font-medium">{new Date(item.addedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {topPairings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Top Pairings</h4>
                      <div className="flex gap-2">
                        {topPairings.slice(0, 3).map(pairing => (
                          <div key={pairing.id} className="text-center">
                            <img src={pairing.image} alt={pairing.name} className="w-12 h-12 object-cover rounded" />
                            <p className="text-xs mt-1">{pairing.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Brand:</span> {item.brand}</p>
                      <p><span className="font-medium">Material:</span> {item.material}</p>
                      <p><span className="font-medium">Color:</span> {item.color}</p>
                      <p><span className="font-medium">Season:</span> {item.season.join(', ')}</p>
                      {item.careInstructions && (
                        <p><span className="font-medium">Care:</span> {item.careInstructions}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {[...item.tags, ...item.suggestedTags].map((tag, index) => (
                        <Badge key={index} variant={item.tags.includes(tag) ? "default" : "secondary"}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {similarItems.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Similar Items</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {similarItems.map(similar => (
                          <div key={similar.id} className="text-center cursor-pointer" onClick={() => setShowItemDetails(similar.id)}>
                            <img src={similar.image} alt={similar.name} className="w-full h-16 object-cover rounded" />
                            <p className="text-xs mt-1 truncate">{similar.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
      
      {/* AI Outfits Modal */}
      <Dialog open={!!showAIOutfits} onOpenChange={() => setShowAIOutfits(null)}>
        {showAIOutfits && (
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-wardrobe-teal" />
                AI Style Suggestions
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {aiOutfits.map((outfit, index) => (
                <div key={outfit.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{outfit.name}</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {outfit.items.map((itemId: string) => {
                      const outfitItem = clothingItems.find(i => i.id === itemId);
                      if (!outfitItem) return null;
                      return (
                        <div key={itemId} className="text-center">
                          <img 
                            src={outfitItem.image} 
                            alt={outfitItem.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                          <p className="text-xs font-medium">{outfitItem.name}</p>
                          <p className="text-xs text-muted-foreground">{outfitItem.category}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      <Badge variant="outline">{outfit.occasion}</Badge>
                      <Badge variant="outline">{outfit.season.join(', ')}</Badge>
                    </div>
                    <Button size="sm" onClick={() => {
                      addOutfit({
                        name: outfit.name,
                        items: outfit.items,
                        season: outfit.season,
                        occasion: outfit.occasion,
                        favorite: false
                      });
                      toast({ title: "Outfit saved", description: `${outfit.name} added to your outfits.` });
                    }}>
                      <Heart className="h-3 w-3 mr-1" />
                      Save Outfit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Analytics Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-wardrobe-teal" />
              Wardrobe Analytics
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overview Stats */}
            <div className="space-y-4">
              <h4 className="font-medium">Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalItems}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{analytics.totalValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Cost/Wear</p>
                  <p className="text-2xl font-bold text-purple-600">₹{analytics.averageCostPerWear.toFixed(1)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Most Worn</p>
                  <p className="text-lg font-bold text-orange-600">{analytics.mostWornCategory}</p>
                </div>
              </div>
            </div>
            
            {/* Trend Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium">Style Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">On Trend</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.trendAnalysis.onTrend / analytics.totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{analytics.trendAnalysis.onTrend}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Classic</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.trendAnalysis.classic / analytics.totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{analytics.trendAnalysis.classic}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Outdated</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.trendAnalysis.outdated / analytics.totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{analytics.trendAnalysis.outdated}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Favorite Colors & Brands */}
            <div className="space-y-4">
              <h4 className="font-medium">Preferences</h4>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Favorite Colors</p>
                <div className="flex gap-2">
                  {analytics.favoriteColors.map(color => (
                    <Badge key={color} variant="outline">{color}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Favorite Brands</p>
                <div className="flex gap-2">
                  {analytics.favoriteBrands.map(brand => (
                    <Badge key={brand} variant="outline">{brand}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Wardrobe Gaps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Wardrobe Gaps
                </h4>
                <Button size="sm" variant="outline" onClick={() => window.open('https://myntra.com', '_blank')}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Shop
                </Button>
              </div>
              <div className="space-y-2">
                {wardrobeGaps.map((gap, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cost Analysis */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Per Wear Analysis
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {costAnalysis.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{item.costPerWear?.toFixed(2)}/wear</p>
                      <p className="text-xs text-muted-foreground">{item.timesWorn} wears</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      

      {/* Resale Modal */}
      <Dialog open={!!showResaleModal} onOpenChange={() => setShowResaleModal(null)}>
        {showResaleModal && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                Sell This Item
              </DialogTitle>
            </DialogHeader>
            
            {(() => {
              const item = clothingItems.find(i => i.id === showResaleModal);
              if (!item) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.brand} • {item.color}</p>
                      <p className="text-sm text-muted-foreground">Worn {item.timesWorn} times</p>
                      <p className="text-sm font-medium text-green-600">Suggested Price: ₹{Math.round((item.price || 1000) * 0.6)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Choose Platform:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        List on OLX
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        List on Meesho
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share on Instagram
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Post on Facebook
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        )}
      </Dialog>
      
      {/* OOTD Modal */}
      <Dialog open={showOOTDModal} onOpenChange={setShowOOTDModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-wardrobe-teal" />
              Share Your Outfit of the Day
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Select items for your OOTD:</h4>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {clothingItems.slice(0, 12).map(item => (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer border-2 rounded p-1 ${selectedOOTDItems.includes(item.id) ? 'border-wardrobe-teal' : 'border-gray-200'}`}
                    onClick={() => {
                      if (selectedOOTDItems.includes(item.id)) {
                        setSelectedOOTDItems(selectedOOTDItems.filter(id => id !== item.id));
                      } else {
                        setSelectedOOTDItems([...selectedOOTDItems, item.id]);
                      }
                    }}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-16 object-cover rounded" />
                    <p className="text-xs text-center mt-1 truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedOOTDItems.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium">Share your look:</h5>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share to Community
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share to Instagram
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Selected {selectedOOTDItems.length} items • Join the style challenge!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Advanced Outfit Analytics Modal */}
      <Dialog open={showAdvancedAnalytics} onOpenChange={setShowAdvancedAnalytics}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-wardrobe-teal" />
              Advanced Outfit Analytics
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Outfit Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Outfits</p>
                  <p className="text-2xl font-bold text-blue-600">{outfitAnalytics.totalOutfits}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Outfit CPW</p>
                  <p className="text-2xl font-bold text-green-600">₹{Math.max(outfitAnalytics.averageOutfitCPW, 50).toFixed(0)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Outfit Freshness</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fresh (&lt; 7 days)</span>
                  <span className="text-sm font-medium text-green-600">{outfitAnalytics.freshnessScores.fresh}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stale (7-30 days)</span>
                  <span className="text-sm font-medium text-yellow-600">{outfitAnalytics.freshnessScores.stale}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overdue (&gt; 30 days)</span>
                  <span className="text-sm font-medium text-red-600">{outfitAnalytics.freshnessScores.overdue}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Packing List Modal */}
      <Dialog open={showPackingList} onOpenChange={setShowPackingList}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-wardrobe-teal" />
              Smart Packing List
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button className="w-full" onClick={() => {
              const packingList = generatePackingList(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "Mumbai");
              toast({ title: "Packing list generated!", description: `${packingList.length} items suggested for your trip.` });
            }}>
              Generate Packing List
            </Button>
            
            <div className="border-t pt-4">
              <h5 className="font-medium mb-3">Suggested Items:</h5>
              <div className="grid grid-cols-2 gap-2">
                {generatePackingList(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "Mumbai").slice(0, 8).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        {editingItem && (() => {
          const item = clothingItems.find(i => i.id === editingItem);
          if (!item) return null;
          return (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit {item.name}</DialogTitle>
              </DialogHeader>
              <EditItemForm item={item} onSave={handleSaveEdit} onCancel={() => setEditingItem(null)} />
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* Location Input Modal */}
      <Dialog open={showLocationInput} onOpenChange={setShowLocationInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-wardrobe-teal" />
              Set Your Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Enter your city:</label>
              <Input 
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (userLocation) {
                    fetchWeather(userLocation);
                    setShowLocationInput(false);
                    toast({ title: "Location set!", description: `Weather updates for ${userLocation} will be shown.` });
                  }
                }}
                disabled={!userLocation}
                className="flex-1"
              >
                Save Location
              </Button>
              <Button variant="outline" onClick={() => setShowLocationInput(false)}>
                Cancel
              </Button>
            </div>
            
            {weather && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Weather in {userLocation}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span>Temperature: {weather.temp}°C</span>
                  <span>Condition: {weather.condition}</span>
                  <span>Humidity: {weather.humidity}%</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Style Personality Quiz */}
      <StylePersonalityQuiz open={showStyleQuiz} onOpenChange={setShowStyleQuiz} />
      
      {/* Outfit Calendar */}
      <OutfitCalendar open={showOutfitCalendar} onOpenChange={setShowOutfitCalendar} />
    </div>
  );
};

export default Closet;