import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Bookmark, 
  Filter, 
  Upload,
  Flag,
  Send,
  TrendingUp,
  Sparkles,
  X,
  Camera,
  Trash2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ScratchCard from "@/components/ScratchCard";

const CommunityFeedback = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [filterBy, setFilterBy] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [newComment, setNewComment] = useState("");
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [showRatingBreakdown, setShowRatingBreakdown] = useState<number | null>(null);
  const [userRatings, setUserRatings] = useState<{[key: number]: number}>({});
  const [userComments, setUserComments] = useState<{[key: number]: boolean}>({});
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState<number | null>(null);
  const [showMoreOutfits, setShowMoreOutfits] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [userSubmittedOutfits, setUserSubmittedOutfits] = useState<any[]>([]);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    occasion: "Casual",
    style: "Casual",
    image: null as File | null,
    imagePreview: ""
  });

  const memes = [
    '/Vesti-Ai/memes/1.jpg',
    '/Vesti-Ai/memes/2.jpg',
    '/Vesti-Ai/memes/3.png',
    '/Vesti-Ai/memes/4.jpg',
    '/Vesti-Ai/memes/5.jpg',
  ];

  const handleNextMeme = () => {
    setCurrentMemeIndex((prevIndex) => (prevIndex + 1) % memes.length);
  };

  const outfitFeed = [
    {
      id: 1,
      user: "StyleMaven",
      userAvatar: "SM",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop",
      title: "Casual Friday Look",
      description: "What do you think of this outfit for a casual office day?",
      occasion: "Work",
      style: "Casual",
      colors: ["Navy", "White"],
      materials: ["Cotton", "Denim"],
      brand: "Zara",
      rating: 4.2,
      hasRecentComments: true,
      totalRatings: 28,
      ratingBreakdown: { 5: 15, 4: 8, 3: 3, 2: 1, 1: 1 },
      topComments: [
        { user: "FashionLover", text: "Love the color combination! 🔥", reactions: 12 },
        { user: "ColorCrush", text: "Navy and white is such a classic combo. Never goes out of style! 💙", reactions: 9 }
      ],
      likes: 189,
      saves: 112,
      comments: [
        { user: "FashionLover", text: "Love the color combination! 🔥", time: "2h ago", reactions: 12 },
        { user: "StyleGuru", text: "Perfect for casual Friday!", time: "4h ago", reactions: 8 },
        { user: "WorkWearWiz", text: "This is exactly what I need for my office! Where did you get the blazer?", time: "5h ago", reactions: 6 },
        { user: "MinimalMaven", text: "Simple yet sophisticated. Love how you styled it!", time: "6h ago", reactions: 4 },
        { user: "ColorCrush", text: "Navy and white is such a classic combo. Never goes out of style! 💙", time: "8h ago", reactions: 9 },
        { user: "OfficeFashion", text: "The fit is perfect! This gives me confidence boost vibes ✨", time: "10h ago", reactions: 7 },
        { user: "StyleSeeker", text: "I need this entire outfit in my closet ASAP! 😍", time: "12h ago", reactions: 5 },
        { user: "ProfessionalChic", text: "Finally someone who knows how to dress for work without being boring!", time: "14h ago", reactions: 8 },
        { user: "FashionInspo", text: "Saving this for my Monday morning outfit inspiration 📌", time: "16h ago", reactions: 3 },
        { user: "StyleMood", text: "The confidence this outfit radiates is everything! 👑", time: "18h ago", reactions: 6 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: false,
      timeAgo: "3 hours ago",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Your audience loves the professional yet casual vibe and color coordination",
        topFeedback: ["Great color combination", "Perfect for work", "Love the fit"],
        suggestions: "Users suggest this would pair well with white sneakers for a more casual look"
      }
    },
    {
      id: 2,
      user: "TrendSetter",
      userAvatar: "TS",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop",
      title: "Minimalist Evening",
      description: "Going for a clean, minimal look for dinner. Thoughts?",
      occasion: "Casual",
      style: "Minimalist",
      colors: ["Black", "Grey"],
      materials: ["Wool", "Silk"],
      brand: "COS",
      rating: 4.7,
      hasRecentComments: false,
      totalRatings: 45,
      ratingBreakdown: { 5: 35, 4: 8, 3: 2, 2: 0, 1: 0 },
      topComments: [
        { user: "MinimalFan", text: "So elegant and clean! ✨", reactions: 15 },
        { user: "ChicAndSimple", text: "This is goals! The proportions are perfect 👌", reactions: 11 }
      ],
      likes: 267,
      saves: 198,
      comments: [
        { user: "MinimalFan", text: "So elegant and clean! ✨", time: "1h ago", reactions: 15 },
        { user: "StyleCritic", text: "Could use a pop of color", time: "3h ago", reactions: 5 },
        { user: "ChicAndSimple", text: "This is goals! The proportions are perfect 👌", time: "4h ago", reactions: 11 },
        { user: "EveningVibes", text: "Absolutely stunning for dinner dates. You nailed it!", time: "5h ago", reactions: 7 },
        { user: "MonochromeQueen", text: "Black and grey done right! This is how you do minimalism", time: "7h ago", reactions: 8 },
        { user: "FashionForward", text: "The silhouette is everything! Where's the top from?", time: "9h ago", reactions: 3 },
        { user: "ElegantEdge", text: "This is pure sophistication! Love the texture play 🖤", time: "11h ago", reactions: 9 },
        { user: "MinimalMood", text: "Less is more and you proved it perfectly here!", time: "13h ago", reactions: 4 },
        { user: "NeutralTones", text: "The way these colors complement each other is *chef's kiss* 👨‍🍳💋", time: "15h ago", reactions: 6 },
        { user: "TimelessStyle", text: "This outfit will never go out of style. Classic elegance!", time: "17h ago", reactions: 5 },
        { user: "ModernMinimal", text: "You're making me want to declutter my entire wardrobe! So clean 🤍", time: "19h ago", reactions: 7 }
      ],
      userRating: 5,
      isLiked: true,
      isSaved: false,
      timeAgo: "5 hours ago",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isUserSubmitted: true,
      aiInsights: {
        summary: "Users appreciate the minimalist aesthetic and elegant styling",
        topFeedback: ["So elegant", "Clean look", "Perfect proportions"],
        suggestions: "Consider adding a statement accessory for evening events"
      }
    },
    {
      id: 3,
      user: "BohoQueen",
      userAvatar: "BQ",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop",
      title: "Weekend Vibes",
      description: "Boho chic for a weekend market trip. Rate my look!",
      occasion: "Weekend",
      style: "Boho",
      colors: ["Beige", "Brown"],
      materials: ["Linen", "Cotton"],
      brand: "Free People",
      rating: 3.9,
      hasRecentComments: true,
      totalRatings: 22,
      ratingBreakdown: { 5: 8, 4: 6, 3: 5, 2: 2, 1: 1 },
      topComments: [
        { user: "VintageVibes", text: "Love the flowy aesthetic! ❤️", reactions: 7 },
        { user: "FreeSpirit", text: "Getting major Free People vibes! This is my style inspo 🍃", reactions: 6 }
      ],
      likes: 123,
      saves: 67,
      comments: [
        { user: "VintageVibes", text: "Love the flowy aesthetic! ❤️", time: "30m ago", reactions: 7 },
        { user: "BohoChic", text: "This screams weekend vibes! Perfect for farmers markets 🌻", time: "1h ago", reactions: 5 },
        { user: "EarthyTones", text: "The beige and brown combo is so earthy and natural. Love it!", time: "2h ago", reactions: 4 },
        { user: "FreeSpirit", text: "Getting major Free People vibes! This is my style inspo 🍃", time: "3h ago", reactions: 6 },
        { user: "TextureLover", text: "The linen texture looks so comfortable and breezy!", time: "4h ago", reactions: 3 },
        { user: "BohoGoddess", text: "This is giving me all the wanderlust feels! Perfect for travel 🌍", time: "5h ago", reactions: 8 },
        { user: "NaturalBeauty", text: "Love how effortless this looks! Comfort meets style 🤎", time: "6h ago", reactions: 4 },
        { user: "WeekendWardrobe", text: "Adding this to my weekend outfit rotation immediately!", time: "7h ago", reactions: 5 },
        { user: "FlowingFabrics", text: "The way this drapes is so flattering! Linen is the best 💫", time: "8h ago", reactions: 6 },
        { user: "CasualChic", text: "Proof that casual can still be incredibly stylish! 👏", time: "9h ago", reactions: 7 },
        { user: "SunshineStyle", text: "This outfit just radiates good vibes and sunshine! ☀️", time: "10h ago", reactions: 9 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: true,
      timeAgo: "1 hour ago",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Your boho style resonates well with users who love relaxed, flowy aesthetics",
        topFeedback: ["Love the flowy vibe", "Great for weekends", "Boho perfection"],
        suggestions: "Users think this would be perfect for music festivals or outdoor markets"
      }
    }
  ];

  const additionalOutfits = [
    {
      id: 4,
      user: "StreetStyleStar",
      userAvatar: "SS",
      image: "https://images.unsplash.com/photo-1544957992-20349e4a0b26?w=300&h=400&fit=crop",
      title: "Urban Explorer",
      description: "Street style meets comfort for city adventures!",
      occasion: "Casual",
      style: "Streetwear",
      colors: ["Black", "White"],
      materials: ["Cotton", "Polyester"],
      brand: "Nike",
      rating: 4.5,
      hasRecentComments: true,
      totalRatings: 32,
      ratingBreakdown: { 5: 18, 4: 10, 3: 3, 2: 1, 1: 0 },
      topComments: [
        { user: "UrbanVibes", text: "This is street style perfection! 🔥", reactions: 14 },
        { user: "ComfortFirst", text: "Looks so comfortable yet stylish!", reactions: 10 }
      ],
      likes: 201,
      saves: 89,
      comments: [
        { user: "UrbanVibes", text: "This is street style perfection! 🔥", time: "1h ago", reactions: 14 },
        { user: "ComfortFirst", text: "Looks so comfortable yet stylish!", time: "2h ago", reactions: 10 },
        { user: "CityExplorer", text: "Perfect for walking around the city all day!", time: "3h ago", reactions: 8 },
        { user: "StreetFashion", text: "The sneaker game is strong! 👟", time: "4h ago", reactions: 6 },
        { user: "UrbanChic", text: "Love the monochrome palette!", time: "5h ago", reactions: 7 },
        { user: "StyleWalker", text: "This screams main character energy!", time: "6h ago", reactions: 9 },
        { user: "CasualCool", text: "Effortlessly cool vibes all around ✨", time: "7h ago", reactions: 5 },
        { user: "StreetSmart", text: "Practical meets fashionable - love it!", time: "8h ago", reactions: 4 },
        { user: "UrbanStyle", text: "This is going straight to my inspo board!", time: "9h ago", reactions: 6 },
        { user: "CityChic", text: "The fit is everything! Where's the jacket from?", time: "10h ago", reactions: 8 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: false,
      timeAgo: "2 hours ago",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users love the urban aesthetic and comfortable styling",
        topFeedback: ["Street style perfection", "Comfortable yet stylish", "Perfect for city walks"],
        suggestions: "Consider adding a pop of color with accessories for variety"
      }
    },
    {
      id: 5,
      user: "ElegantEvening",
      userAvatar: "EE",
      image: "https://images.unsplash.com/photo-1566479179817-c0ae8e5b4e8e?w=300&h=400&fit=crop",
      title: "Date Night Glam",
      description: "Sophisticated elegance for special evenings ✨",
      occasion: "Party",
      style: "Elegant",
      colors: ["Black", "Gold"],
      materials: ["Silk", "Satin"],
      brand: "Reformation",
      rating: 4.8,
      hasRecentComments: false,
      totalRatings: 41,
      ratingBreakdown: { 5: 32, 4: 7, 3: 2, 2: 0, 1: 0 },
      topComments: [
        { user: "GlamGoddess", text: "Absolutely stunning! Date night goals 💫", reactions: 18 },
        { user: "EveningElegance", text: "The sophistication level is unmatched!", reactions: 12 }
      ],
      likes: 298,
      saves: 156,
      comments: [
        { user: "GlamGoddess", text: "Absolutely stunning! Date night goals 💫", time: "3h ago", reactions: 18 },
        { user: "EveningElegance", text: "The sophistication level is unmatched!", time: "4h ago", reactions: 12 },
        { user: "DateNightDiva", text: "This is how you make an entrance! 👑", time: "5h ago", reactions: 15 },
        { user: "SilkAndSatin", text: "The fabric choice is perfection!", time: "6h ago", reactions: 9 },
        { user: "GoldenHour", text: "Those gold accents are everything! ✨", time: "7h ago", reactions: 11 },
        { user: "ClassicChic", text: "Timeless elegance at its finest", time: "8h ago", reactions: 7 },
        { user: "NightOutStyle", text: "Making me want to plan a fancy dinner just to wear this!", time: "9h ago", reactions: 8 },
        { user: "LuxuryLooks", text: "The attention to detail is incredible 🤌", time: "10h ago", reactions: 6 },
        { user: "ElegantEdge", text: "Sophisticated without being overdone - perfect balance!", time: "11h ago", reactions: 10 },
        { user: "GlamourGirl", text: "This outfit deserves a red carpet! 🌟", time: "12h ago", reactions: 13 }
      ],
      userRating: 0,
      isLiked: true,
      isSaved: true,
      timeAgo: "4 hours ago",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users are impressed by the sophisticated styling and attention to detail",
        topFeedback: ["Absolutely stunning", "Sophisticated elegance", "Perfect for dates"],
        suggestions: "This style works well for formal events and special occasions"
      }
    },
    {
      id: 6,
      user: "SummerVibes",
      userAvatar: "SV",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop",
      title: "Beach Day Ready",
      description: "Breezy summer outfit perfect for coastal adventures!",
      occasion: "Weekend",
      style: "Casual",
      colors: ["White", "Blue"],
      materials: ["Linen", "Cotton"],
      brand: "Madewell",
      rating: 4.3,
      hasRecentComments: true,
      totalRatings: 26,
      ratingBreakdown: { 5: 12, 4: 9, 3: 4, 2: 1, 1: 0 },
      topComments: [
        { user: "BeachBabe", text: "Summer perfection! 🌊", reactions: 11 },
        { user: "CoastalChic", text: "This screams vacation vibes!", reactions: 9 }
      ],
      likes: 167,
      saves: 78,
      comments: [
        { user: "BeachBabe", text: "Summer perfection! 🌊", time: "45m ago", reactions: 11 },
        { user: "CoastalChic", text: "This screams vacation vibes!", time: "1h ago", reactions: 9 },
        { user: "SunKissed", text: "The linen looks so breezy and comfortable! ☀️", time: "2h ago", reactions: 7 },
        { user: "OceanBreeze", text: "Perfect for those long beach walks!", time: "3h ago", reactions: 6 },
        { user: "SummerStyle", text: "White and blue is such a fresh combo!", time: "4h ago", reactions: 8 },
        { user: "VacationMode", text: "Adding this to my summer wardrobe ASAP! 🏖️", time: "5h ago", reactions: 5 },
        { user: "BeachWalk", text: "Looks effortless but so put together!", time: "6h ago", reactions: 4 },
        { user: "SaltAir", text: "This gives me all the coastal grandmother vibes!", time: "7h ago", reactions: 10 },
        { user: "SunnyDays", text: "The perfect balance of comfort and style! 🌞", time: "8h ago", reactions: 6 },
        { user: "BeachReady", text: "This outfit just makes me happy! Pure summer joy ✨", time: "9h ago", reactions: 8 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: true,
      timeAgo: "6 hours ago",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users love the fresh summer aesthetic and comfortable materials",
        topFeedback: ["Summer perfection", "Vacation vibes", "Breezy and comfortable"],
        suggestions: "Perfect for beach destinations and summer travel"
      }
    },
    {
      id: 7,
      user: "PowerSuit",
      userAvatar: "PS",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop",
      title: "Boss Babe Energy",
      description: "Commanding respect in the boardroom with this power look!",
      occasion: "Work",
      style: "Professional",
      colors: ["Grey", "White"],
      materials: ["Wool", "Cotton"],
      brand: "Theory",
      rating: 4.6,
      hasRecentComments: false,
      totalRatings: 38,
      ratingBreakdown: { 5: 24, 4: 11, 3: 2, 2: 1, 1: 0 },
      topComments: [
        { user: "CEOStyle", text: "This is how you dress for success! 💼", reactions: 16 },
        { user: "PowerDressing", text: "Commanding presence in every thread!", reactions: 13 }
      ],
      likes: 245,
      saves: 134,
      comments: [
        { user: "CEOStyle", text: "This is how you dress for success! 💼", time: "2h ago", reactions: 16 },
        { user: "PowerDressing", text: "Commanding presence in every thread!", time: "3h ago", reactions: 13 },
        { user: "BoardroomBoss", text: "The tailoring is absolutely impeccable! 👔", time: "4h ago", reactions: 12 },
        { user: "ExecutiveStyle", text: "This screams confidence and competence!", time: "5h ago", reactions: 9 },
        { user: "ProfessionalPower", text: "Every working woman needs this in her closet!", time: "6h ago", reactions: 11 },
        { user: "SuitUp", text: "The fit is everything! Where's the blazer from?", time: "7h ago", reactions: 7 },
        { user: "WorkWearWin", text: "Making power dressing look effortless! 🔥", time: "8h ago", reactions: 8 },
        { user: "OfficeChic", text: "This is giving me all the motivation to dress up for work!", time: "9h ago", reactions: 6 },
        { user: "LeadershipLooks", text: "The perfect blend of authority and approachability", time: "10h ago", reactions: 10 },
        { user: "CareerGoals", text: "This outfit is a whole mood! Success looks good on you! 👑", time: "11h ago", reactions: 14 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: false,
      timeAgo: "7 hours ago",
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users appreciate the professional power and impeccable tailoring",
        topFeedback: ["Dress for success", "Commanding presence", "Impeccable tailoring"],
        suggestions: "Perfect for important meetings and leadership roles"
      }
    },
    {
      id: 8,
      user: "ArtisticSoul",
      userAvatar: "AS",
      image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=400&fit=crop",
      title: "Creative Expression",
      description: "Art gallery opening calls for creative fashion choices!",
      occasion: "Party",
      style: "Artistic",
      colors: ["Purple", "Black"],
      materials: ["Velvet", "Silk"],
      brand: "& Other Stories",
      rating: 4.1,
      hasRecentComments: true,
      totalRatings: 29,
      ratingBreakdown: { 5: 14, 4: 8, 3: 5, 2: 2, 1: 0 },
      topComments: [
        { user: "ArtLover", text: "This is wearable art! 🎨", reactions: 12 },
        { user: "CreativeVibes", text: "Love the bold color choice!", reactions: 8 }
      ],
      likes: 143,
      saves: 67,
      comments: [
        { user: "ArtLover", text: "This is wearable art! 🎨", time: "1h ago", reactions: 12 },
        { user: "CreativeVibes", text: "Love the bold color choice!", time: "2h ago", reactions: 8 },
        { user: "GalleryGirl", text: "Perfect for art events! You fit right in 💜", time: "3h ago", reactions: 9 },
        { user: "VelvetVibes", text: "The texture of that velvet is divine!", time: "4h ago", reactions: 6 },
        { user: "ColorBold", text: "Finally someone who's not afraid of color!", time: "5h ago", reactions: 7 },
        { user: "ArtisticFlair", text: "This outfit tells a story - love the creativity!", time: "6h ago", reactions: 5 },
        { user: "PurplePower", text: "Purple is such an underrated color! You're rocking it! 🔮", time: "7h ago", reactions: 10 },
        { user: "CreativeClass", text: "This is how you dress when you want to inspire others!", time: "8h ago", reactions: 4 },
        { user: "ArtScene", text: "The perfect blend of sophistication and creativity", time: "9h ago", reactions: 8 },
        { user: "ExpressiveStyle", text: "Your style is as unique as a masterpiece! ✨", time: "10h ago", reactions: 11 }
      ],
      userRating: 0,
      isLiked: true,
      isSaved: false,
      timeAgo: "8 hours ago",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users appreciate the creative expression and bold color choices",
        topFeedback: ["Wearable art", "Bold color choice", "Creative expression"],
        suggestions: "Great for creative events and artistic gatherings"
      }
    },
    {
      id: 9,
      user: "FitnessFirst",
      userAvatar: "FF",
      image: "https://images.unsplash.com/photo-1506629905607-d405d7d2b0d2?w=300&h=400&fit=crop",
      title: "Athleisure Perfection",
      description: "From gym to coffee date - this look does it all!",
      occasion: "Casual",
      style: "Athleisure",
      colors: ["Pink", "Grey"],
      materials: ["Spandex", "Cotton"],
      brand: "Lululemon",
      rating: 4.4,
      hasRecentComments: true,
      totalRatings: 35,
      ratingBreakdown: { 5: 18, 4: 12, 3: 4, 2: 1, 1: 0 },
      topComments: [
        { user: "ActiveLife", text: "Comfort meets style perfectly! 💪", reactions: 13 },
        { user: "GymToStreet", text: "This is athleisure done right!", reactions: 10 }
      ],
      likes: 178,
      saves: 92,
      comments: [
        { user: "ActiveLife", text: "Comfort meets style perfectly! 💪", time: "30m ago", reactions: 13 },
        { user: "GymToStreet", text: "This is athleisure done right!", time: "1h ago", reactions: 10 },
        { user: "FitFashion", text: "Love how versatile this look is! 🏃‍♀️", time: "2h ago", reactions: 8 },
        { user: "WorkoutWear", text: "The pink is such a fun pop of color!", time: "3h ago", reactions: 7 },
        { user: "ActiveStyle", text: "This makes me want to hit the gym just to wear cute outfits!", time: "4h ago", reactions: 9 },
        { user: "ComfortZone", text: "Finally, fashion that moves with you! ✨", time: "5h ago", reactions: 6 },
        { user: "HealthyVibes", text: "You're making fitness look so chic!", time: "6h ago", reactions: 5 },
        { user: "MovementStyle", text: "The perfect balance of function and fashion! 🌟", time: "7h ago", reactions: 11 },
        { user: "ActiveChic", text: "This is why I love the athleisure trend!", time: "8h ago", reactions: 4 },
        { user: "FitLife", text: "Proof that you can look amazing while living an active lifestyle! 💕", time: "9h ago", reactions: 12 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: true,
      timeAgo: "9 hours ago",
      timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users love the versatility and comfort of this athleisure look",
        topFeedback: ["Comfort meets style", "Athleisure done right", "Versatile look"],
        suggestions: "Perfect for active lifestyles and casual meetups"
      }
    },
    {
      id: 10,
      user: "VintageCollector",
      userAvatar: "VC",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop",
      title: "Retro Revival",
      description: "Bringing back the best of vintage fashion with a modern twist!",
      occasion: "Weekend",
      style: "Vintage",
      colors: ["Yellow", "Brown"],
      materials: ["Wool", "Cotton"],
      brand: "Vintage",
      rating: 4.0,
      hasRecentComments: false,
      totalRatings: 24,
      ratingBreakdown: { 5: 10, 4: 8, 3: 4, 2: 2, 1: 0 },
      topComments: [
        { user: "RetroLover", text: "This takes me back! Love the vintage vibes 📻", reactions: 9 },
        { user: "ThriftFinds", text: "Vintage done with such style!", reactions: 7 }
      ],
      likes: 134,
      saves: 58,
      comments: [
        { user: "RetroLover", text: "This takes me back! Love the vintage vibes 📻", time: "4h ago", reactions: 9 },
        { user: "ThriftFinds", text: "Vintage done with such style!", time: "5h ago", reactions: 7 },
        { user: "TimelessStyle", text: "Proof that good style never goes out of fashion! 🕰️", time: "6h ago", reactions: 8 },
        { user: "VintageVibes", text: "The yellow is so cheerful and retro!", time: "7h ago", reactions: 6 },
        { user: "RetroChic", text: "This is giving me all the 70s feels in the best way!", time: "8h ago", reactions: 5 },
        { user: "ClassicStyle", text: "Love how you've modernized this vintage look!", time: "9h ago", reactions: 4 },
        { user: "ThriftQueen", text: "This is why I love thrift shopping! Hidden gems everywhere! 💎", time: "10h ago", reactions: 10 },
        { user: "RetroRevival", text: "You're bringing vintage back in the coolest way!", time: "11h ago", reactions: 3 },
        { user: "VintageInspired", text: "The styling is so thoughtful and authentic! 🌻", time: "12h ago", reactions: 7 },
        { user: "TimeCapsule", text: "This outfit is like a beautiful piece of fashion history!", time: "13h ago", reactions: 6 }
      ],
      userRating: 0,
      isLiked: false,
      isSaved: false,
      timeAgo: "10 hours ago",
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      isUserSubmitted: false,
      aiInsights: {
        summary: "Users appreciate the authentic vintage styling with modern touches",
        topFeedback: ["Love the vintage vibes", "Vintage done with style", "Timeless fashion"],
        suggestions: "Great for vintage events and retro-themed gatherings"
      }
    }
  ];

  const StarRating = ({ rating, onRate, size = "sm" }: { rating: number; onRate?: (rating: number) => void; size?: "sm" | "lg" }) => {
    const starSize = size === "lg" ? "h-6 w-6" : "h-4 w-4";
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} cursor-pointer transition-colors ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const handleRate = (outfitId: number, rating: number) => {
    console.log(`Rated outfit ${outfitId} with ${rating} stars`);
    setUserRatings(prev => ({ ...prev, [outfitId]: rating }));
  };

  const handleQuickFeedback = (outfitId: number, feedback: string) => {
    console.log(`Quick feedback for outfit ${outfitId}: ${feedback}`);
    setUserComments(prev => ({ ...prev, [outfitId]: true }));
  };

  const RatingBreakdown = ({ breakdown, total }: { breakdown: {[key: number]: number}, total: number }) => (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-sm">Rating Distribution</h4>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = breakdown[stars] || 0;
        const percentage = Math.round((count / total) * 100);
        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-8">{stars}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-12 text-right">{count} ({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );

  const QuickFeedbackTags = ({ outfitId }: { outfitId: number }) => {
    const feedbackCategories = {
      "Style": ["Love the colors", "Perfect fit", "Very stylish", "Great proportions"],
      "Occasion": ["Great for work", "Perfect for parties", "Casual vibes", "Date night ready"],
      "Pairing": ["Would pair with jeans", "Needs accessories", "Great with sneakers", "Add a jacket"]
    };
    
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Quick feedback prompts:</p>
        {Object.entries(feedbackCategories).map(([category, tags]) => (
          <div key={category} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{category}:</p>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs hover:bg-wardrobe-teal hover:text-white"
                  onClick={() => handleQuickFeedback(outfitId, tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const UserHoverCard = ({ username, onFollow }: { username: string; onFollow: () => void }) => (
    <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-3 w-48 -top-2 left-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-wardrobe-teal text-white flex items-center justify-center font-medium">
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{username}</p>
          <p className="text-xs text-muted-foreground">Fashion Enthusiast</p>
        </div>
      </div>
      <Button size="sm" className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90" onClick={onFollow}>
        Follow
      </Button>
    </div>
  );

  const AIInsightsPanel = ({ insights }: { insights: any }) => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h4 className="font-medium text-purple-900">AI Insights</h4>
      </div>
      <p className="text-sm text-purple-800">{insights.summary}</p>
      <div>
        <p className="text-xs font-medium text-purple-700 mb-1">Top feedback themes:</p>
        <div className="flex flex-wrap gap-1">
          {insights.topFeedback.map((feedback: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              {feedback}
            </Badge>
          ))}
        </div>
      </div>
      <div className="bg-white/50 rounded p-2">
        <p className="text-xs font-medium text-purple-700">💡 Suggestion:</p>
        <p className="text-xs text-purple-600">{insights.suggestions}</p>
      </div>
    </div>
  );

  const handleLike = (outfitId: number) => {
    console.log(`Liked outfit ${outfitId}`);
  };

  const handleSave = (outfitId: number) => {
    console.log(`Saved outfit ${outfitId}`);
  };

  const handleComment = (outfitId: number, comment: string) => {
    console.log(`Comment on outfit ${outfitId}: ${comment}`);
    setNewComment("");
  };

  const handleReport = (outfitId: number, commentUser?: string) => {
    console.log(`Reported ${commentUser ? `comment by ${commentUser}` : `outfit ${outfitId}`}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmitForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubmitForm(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitFeedback = () => {
    if (!submitForm.title || !submitForm.description || !submitForm.image) {
      alert("Please fill in all required fields and upload an image.");
      return;
    }
    
    // Create new outfit object
    const newOutfit = {
      id: Date.now(),
      user: "You",
      userAvatar: "YU",
      image: submitForm.imagePreview,
      title: submitForm.title,
      description: submitForm.description,
      occasion: submitForm.occasion,
      style: submitForm.style,
      colors: ["Mixed"],
      materials: ["Various"],
      brand: "Personal",
      rating: 0,
      hasRecentComments: false,
      totalRatings: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topComments: [],
      likes: 0,
      saves: 0,
      comments: [],
      userRating: 0,
      isLiked: false,
      isSaved: false,
      timeAgo: "Just now",
      timestamp: new Date(),
      isUserSubmitted: true,
      aiInsights: {
        summary: "Your outfit is now live! Community feedback will appear here as users interact with it.",
        topFeedback: ["Awaiting feedback"],
        suggestions: "Share your outfit on social media to get more visibility!"
      }
    };
    
    // Add to user submitted outfits
    setUserSubmittedOutfits(prev => [newOutfit, ...prev]);
    
    alert("Your outfit has been submitted and is now live in the community feed!");
    
    // Reset form
    setSubmitForm({
      title: "",
      description: "",
      occasion: "Casual",
      style: "Casual",
      image: null,
      imagePreview: ""
    });
    setShowSubmitModal(false);
  };

  const handleDeleteOutfit = (outfitId: number) => {
    if (confirm("Are you sure you want to delete this outfit? This action cannot be undone.")) {
      setUserSubmittedOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
    }
  };

  const getPersonalizedFeed = () => {
    // Simulate AI-powered personalization
    const userPreferences = {
      favoriteStyles: ["Minimalist", "Casual"],
      favoriteColors: ["Black", "Grey", "Navy"],
      followingUsers: ["TrendSetter", "StyleMaven"]
    };

    const allOutfits = showMoreOutfits ? [...userSubmittedOutfits, ...outfitFeed, ...additionalOutfits] : [...userSubmittedOutfits, ...outfitFeed];

    switch (activeTab) {
      case "For You":
        return allOutfits.filter(outfit => 
          userPreferences.favoriteStyles.includes(outfit.style) ||
          outfit.colors.some(color => userPreferences.favoriteColors.includes(color))
        );
      case "Following":
        return allOutfits.filter(outfit => 
          userPreferences.followingUsers.includes(outfit.user)
        );
      case "Trending":
        return allOutfits.filter(outfit => outfit.rating > 4.0).sort((a, b) => b.likes - a.likes);
      case "My Feedback":
        return userSubmittedOutfits;
      default:
        return allOutfits;
    }
  };

  const getSortedOutfits = (outfits: typeof outfitFeed) => {
    const sorted = [...outfits];
    switch (sortBy) {
      case "Most Recent":
        return sorted.sort((a, b) => (b as any).timestamp.getTime() - (a as any).timestamp.getTime());
      case "Highest Rated":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "Most Liked":
        return sorted.sort((a, b) => b.likes - a.likes);
      case "Most Commented":
        return sorted.sort((a, b) => b.comments.length - a.comments.length);
      case "AI's Pick":
        return sorted.sort((a, b) => {
          const aScore = (a.rating * 0.4) + (a.likes * 0.0001) + (a.comments.length * 0.1);
          const bScore = (b.rating * 0.4) + (b.likes * 0.0001) + (b.comments.length * 0.1);
          return bScore - aScore;
        });
      case "Trending Feedback":
        return sorted.sort((a, b) => {
          const aTrending = a.hasRecentComments ? 1 : 0;
          const bTrending = b.hasRecentComments ? 1 : 0;
          if (aTrending !== bTrending) return bTrending - aTrending;
          return b.comments.length - a.comments.length;
        });
      default:
        return sorted;
    }
  };

  const filteredOutfits = getSortedOutfits(
    getPersonalizedFeed().filter(outfit => {
      if (filterBy !== "All" && outfit.occasion !== filterBy) return false;
      if (colorFilter !== "All" && !outfit.colors.includes(colorFilter)) return false;
      if (materialFilter !== "All" && !outfit.materials.includes(materialFilter)) return false;
      return true;
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wardrobe-navy flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Community Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Get feedback on your outfits and discover community favorites
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => setShowScratchCard(true)}
          >
            Have Fun
          </Button>
          <Button 
            className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            onClick={() => setShowSubmitModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Submit for Feedback
          </Button>
        </div>
      </div>

      {/* Personalized Tabs */}
      <div className="flex gap-2 border-b">
        {["All", "For You", "Following", "Trending", "My Feedback"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className={`pb-3 rounded-none border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-wardrobe-teal text-wardrobe-teal" 
                : "border-transparent hover:text-wardrobe-teal"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "For You" && <Sparkles className="h-4 w-4 ml-1" />}
            {tab === "My Feedback" && <span className="ml-1">📝</span>}
          </Button>
        ))}
      </div>

      {/* Enhanced Filters and Sorting */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium">Sort:</span>
            {["Most Recent", "Highest Rated", "Most Liked", "Most Commented", "AI's Pick", "Trending Feedback"].map((sort) => (
              <Button
                key={sort}
                variant={sortBy === sort ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(sort)}
                className={sort === "AI's Pick" || sort === "Trending Feedback" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600" : ""}
              >
                {sort}
                {(sort === "AI's Pick" || sort === "Trending Feedback") && " 🔥"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Occasion:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              {["All", "Work", "Casual", "Party", "Weekend"].map((filter) => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Color:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              {["All", "Black", "White", "Navy", "Grey", "Beige", "Brown"].map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Material:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
            >
              {["All", "Cotton", "Denim", "Wool", "Silk", "Linen"].map((material) => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFilterBy("All");
              setColorFilter("All");
              setMaterialFilter("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* AI Training Info */}
      <Card className="bg-gradient-to-r from-wardrobe-teal/10 to-wardrobe-navy/10 border-wardrobe-teal/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-wardrobe-teal mt-0.5" />
            <div>
              <h3 className="font-semibold text-wardrobe-navy">Powering Our AI</h3>
              <p className="text-sm text-muted-foreground">
                Your ratings and feedback help train our AI to provide better style recommendations. 
                The most loved outfits appear on our Trends page, creating a cycle of inspiration!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Feed Info */}
      {activeTab === "For You" && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Personalized Just for You</h3>
                <p className="text-sm text-blue-700">
                  Based on your style preferences, saved items, and users you follow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outfit Feed */}
      <div className="space-y-6">
        {filteredOutfits.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No outfits match your current filters. Try adjusting your selection!</p>
          </Card>
        ) : (
          filteredOutfits.map((outfit) => (
          <Card key={outfit.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* User Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => console.log(`Navigate to ${outfit.user}'s profile`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-wardrobe-teal text-white flex items-center justify-center font-medium">
                      {outfit.userAvatar}
                    </div>
                    <div>
                      <p className="font-medium hover:text-wardrobe-teal transition-colors">{outfit.user}</p>
                      <p className="text-sm text-muted-foreground">{outfit.timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {outfit.hasRecentComments && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        💬 New Comments
                      </Badge>
                    )}
                    {outfit.user === "You" ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleReport(outfit.id)}>
                        <Flag className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-4">
                {/* Image */}
                <div className="relative">
                  <img
                    src={outfit.image}
                    alt={outfit.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <Badge variant="secondary">{outfit.occasion}</Badge>
                      <Badge variant="outline">{outfit.style}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{outfit.brand}</Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-wardrobe-navy">{outfit.title}</h3>
                    <p className="text-muted-foreground mt-1">{outfit.description}</p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Colors:</span>
                        {outfit.colors.map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Materials: {outfit.materials.join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Rating with Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={outfit.rating} />
                      <span className="text-sm font-medium">{outfit.rating}</span>
                      <button 
                        className="text-sm text-muted-foreground hover:text-wardrobe-teal underline"
                        onClick={() => setShowRatingBreakdown(showRatingBreakdown === outfit.id ? null : outfit.id)}
                      >
                        ({outfit.totalRatings} ratings)
                      </button>
                    </div>
                    
                    {showRatingBreakdown === outfit.id && (
                      <RatingBreakdown breakdown={outfit.ratingBreakdown} total={outfit.totalRatings} />
                    )}
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Rate this outfit:</p>
                      <StarRating 
                        rating={userRatings[outfit.id] || outfit.userRating} 
                        onRate={(rating) => handleRate(outfit.id, rating)}
                        size="lg"
                      />
                    </div>
                  </div>

                  {/* Top Comments Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Community thoughts:</h4>
                    <div className="space-y-2">
                      {outfit.topComments.slice(0, 2).map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user}:</span>
                            <span>{comment.text}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">❤️ {comment.reactions}</span>
                        </div>
                      ))}
                      {outfit.comments.length > 2 && (
                        <button 
                          className="text-xs text-wardrobe-teal hover:underline"
                          onClick={() => setExpandedComments(expandedComments === outfit.id ? null : outfit.id)}
                        >
                          View all {outfit.comments.length} comments
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Insights for User's Own Outfits */}
                  {outfit.isUserSubmitted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Your Outfit Insights</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAIInsights(showAIInsights === outfit.id ? null : outfit.id)}
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          {showAIInsights === outfit.id ? "Hide" : "Show"} AI Analysis
                        </Button>
                      </div>
                      {showAIInsights === outfit.id && (
                        <AIInsightsPanel insights={outfit.aiInsights} />
                      )}
                    </div>
                  )}

                  {/* Quick Feedback Tags */}
                  {!userComments[outfit.id] && !userRatings[outfit.id] && !outfit.isUserSubmitted && (
                    <QuickFeedbackTags outfitId={outfit.id} />
                  )}

                  {/* Enhanced Submit Feedback Button */}
                  <div className="pt-2 border-t">
                    {userRatings[outfit.id] || userComments[outfit.id] ? (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          className="flex-1 mr-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          ✓ See Your Rating & Feedback
                        </Button>
                        <div className="flex gap-2">
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">❤️</button>
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">🔥</button>
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">✨</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={outfit.isLiked ? "text-red-500" : ""}
                            onClick={() => handleLike(outfit.id)}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${outfit.isLiked ? "fill-current" : ""}`} />
                            {outfit.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={outfit.isSaved ? "text-wardrobe-teal" : ""}
                            onClick={() => handleSave(outfit.id)}
                          >
                            <Bookmark className={`h-4 w-4 mr-1 ${outfit.isSaved ? "fill-current" : ""}`} />
                            {outfit.saves}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={outfit.hasRecentComments ? "text-green-600" : ""}
                            onClick={() => setExpandedComments(expandedComments === outfit.id ? null : outfit.id)}
                          >
                            <MessageCircle className={`h-4 w-4 mr-1 ${outfit.hasRecentComments ? "fill-current" : ""}`} />
                            {outfit.comments.length}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">❤️</button>
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">🔥</button>
                          <button className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100">✨</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  {expandedComments === outfit.id && (
                    <div className="space-y-3 border-t pt-4">
                      {outfit.comments.map((comment, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div 
                                className="relative"
                                onMouseEnter={() => setHoveredUser(comment.user)}
                                onMouseLeave={() => setHoveredUser(null)}
                              >
                                <span className="font-medium text-sm cursor-pointer hover:text-wardrobe-teal">
                                  {comment.user}
                                </span>
                                {hoveredUser === comment.user && (
                                  <UserHoverCard 
                                    username={comment.user} 
                                    onFollow={() => console.log(`Following ${comment.user}`)}
                                  />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{comment.time}</span>
                            </div>
                            <p className="text-sm mt-1">{comment.text}</p>
                            <span className="text-xs text-muted-foreground">❤️ {comment.reactions}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleReport(outfit.id, comment.user)}>
                            <Flag className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2 mt-4">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleComment(outfit.id, newComment)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {!showMoreOutfits && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="w-full max-w-md"
            onClick={() => setShowMoreOutfits(true)}
          >
            Load More Outfits
          </Button>
        </div>
      )}

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-wardrobe-navy">Submit Your Outfit</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSubmitModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image">Outfit Photo *</Label>
                  <div className="mt-2">
                    {submitForm.imagePreview ? (
                      <div className="relative">
                        <img 
                          src={submitForm.imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80"
                          onClick={() => setSubmitForm(prev => ({ ...prev, image: null, imagePreview: "" }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> your outfit photo
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <input 
                          id="image" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Outfit Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Casual Friday Look"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your outfit and what feedback you're looking for..."
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Occasion */}
                <div>
                  <Label htmlFor="occasion">Occasion</Label>
                  <select
                    id="occasion"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={submitForm.occasion}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, occasion: e.target.value }))}
                  >
                    <option value="Casual">Casual</option>
                    <option value="Work">Work</option>
                    <option value="Party">Party</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>

                {/* Style */}
                <div>
                  <Label htmlFor="style">Style</Label>
                  <select
                    id="style"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={submitForm.style}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, style: e.target.value }))}
                  >
                    <option value="Casual">Casual</option>
                    <option value="Professional">Professional</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Boho">Boho</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Elegant">Elegant</option>
                    <option value="Vintage">Vintage</option>
                    <option value="Athleisure">Athleisure</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                    onClick={handleSubmitFeedback}
                  >
                    Submit for Feedback
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScratchCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-8 right-0 text-white"
              onClick={() => setShowScratchCard(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <ScratchCard imageUrl={memes[currentMemeIndex]} onNext={handleNextMeme} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeedback;