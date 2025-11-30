import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Filter, TrendingUp, UserPlus, BarChart3, Sparkles, CheckCircle } from "lucide-react";
import { useWardrobe } from "@/context/WardrobeContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

const Trends = () => {
  const { clothingItems, outfits, addOutfit } = useWardrobe();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [selectedPersonalTrend, setSelectedPersonalTrend] = useState("");
  const [showComments, setShowComments] = useState<number | null>(null);

  const getTrendingColors = () => {
    const baseColors = {
      "Today": [
        { name: "Electric Blue", color: "#007BFF", score: 98, trend: [90, 93, 96, 98] },
        { name: "Neon Green", color: "#39FF14", score: 92, trend: [85, 88, 90, 92] },
        { name: "Hot Pink", color: "#FF1493", score: 87, trend: [80, 83, 85, 87] },
        { name: "Bright Orange", color: "#FF8C00", score: 81, trend: [75, 77, 79, 81] }
      ],
      "This Week": [
        { name: "Sage Green", color: "#9CAF88", score: 95, trend: [85, 88, 92, 95] },
        { name: "Warm Beige", color: "#D4B896", score: 88, trend: [82, 85, 87, 88] },
        { name: "Deep Navy", color: "#1B2951", score: 82, trend: [75, 78, 80, 82] },
        { name: "Coral Pink", color: "#FF6B6B", score: 76, trend: [70, 72, 74, 76] }
      ],
      "This Month": [
        { name: "Burgundy", color: "#800020", score: 94, trend: [88, 90, 92, 94] },
        { name: "Forest Green", color: "#228B22", score: 89, trend: [83, 85, 87, 89] },
        { name: "Mustard Yellow", color: "#FFDB58", score: 84, trend: [78, 80, 82, 84] },
        { name: "Plum Purple", color: "#8E4585", score: 79, trend: [73, 75, 77, 79] }
      ],
      "This Season": [
        { name: "Camel Brown", color: "#C19A6B", score: 96, trend: [89, 91, 94, 96] },
        { name: "Olive Green", color: "#808000", score: 91, trend: [84, 87, 89, 91] },
        { name: "Rust Orange", color: "#B7410E", score: 86, trend: [79, 82, 84, 86] },
        { name: "Charcoal Gray", color: "#36454F", score: 82, trend: [76, 78, 80, 82] }
      ]
    };
    
    let colors = baseColors[timeFilter] || baseColors["This Week"];
    
    // Boost scores for user's liked colors
    if (settings.wardrobe.likedColors.length > 0) {
      colors = colors.map(color => {
        const isLiked = settings.wardrobe.likedColors.some(liked => 
          color.name.toLowerCase().includes(liked.toLowerCase()) || 
          liked.toLowerCase().includes(color.name.toLowerCase())
        );
        return isLiked ? { ...color, score: Math.min(100, color.score + 15) } : color;
      });
    }
    
    // Reduce scores for disliked colors
    if (settings.wardrobe.dislikedColors.length > 0) {
      colors = colors.map(color => {
        const isDisliked = settings.wardrobe.dislikedColors.some(disliked => 
          color.name.toLowerCase().includes(disliked.toLowerCase()) || 
          disliked.toLowerCase().includes(color.name.toLowerCase())
        );
        return isDisliked ? { ...color, score: Math.max(0, color.score - 20) } : color;
      });
    }
    
    return colors.sort((a, b) => b.score - a.score);
  };
  
  const trendingColors = getTrendingColors();

  const getPopularStyles = () => {
    const baseStyles = {
      "Today": [
        { name: "Gen-Z Core", score: 96, trend: "+28%", trendData: [75, 82, 89, 96] },
        { name: "Tech Wear", score: 91, trend: "+22%", trendData: [72, 78, 85, 91] },
        { name: "Cyber Punk", score: 85, trend: "+35%", trendData: [63, 70, 78, 85] },
        { name: "Neo Grunge", score: 79, trend: "+18%", trendData: [67, 71, 75, 79] }
      ],
      "This Week": [
        { name: "Streetwear", score: 92, trend: "+15%", trendData: [80, 85, 88, 92] },
        { name: "Minimalist", score: 87, trend: "+8%", trendData: [82, 84, 86, 87] },
        { name: "Boho Chic", score: 79, trend: "+12%", trendData: [70, 74, 77, 79] },
        { name: "Y2K Revival", score: 74, trend: "+25%", trendData: [60, 65, 70, 74] }
      ],
      "This Month": [
        { name: "Dark Academia", score: 94, trend: "+20%", trendData: [78, 83, 88, 94] },
        { name: "Cottagecore", score: 88, trend: "+16%", trendData: [74, 79, 83, 88] },
        { name: "Urban Chic", score: 82, trend: "+11%", trendData: [73, 76, 79, 82] },
        { name: "Vintage Glam", score: 77, trend: "+24%", trendData: [62, 67, 72, 77] }
      ],
      "This Season": [
        { name: "Cozy Luxe", score: 97, trend: "+19%", trendData: [81, 86, 92, 97] },
        { name: "Earthy Tones", score: 93, trend: "+14%", trendData: [81, 85, 89, 93] },
        { name: "Layered Look", score: 87, trend: "+17%", trendData: [74, 78, 82, 87] },
        { name: "Monochrome", score: 81, trend: "+9%", trendData: [74, 76, 78, 81] }
      ]
    };
    
    let styles = baseStyles[timeFilter] || baseStyles["This Week"];
    
    // Boost user's preferred style profile
    if (settings.wardrobe.styleProfile) {
      styles = styles.map(style => {
        const isPreferred = style.name.toLowerCase().includes(settings.wardrobe.styleProfile.toLowerCase()) ||
                           settings.wardrobe.styleProfile.toLowerCase().includes(style.name.toLowerCase());
        return isPreferred ? { ...style, score: Math.min(100, style.score + 20) } : style;
      });
    }
    
    // Adjust based on sustainability preference
    if (settings.wardrobe.sustainabilityPreference) {
      styles = styles.map(style => {
        const isSustainable = ['minimalist', 'earthy', 'cottagecore', 'vintage'].some(keyword => 
          style.name.toLowerCase().includes(keyword)
        );
        return isSustainable ? { ...style, score: Math.min(100, style.score + 10) } : style;
      });
    }
    
    return styles.sort((a, b) => b.score - a.score);
  };
  
  const popularStyles = getPopularStyles();

  const getRisingItems = () => {
    const baseItems = {
      "Today": [
        { name: "LED Accessories", score: 94, trend: "+45%", trendData: [65, 72, 83, 94] },
        { name: "Holographic Bags", score: 89, trend: "+38%", trendData: [64, 71, 80, 89] },
        { name: "Platform Boots", score: 84, trend: "+29%", trendData: [65, 71, 77, 84] },
        { name: "Mesh Tops", score: 78, trend: "+42%", trendData: [55, 62, 70, 78] }
      ],
      "This Week": [
        { name: "Oversized Blazers", score: 89, trend: "+18%", trendData: [75, 80, 85, 89] },
        { name: "Wide-leg Jeans", score: 85, trend: "+22%", trendData: [70, 75, 80, 85] },
        { name: "Chunky Sneakers", score: 81, trend: "+14%", trendData: [72, 75, 78, 81] },
        { name: "Bucket Hats", score: 73, trend: "+35%", trendData: [55, 60, 67, 73] }
      ],
      "This Month": [
        { name: "Corset Tops", score: 91, trend: "+26%", trendData: [72, 78, 84, 91] },
        { name: "Cargo Pants", score: 86, trend: "+31%", trendData: [65, 72, 79, 86] },
        { name: "Statement Earrings", score: 82, trend: "+19%", trendData: [69, 73, 77, 82] },
        { name: "Midi Skirts", score: 76, trend: "+23%", trendData: [62, 66, 71, 76] }
      ],
      "This Season": [
        { name: "Puffer Jackets", score: 96, trend: "+21%", trendData: [79, 84, 90, 96] },
        { name: "Knee-high Boots", score: 92, trend: "+17%", trendData: [78, 83, 87, 92] },
        { name: "Wool Coats", score: 87, trend: "+13%", trendData: [76, 80, 83, 87] },
        { name: "Cashmere Scarves", score: 83, trend: "+25%", trendData: [66, 72, 77, 83] }
      ]
    };
    
    let items = baseItems[timeFilter] || baseItems["This Week"];
    
    // Boost items based on user's preferred fit
    if (settings.wardrobe.preferredFit) {
      items = items.map(item => {
        const fitMatch = {
          'Oversized': ['oversized', 'wide-leg', 'chunky'],
          'Fitted': ['corset', 'midi'],
          'Regular': ['blazers', 'coats'],
          'Loose': ['wide-leg', 'oversized'],
          'Tight': ['corset']
        };
        
        const keywords = fitMatch[settings.wardrobe.preferredFit] || [];
        const isPreferred = keywords.some(keyword => 
          item.name.toLowerCase().includes(keyword)
        );
        
        return isPreferred ? { ...item, score: Math.min(100, item.score + 15) } : item;
      });
    }
    
    // Adjust based on budget range
    if (settings.wardrobe.budgetRange === 'Low') {
      items = items.map(item => {
        const budgetFriendly = ['bucket hats', 'chunky sneakers', 'midi skirts'].some(affordable => 
          item.name.toLowerCase().includes(affordable.toLowerCase())
        );
        return budgetFriendly ? { ...item, score: Math.min(100, item.score + 10) } : item;
      });
    } else if (settings.wardrobe.budgetRange === 'Luxury') {
      items = items.map(item => {
        const luxury = ['cashmere', 'wool coats', 'statement earrings'].some(luxe => 
          item.name.toLowerCase().includes(luxe.toLowerCase())
        );
        return luxury ? { ...item, score: Math.min(100, item.score + 10) } : item;
      });
    }
    
    return items.sort((a, b) => b.score - a.score);
  };
  
  const risingItems = getRisingItems();

  const allOutfits = {
    "Today": [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop",
        style: "Streetwear",
        occasion: "Casual",
        tags: ["Oversized", "Urban", "Comfortable"],
        colors: ["Deep Navy", "Sage Green"],
        items: ["Oversized Blazers"],
        likes: 234,
        saves: 89,
        shopLinks: [
          { item: "Oversized Hoodie", price: "₹3,699", store: "Urban Outfitters" },
          { item: "Cargo Pants", price: "₹5,349", store: "ASOS" }
        ]
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop",
        style: "Minimalist",
        occasion: "Work",
        tags: ["Clean", "Professional", "Neutral"],
        colors: ["Warm Beige", "Deep Navy"],
        items: ["Wide-leg Jeans"],
        likes: 189,
        saves: 156,
        shopLinks: [
          { item: "Blazer", price: "₹7,329", store: "Zara" },
          { item: "Trousers", price: "₹4,529", store: "COS" }
        ]
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop",
        style: "Casual Chic",
        occasion: "Casual",
        tags: ["Comfortable", "Stylish", "Everyday"],
        colors: ["Sage Green"],
        items: ["Chunky Sneakers"],
        likes: 145,
        saves: 67,
        shopLinks: [
          { item: "Sweater", price: "₹2,879", store: "Uniqlo" },
          { item: "Jeans", price: "₹3,699", store: "Levi's" }
        ]
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop",
        style: "Y2K Revival",
        occasion: "Party",
        tags: ["Bold", "Colorful", "Retro"],
        colors: ["Coral Pink"],
        items: ["Chunky Sneakers"],
        likes: 298,
        saves: 134,
        shopLinks: [
          { item: "Crop Top", price: "₹2,059", store: "H&M" },
          { item: "Mini Skirt", price: "₹3,289", store: "Urban Outfitters" }
        ]
      }
    ],
    "This Week": [
      {
        id: 5,
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop",
        style: "Boho Chic",
        occasion: "Weekend",
        tags: ["Flowy", "Earthy", "Relaxed"],
        colors: ["Sage Green", "Warm Beige"],
        items: ["Bucket Hats"],
        likes: 167,
        saves: 98,
        shopLinks: [
          { item: "Maxi Dress", price: "$75", store: "Free People" },
          { item: "Sandals", price: "$35", store: "Madewell" }
        ]
      },
      {
        id: 6,
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop",
        style: "Elegant",
        occasion: "Work",
        tags: ["Sophisticated", "Classic", "Timeless"],
        colors: ["Deep Navy", "Warm Beige"],
        items: ["Wide-leg Jeans"],
        likes: 203,
        saves: 178,
        shopLinks: [
          { item: "Silk Blouse", price: "$95", store: "Everlane" },
          { item: "Midi Skirt", price: "$68", store: "& Other Stories" }
        ]
      },
      {
        id: 7,
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop",
        style: "Athleisure",
        occasion: "Casual",
        tags: ["Sporty", "Comfortable", "Active"],
        colors: ["Sage Green"],
        items: ["Chunky Sneakers"],
        likes: 156,
        saves: 89,
        shopLinks: [
          { item: "Sports Bra", price: "$28", store: "Lululemon" },
          { item: "Leggings", price: "$58", store: "Alo Yoga" }
        ]
      },
      {
        id: 8,
        image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop",
        style: "Vintage",
        occasion: "Weekend",
        tags: ["Retro", "Unique", "Statement"],
        colors: ["Coral Pink", "Warm Beige"],
        items: ["Bucket Hats"],
        likes: 189,
        saves: 123,
        shopLinks: [
          { item: "Vintage Jacket", price: "$85", store: "Depop" },
          { item: "High-waist Jeans", price: "$72", store: "Reformation" }
        ]
      }
    ],
    "This Month": [
      {
        id: 9,
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop",
        style: "Preppy",
        occasion: "Work",
        tags: ["Classic", "Polished", "Academic"],
        colors: ["Deep Navy", "Warm Beige"],
        items: ["Oversized Blazers"],
        likes: 234,
        saves: 167,
        shopLinks: [
          { item: "Cardigan", price: "$78", store: "J.Crew" },
          { item: "Pleated Skirt", price: "$65", store: "Banana Republic" }
        ]
      },
      {
        id: 10,
        image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop",
        style: "Edgy",
        occasion: "Party",
        tags: ["Bold", "Dark", "Alternative"],
        colors: ["Deep Navy"],
        items: ["Chunky Sneakers"],
        likes: 278,
        saves: 145,
        shopLinks: [
          { item: "Leather Jacket", price: "$120", store: "AllSaints" },
          { item: "Ripped Jeans", price: "$89", store: "Diesel" }
        ]
      },
      {
        id: 11,
        image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=300&h=400&fit=crop",
        style: "Romantic",
        occasion: "Weekend",
        tags: ["Feminine", "Soft", "Dreamy"],
        colors: ["Coral Pink", "Sage Green"],
        items: ["Bucket Hats"],
        likes: 198,
        saves: 134,
        shopLinks: [
          { item: "Floral Dress", price: "$68", store: "Anthropologie" },
          { item: "Ballet Flats", price: "$45", store: "Repetto" }
        ]
      },
      {
        id: 12,
        image: "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=300&h=400&fit=crop",
        style: "Smart Casual",
        occasion: "Work",
        tags: ["Versatile", "Modern", "Chic"],
        colors: ["Warm Beige", "Deep Navy"],
        items: ["Wide-leg Jeans"],
        likes: 167,
        saves: 98,
        shopLinks: [
          { item: "Knit Top", price: "$52", store: "COS" },
          { item: "Tailored Pants", price: "$78", store: "Massimo Dutti" }
        ]
      }
    ],
    "This Season": [
      {
        id: 13,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop",
        style: "Cozy Chic",
        occasion: "Casual",
        tags: ["Warm", "Layered", "Comfortable"],
        colors: ["Sage Green", "Warm Beige"],
        items: ["Oversized Blazers"],
        likes: 245,
        saves: 189,
        shopLinks: [
          { item: "Wool Sweater", price: "$95", store: "Acne Studios" },
          { item: "Wool Coat", price: "$180", store: "Ganni" }
        ]
      },
      {
        id: 14,
        image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=300&h=400&fit=crop",
        style: "Monochrome",
        occasion: "Work",
        tags: ["Sleek", "Minimal", "Sophisticated"],
        colors: ["Deep Navy"],
        items: ["Wide-leg Jeans"],
        likes: 189,
        saves: 156,
        shopLinks: [
          { item: "Turtleneck", price: "$48", store: "Uniqlo" },
          { item: "Wide Pants", price: "$85", store: "Arket" }
        ]
      },
      {
        id: 15,
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop",
        style: "Layered Look",
        occasion: "Weekend",
        tags: ["Textured", "Creative", "Artistic"],
        colors: ["Coral Pink", "Sage Green"],
        items: ["Bucket Hats"],
        likes: 167,
        saves: 123,
        shopLinks: [
          { item: "Cardigan", price: "$72", store: "& Other Stories" },
          { item: "Midi Dress", price: "$89", store: "Zara" }
        ]
      },
      {
        id: 16,
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop",
        style: "Urban Minimalist",
        occasion: "Casual",
        tags: ["Clean", "Modern", "Effortless"],
        colors: ["Warm Beige", "Deep Navy"],
        items: ["Chunky Sneakers"],
        likes: 234,
        saves: 178,
        shopLinks: [
          { item: "Oversized Shirt", price: "$58", store: "COS" },
          { item: "Straight Jeans", price: "$68", store: "Weekday" }
        ]
      }
    ]
  };

  const trendingOutfits = allOutfits[timeFilter] || allOutfits["This Week"];

  const getTopContributors = () => {
    const contributorsByPeriod = {
      "Today": [
        { name: "TechStyleGuru", outfits: 12, followers: "25.8K", isFollowing: false },
        { name: "DigitalFashion", outfits: 9, followers: "18.2K", isFollowing: true },
        { name: "CyberChic", outfits: 7, followers: "22.1K", isFollowing: false }
      ],
      "This Week": [
        { name: "StyleMaven", outfits: 45, followers: "12.3K", isFollowing: false },
        { name: "FashionForward", outfits: 38, followers: "8.7K", isFollowing: true },
        { name: "TrendSetter", outfits: 32, followers: "15.1K", isFollowing: false }
      ],
      "This Month": [
        { name: "VintageVibes", outfits: 156, followers: "45.7K", isFollowing: false },
        { name: "ModernMuse", outfits: 134, followers: "38.9K", isFollowing: true },
        { name: "ChicInfluencer", outfits: 128, followers: "52.3K", isFollowing: false }
      ],
      "This Season": [
        { name: "WinterWardrobe", outfits: 289, followers: "78.4K", isFollowing: false },
        { name: "CozyChic", outfits: 267, followers: "65.1K", isFollowing: true },
        { name: "LayeredLooks", outfits: 245, followers: "71.8K", isFollowing: false }
      ]
    };
    return contributorsByPeriod[timeFilter] || contributorsByPeriod["This Week"];
  };
  
  const topContributors = getTopContributors();

  // Generate personalized trends based on user's closet
  const personalizedTrends = useMemo(() => {
    if (clothingItems.length === 0) {
      return [
        { 
          name: "Build Your Wardrobe", 
          match: 100, 
          reason: "Start adding items to get personalized trends",
          yourItems: [],
          suggestedOutfits: ["Add your first items to see suggestions"]
        }
      ];
    }

    const userColors = [...new Set(clothingItems.map(item => item.color))];
    const userCategories = [...new Set(clothingItems.map(item => item.category))];
    const userBrands = [...new Set(clothingItems.map(item => item.brand).filter(Boolean))];
    const favoriteItems = clothingItems.filter(item => item.isFavorite);
    
    const trends = [];
    
    // Color-based trend
    if (userColors.length > 0) {
      const topColor = userColors[0];
      const colorItems = clothingItems.filter(item => item.color === topColor);
      trends.push({
        name: `${topColor} Palette Trend`,
        match: Math.min(95, 70 + colorItems.length * 5),
        reason: `You have ${colorItems.length} ${topColor.toLowerCase()} items`,
        yourItems: colorItems.slice(0, 3).map(item => item.name),
        suggestedOutfits: [`Monochrome ${topColor}`, `${topColor} Accent Look`]
      });
    }
    
    // Category-based trend
    if (userCategories.includes('Tops') && userCategories.includes('Bottoms')) {
      const workItems = clothingItems.filter(item => 
        item.tags.some(tag => ['formal', 'business', 'professional'].includes(tag.toLowerCase()))
      );
      if (workItems.length > 0) {
        trends.push({
          name: "Professional Style",
          match: Math.min(90, 60 + workItems.length * 8),
          reason: `Based on your ${workItems.length} professional pieces`,
          yourItems: workItems.slice(0, 3).map(item => item.name),
          suggestedOutfits: ["Business Meeting", "Smart Casual Friday"]
        });
      }
    }
    
    // Favorite items trend
    if (favoriteItems.length > 0) {
      trends.push({
        name: "Your Signature Style",
        match: Math.min(88, 75 + favoriteItems.length * 3),
        reason: `Based on your ${favoriteItems.length} favorite items`,
        yourItems: favoriteItems.slice(0, 3).map(item => item.name),
        suggestedOutfits: ["Signature Look", "Confidence Boost Outfit"]
      });
    }
    
    return trends.slice(0, 3);
  }, [clothingItems]);

  const outfitComments = {
    1: [
      { user: "StyleLover", comment: "Love this combo! 🔥", reactions: 12 },
      { user: "Fashionista", comment: "Where can I get that hoodie?", reactions: 8 }
    ],
    2: [
      { user: "WorkWear", comment: "Perfect for office!", reactions: 15 },
      { user: "MinimalStyle", comment: "So clean and elegant", reactions: 6 }
    ]
  };

  const MiniChart = ({ data }: { data: number[] }) => (
    <div className="flex items-end gap-0.5 h-4 w-8">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-wardrobe-teal rounded-sm flex-1"
          style={{ height: `${(value / Math.max(...data)) * 100}%` }}
        />
      ))}
    </div>
  );

  const getCategorySpecificOutfits = () => {
    // Combine all outfits from different time periods and add category-specific ones
    const allCombinedOutfits = [
      ...Object.values(allOutfits).flat(),
      // Additional category-specific outfits
      {
        id: 101,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop",
        style: "Streetwear",
        occasion: "Casual",
        tags: ["Comfortable", "Relaxed", "Everyday"],
        colors: ["Sage Green", "Deep Navy"],
        items: ["Oversized Hoodie", "Joggers", "Sneakers"],
        likes: 234,
        saves: 89,
        shopLinks: [
          { item: "Oversized Hoodie", price: "₹2,999", store: "H&M" },
          { item: "Joggers", price: "₹1,899", store: "Zara" }
        ]
      },
      {
        id: 201,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop",
        style: "Professional",
        occasion: "Work",
        tags: ["Formal", "Sophisticated", "Classic"],
        colors: ["Deep Navy", "Warm Beige"],
        items: ["Blazer", "Trousers", "Pumps"],
        likes: 298,
        saves: 234,
        shopLinks: [
          { item: "Blazer", price: "₹5,999", store: "Zara" },
          { item: "Trousers", price: "₹3,499", store: "Mango" }
        ]
      },
      {
        id: 301,
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop",
        style: "Glamorous",
        occasion: "Party",
        tags: ["Bold", "Sparkly", "Statement"],
        colors: ["Deep Navy", "Coral Pink"],
        items: ["Sequin Dress", "Strappy Heels", "Clutch"],
        likes: 456,
        saves: 298,
        shopLinks: [
          { item: "Sequin Dress", price: "₹7,999", store: "ASOS" },
          { item: "Strappy Heels", price: "₹4,299", store: "Steve Madden" }
        ]
      },
      {
        id: 401,
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop",
        style: "Boho Weekend",
        occasion: "Weekend",
        tags: ["Relaxed", "Flowy", "Comfortable"],
        colors: ["Sage Green", "Warm Beige"],
        items: ["Maxi Dress", "Kimono", "Flat Sandals"],
        likes: 223,
        saves: 178,
        shopLinks: [
          { item: "Maxi Dress", price: "₹3,999", store: "Free People" },
          { item: "Kimono", price: "₹2,499", store: "Anthropologie" }
        ]
      }
    ];
    
    // Remove duplicates based on ID and ensure unique content
    const uniqueOutfits = allCombinedOutfits.reduce((acc, current) => {
      const exists = acc.find(outfit => 
        outfit.id === current.id || 
        (outfit.style === current.style && outfit.occasion === current.occasion && outfit.image === current.image)
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof allCombinedOutfits);
    
    // Filter by category
    let filteredByCategory = uniqueOutfits;
    if (categoryFilter !== "All") {
      filteredByCategory = uniqueOutfits.filter(outfit => 
        outfit.occasion === categoryFilter
      );
    }
    
    // Apply additional filters
    return filteredByCategory.filter(outfit => {
      if (colorFilter && !outfit.colors.some(color => color.includes(colorFilter))) return false;
      if (styleFilter && !outfit.style.includes(styleFilter)) return false;
      if (itemFilter && !outfit.items.some(item => item.includes(itemFilter))) return false;
      return true;
    });
  };
  
  const filteredOutfits = getCategorySpecificOutfits();

  const handleFollow = (contributorName: string) => {
    // Handle follow logic here
    console.log(`Following ${contributorName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wardrobe-navy flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Trending Now
            <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
              Live AI
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized trends based on your style preferences • Updated in real-time
          </p>
        </div>
        <Button 
          className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
          onClick={() => {
            // Create a personalized outfit based on trending items
            const trendingOutfit = {
              name: `Trending ${timeFilter} Look`,
              items: clothingItems.filter(item => 
                trendingColors.some(color => color.name.toLowerCase().includes(item.color.toLowerCase())) ||
                risingItems.some(trending => {
                  const trendKeywords = trending.name.toLowerCase().split(' ');
                  return trendKeywords.some(keyword => 
                    item.name.toLowerCase().includes(keyword) ||
                    item.category.toLowerCase().includes(keyword)
                  );
                })
              ).slice(0, 4).map(item => item.id),
              season: ['All Seasons'],
              occasion: 'Casual',
              favorite: false
            };
            
            if (trendingOutfit.items.length > 0) {
              addOutfit(trendingOutfit);
              toast({
                title: "Trending Outfit Created! 🔥",
                description: `Created "${trendingOutfit.name}" with ${trendingOutfit.items.length} trending items from your closet.`
              });
            } else {
              toast({
                title: "Add Trending Items First",
                description: "Add some trending colors or items to your closet to create personalized trend outfits!",
                variant: "destructive"
              });
            }
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Style Your Trend
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-2">
          {["Today", "This Week", "This Month", "This Season"].map((period) => (
            <Button
              key={period}
              variant={timeFilter === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(period)}
            >
              {period}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 ml-4">
          {["All", "Casual", "Work", "Party", "Weekend"].map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Your Closet Analysis */}
      {clothingItems.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-wardrobe-teal" />
              Your Closet vs Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{clothingItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{[...new Set(clothingItems.map(item => item.color))].length}</p>
                <p className="text-sm text-muted-foreground">Colors</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{clothingItems.filter(item => item.isFavorite).length}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{Math.round((clothingItems.filter(item => item.timesWorn === 0).length / clothingItems.length) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Unworn</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Your Top Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(clothingItems.map(item => item.color))].slice(0, 5).map(color => (
                    <div key={color} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase() }}
                      />
                      <span className="text-sm">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Trending Items You Own</h4>
                <div className="space-y-1">
                  {(() => {
                    const trendingUserItems = clothingItems.filter(item => 
                      risingItems.some(trending => 
                        item.name.toLowerCase().includes(trending.name.toLowerCase().split(' ')[0]) ||
                        item.category.toLowerCase().includes(trending.name.toLowerCase().split(' ')[1] || '')
                      )
                    );
                    
                    // Remove duplicates by name
                    const uniqueTrendingItems = trendingUserItems.filter((item, index, self) => 
                      index === self.findIndex(i => i.name === item.name)
                    );
                    
                    return uniqueTrendingItems.length > 0 ? (
                      uniqueTrendingItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Add trending items to stay current!</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Trends */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-wardrobe-teal" />
            Trends for Your Closet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalizedTrends.map((trend) => (
              <div 
                key={trend.name} 
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPersonalTrend === trend.name ? 'bg-wardrobe-teal/20 border-2 border-wardrobe-teal' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPersonalTrend(selectedPersonalTrend === trend.name ? "" : trend.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{trend.name}</h4>
                  <Badge variant="secondary">{trend.match}% match</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{trend.reason}</p>
                {selectedPersonalTrend === trend.name && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {trend.yourItems.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-wardrobe-navy mb-1">Your Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {trend.yourItems.map((item) => (
                            <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-wardrobe-navy mb-1">AI Suggested Outfits:</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.suggestedOutfits.map((outfit) => (
                          <Badge key={outfit} className="text-xs bg-wardrobe-teal">{outfit}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Trend Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Trending Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Top Trending Colors
              {settings.wardrobe.likedColors.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  Personalized
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingColors.map((color) => (
              <div 
                key={color.name} 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => setColorFilter(colorFilter === color.name ? "" : color.name)}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 ${colorFilter === color.name ? 'border-wardrobe-teal' : 'border-gray-200'}`}
                  style={{ backgroundColor: color.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{color.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-wardrobe-teal h-1.5 rounded-full"
                      style={{ width: `${color.score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MiniChart data={color.trend} />
                  <span className="text-xs text-muted-foreground">{color.score}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Popular Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Most Popular Styles
              {settings.wardrobe.styleProfile !== 'Casual' && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  Based on {settings.wardrobe.styleProfile}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularStyles.map((style) => (
              <div 
                key={style.name} 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                  styleFilter === style.name ? 'bg-wardrobe-teal/10' : ''
                }`}
                onClick={() => setStyleFilter(styleFilter === style.name ? "" : style.name)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{style.name}</p>
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-wardrobe-teal h-1.5 rounded-full"
                      style={{ width: `${style.score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MiniChart data={style.trendData} />
                  <Badge variant="secondary" className="text-green-600">
                    {style.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rising Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Rising Items
              {(settings.wardrobe.preferredFit !== 'Regular' || settings.wardrobe.budgetRange !== 'Medium') && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                  {settings.wardrobe.preferredFit} • {settings.wardrobe.budgetRange}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {risingItems.map((item) => (
              <div 
                key={item.name} 
                className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                  itemFilter === item.name ? 'bg-wardrobe-teal/10' : ''
                }`}
                onClick={() => setItemFilter(itemFilter === item.name ? "" : item.name)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-wardrobe-teal h-1.5 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MiniChart data={item.trendData} />
                  <Badge variant="secondary" className="text-green-600">
                    {item.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wardrobe-teal text-white flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{contributor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contributor.outfits} outfits • {contributor.followers} followers
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={contributor.isFollowing ? "outline" : "default"}
                  onClick={() => handleFollow(contributor.name)}
                  className="h-6 px-2 text-xs"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {contributor.isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Trending Outfits Grid */}
      <div>
        <h2 className="text-2xl font-bold text-wardrobe-navy mb-4">
          Trending Outfits
        </h2>
        {colorFilter || styleFilter || itemFilter ? (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            {colorFilter && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setColorFilter("")}>
                {colorFilter} ×
              </Badge>
            )}
            {styleFilter && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setStyleFilter("")}>
                {styleFilter} ×
              </Badge>
            )}
            {itemFilter && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setItemFilter("")}>
                {itemFilter} ×
              </Badge>
            )}
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredOutfits.map((outfit) => (
            <Card key={outfit.id} className="group cursor-pointer overflow-hidden">
              <div className="relative">
                <img
                  src={outfit.image}
                  alt={`${outfit.style} outfit`}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400/9CAF88/FFFFFF?text=Fashion+Outfit';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <div className="bg-white/95 rounded-lg p-3 w-full">
                    <h4 className="font-medium text-sm mb-2">Shop This Outfit</h4>
                    {outfit.shopLinks.slice(0, 2).map((link, index) => (
                      <div key={index} className="flex justify-between text-xs mb-1">
                        <span>{link.item}</span>
                        <span className="font-medium">{link.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                      onClick={() => {
                        // Create outfit from trend
                        const trendOutfit = {
                          name: `${outfit.style} Trend`,
                          items: [], // Would need to map to user's items
                          season: ['All Seasons'],
                          occasion: outfit.occasion,
                          favorite: false
                        };
                        toast({
                          title: "Trend Inspiration Saved!",
                          description: "Check your outfits to recreate this look with your items."
                        });
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Recreate
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{outfit.style}</Badge>
                  <Badge variant="outline">{outfit.occasion}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {outfit.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{outfit.likes} likes</span>
                  <span>{outfit.saves} saves</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6 px-2"
                    onClick={() => setShowComments(showComments === outfit.id ? null : outfit.id)}
                  >
                    💬 {outfitComments[outfit.id]?.length || 0} comments
                  </Button>
                  <div className="flex gap-1">
                    <button className="text-xs hover:scale-110 transition-transform">❤️</button>
                    <button className="text-xs hover:scale-110 transition-transform">🔥</button>
                    <button className="text-xs hover:scale-110 transition-transform">✨</button>
                  </div>
                </div>
                {showComments === outfit.id && outfitComments[outfit.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    {outfitComments[outfit.id].map((comment, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium text-wardrobe-navy">{comment.user}:</span>
                        <span className="ml-1">{comment.comment}</span>
                        <span className="ml-2 text-muted-foreground">❤️ {comment.reactions}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 text-xs p-1 border rounded"
                      />
                      <Button size="sm" className="h-6 px-2 text-xs">Post</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trends;