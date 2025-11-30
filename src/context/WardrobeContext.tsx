import React, { createContext, useContext, useState, useEffect } from 'react';
import { masumiService, MasumiRecommendation } from '@/services/masumiRecommendationService';
import { wardrobePreferencesService, RecommendationContext } from '@/services/wardrobePreferencesService';
import { imageClothingItems, matchingOutfits } from '@/services/imageImportService';

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string[];
  image: string;
  brand?: string;
  material?: string;
  description?: string;
  tags: string[];
  addedAt: Date;
  lastWorn?: Date;
  timesWorn: number;
  topPairings: string[]; // IDs of most paired items
  healthStatus: 'overused' | 'balanced' | 'underused' | 'new';
  suggestedTags: string[];
  isPublic: boolean;
  careInstructions?: string;
  purchaseDate?: Date;
  price?: number;
  isFavorite: boolean;
  costPerWear?: number;
  aiSuggestedOutfits?: string[];
  trendScore?: number;
  personalStyleScore?: number;
}

export interface WardrobeAnalytics {
  totalItems: number;
  totalValue: number;
  averageCostPerWear: number;
  mostWornCategory: string;
  leastWornCategory: string;
  favoriteColors: string[];
  favoriteBrands: string[];
  seasonalDistribution: Record<string, number>;
  healthStatusBreakdown: Record<string, number>;
  trendAnalysis: {
    onTrend: number;
    classic: number;
    outdated: number;
  };
}

export interface Outfit {
  id: string;
  name: string;
  items: string[]; // IDs of clothing items
  season: string[];
  occasion: string;
  favorite: boolean;
  createdAt: Date;
  lastWorn?: Date;
  totalCostPerWear?: number;
  freshnessScore?: number; // Days since last worn
  aiRating?: number; // User feedback on AI suggestions
  scheduledDate?: Date;
  weatherSuitability?: string[];
  recommendationScore?: number;
  reasons?: string[];
}

export interface StylePersonality {
  id: string;
  name: string;
  description: string;
  colorPalette: string[];
  preferredStyles: string[];
  score: number;
}

export interface CalendarEvent {
  id: string;
  date: Date;
  title?: string;
  eventType: string;
  weather?: string;
  outfitId?: string;
  location?: string;
  notes?: string;
}

interface WardrobeContextType {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  calendarEvents: CalendarEvent[];
  stylePersonality: StylePersonality | null;
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'addedAt'>) => void;
  updateClothingItem: (id: string, item: Partial<ClothingItem>) => void;
  removeClothingItem: (id: string) => void;
  getClothingItem: (id: string) => ClothingItem | undefined;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  updateOutfit: (id: string, outfit: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;
  getRecommendedOutfits: (occasion?: string, season?: string) => Outfit[];
  getMasumiRecommendations: (occasion?: string, season?: string) => Promise<MasumiRecommendation[]>;
  getSimilarItems: (itemId: string) => ClothingItem[];
  generateAIOutfits: (itemId: string, occasion?: string) => Outfit[];
  getWardrobeAnalytics: () => WardrobeAnalytics;
  getWardrobeGaps: () => string[];
  getCostPerWearAnalysis: () => ClothingItem[];
  getOutfitAnalytics: () => OutfitAnalytics;
  rateAIOutfit: (outfitId: string, rating: number) => void;
  scheduleOutfit: (outfitId: string, date: Date, eventType: string) => void;
  setStylePersonality: (personality: StylePersonality) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  getOutfitForDate: (date: Date) => Outfit | null;
  generatePackingList: (startDate: Date, endDate: Date, destination: string) => ClothingItem[];
  resetToSampleData: () => void;
  importImageItems: () => void;
}

export interface OutfitAnalytics {
  totalOutfits: number;
  averageOutfitCPW: number;
  mostWornOutfit: Outfit | null;
  leastWornOutfit: Outfit | null;
  styleDistribution: Record<string, number>;
  colorAnalysis: {
    dominant: string[];
    trending: string[];
    underused: string[];
  };
  freshnessScores: {
    fresh: number;
    stale: number;
    overdue: number;
  };
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

// Sample clothing data
const sampleClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Blue Denim Jacket',
    category: 'Outerwear',
    color: 'Blue',
    season: ['Spring', 'Fall'],
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&h=500&fit=crop',
    brand: 'Levi\'s',
    material: 'Denim',
    description: 'Classic blue denim jacket with button front',
    tags: ['casual', 'denim', 'versatile'],
    addedAt: new Date('2023-01-15'),
    lastWorn: new Date('2023-04-20'),
    timesWorn: 15,
    topPairings: ['2', '3'],
    healthStatus: 'balanced',
    suggestedTags: ['layering', 'spring'],
    isPublic: false,
    careInstructions: 'Machine wash cold, tumble dry low',
    price: 4500,
    isFavorite: true,
    costPerWear: 300,
    aiSuggestedOutfits: ['ai-1', 'ai-2'],
    trendScore: 8,
    personalStyleScore: 9,
  },
  {
    id: '2',
    name: 'White T-Shirt',
    category: 'Tops',
    color: 'White',
    season: ['Spring', 'Summer', 'Fall'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    brand: 'H&M',
    material: 'Cotton',
    description: 'Basic white cotton t-shirt',
    tags: ['basic', 'essential', 'casual'],
    addedAt: new Date('2023-02-10'),
    lastWorn: new Date('2023-05-01'),
    timesWorn: 25,
    topPairings: ['1', '3', '6'],
    healthStatus: 'overused',
    suggestedTags: ['staple', 'layering'],
    isPublic: true,
    careInstructions: 'Machine wash warm, tumble dry medium',
    price: 800,
    isFavorite: true,
    costPerWear: 32,
    aiSuggestedOutfits: ['ai-3', 'ai-4', 'ai-5'],
    trendScore: 7,
    personalStyleScore: 10,
  },
  {
    id: '3',
    name: 'Black Jeans',
    category: 'Bottoms',
    color: 'Black',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop',
    brand: 'Zara',
    material: 'Denim',
    description: 'Slim fit black jeans',
    tags: ['casual', 'versatile', 'essential'],
    addedAt: new Date('2023-01-05'),
    lastWorn: new Date('2023-04-28'),
    timesWorn: 20,
    topPairings: ['1', '2', '4'],
    healthStatus: 'balanced',
    suggestedTags: ['slim-fit', 'dark-wash'],
    isPublic: true,
    careInstructions: 'Machine wash cold inside out, hang dry',
    price: 2500,
    isFavorite: false,
    costPerWear: 125,
    aiSuggestedOutfits: ['ai-6', 'ai-7'],
    trendScore: 9,
    personalStyleScore: 8,
  },
  {
    id: '4',
    name: 'Beige Sweater',
    category: 'Tops',
    color: 'Beige',
    season: ['Fall', 'Winter'],
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&h=500&fit=crop',
    brand: 'Uniqlo',
    material: 'Wool',
    description: 'Cozy beige wool sweater',
    tags: ['warm', 'cozy', 'casual'],
    addedAt: new Date('2023-03-12'),
    lastWorn: new Date('2023-04-02'),
    timesWorn: 8,
    topPairings: ['3', '5'],
    healthStatus: 'balanced',
    suggestedTags: ['neutral', 'cozy'],
    isPublic: false,
    careInstructions: 'Hand wash cold, lay flat to dry',
    price: 2200,
    isFavorite: true,
    costPerWear: 275,
    aiSuggestedOutfits: ['ai-8'],
    trendScore: 6,
    personalStyleScore: 9,
  },
  {
    id: '5',
    name: 'Brown Leather Boots',
    category: 'Footwear',
    color: 'Brown',
    season: ['Fall', 'Winter'],
    image: 'https://images.unsplash.com/photo-1542280756-74b2f55e73ab?w=500&h=500&fit=crop',
    brand: 'Timberland',
    material: 'Leather',
    description: 'Classic brown leather boots',
    tags: ['durable', 'versatile', 'formal'],
    addedAt: new Date('2023-02-20'),
    lastWorn: new Date('2023-04-15'),
    timesWorn: 12,
    topPairings: ['4', '6'],
    healthStatus: 'balanced',
    suggestedTags: ['waterproof', 'winter'],
    isPublic: false,
    careInstructions: 'Clean with leather conditioner, air dry',
    price: 6000,
    isFavorite: false,
    costPerWear: 500,
    aiSuggestedOutfits: ['ai-9'],
    trendScore: 8,
    personalStyleScore: 7,
  },
  {
    id: '6',
    name: 'Grey Suit Jacket',
    category: 'Outerwear',
    color: 'Grey',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&h=500&fit=crop',
    brand: 'Calvin Klein',
    material: 'Wool Blend',
    description: 'Professional grey suit jacket',
    tags: ['formal', 'professional', 'elegant'],
    addedAt: new Date('2023-01-25'),
    lastWorn: new Date('2023-04-10'),
    timesWorn: 3,
    topPairings: ['2'],
    healthStatus: 'underused',
    suggestedTags: ['business', 'tailored'],
    isPublic: false,
    careInstructions: 'Dry clean only',
    price: 12000,
    isFavorite: false,
    costPerWear: 4000,
    aiSuggestedOutfits: ['ai-10', 'ai-11'],
    trendScore: 9,
    personalStyleScore: 6,
  },
  {
    id: '7',
    name: 'Red Silk Blouse',
    category: 'Tops',
    color: 'Red',
    season: ['Spring', 'Summer', 'Fall'],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
    brand: 'Zara',
    material: 'Silk',
    description: 'Elegant red silk blouse with button details',
    tags: ['elegant', 'formal', 'silk'],
    addedAt: new Date('2023-03-20'),
    lastWorn: new Date('2023-04-25'),
    timesWorn: 6,
    topPairings: ['3', '9'],
    healthStatus: 'balanced',
    suggestedTags: ['office', 'dressy'],
    isPublic: true,
    careInstructions: 'Dry clean only',
    isFavorite: true,
  },
  {
    id: '8',
    name: 'Navy Blue Blazer',
    category: 'Outerwear',
    color: 'Navy',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    brand: 'Ralph Lauren',
    material: 'Wool',
    description: 'Classic navy blazer for professional wear',
    tags: ['professional', 'classic', 'versatile'],
    addedAt: new Date('2023-02-05'),
    lastWorn: new Date('2023-04-18'),
    timesWorn: 10,
    topPairings: ['2', '7'],
    healthStatus: 'balanced',
    suggestedTags: ['business', 'navy'],
    isPublic: false,
    careInstructions: 'Dry clean recommended',
    isFavorite: false,
  },
  {
    id: '9',
    name: 'Black Pencil Skirt',
    category: 'Bottoms',
    color: 'Black',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d24?w=500&h=500&fit=crop',
    brand: 'H&M',
    material: 'Polyester Blend',
    description: 'Classic black pencil skirt',
    tags: ['formal', 'classic', 'office'],
    addedAt: new Date('2023-01-30'),
    lastWorn: new Date('2023-04-22'),
    timesWorn: 12,
    topPairings: ['7', '8', '2'],
    healthStatus: 'balanced',
    suggestedTags: ['professional', 'fitted'],
    isPublic: true,
    careInstructions: 'Machine wash cold, hang dry',
    isFavorite: true,
  },
  {
    id: '10',
    name: 'White Sneakers',
    category: 'Footwear',
    color: 'White',
    season: ['Spring', 'Summer', 'Fall'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
    brand: 'Adidas',
    material: 'Leather',
    description: 'Clean white leather sneakers',
    tags: ['casual', 'comfortable', 'sporty'],
    addedAt: new Date('2023-03-01'),
    lastWorn: new Date('2023-05-02'),
    timesWorn: 18,
    topPairings: ['2', '3', '1'],
    healthStatus: 'balanced',
    suggestedTags: ['athletic', 'everyday'],
    isPublic: false,
    careInstructions: 'Wipe clean with damp cloth',
    isFavorite: true,
  },
  {
    id: '11',
    name: 'Floral Summer Dress',
    category: 'Dresses',
    color: 'Pink',
    season: ['Spring', 'Summer'],
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop',
    brand: 'Forever 21',
    material: 'Cotton',
    description: 'Light floral print summer dress',
    tags: ['floral', 'casual', 'feminine'],
    addedAt: new Date('2023-04-10'),
    lastWorn: new Date('2023-04-30'),
    timesWorn: 4,
    topPairings: ['10'],
    healthStatus: 'new',
    suggestedTags: ['romantic', 'spring'],
    isPublic: true,
    careInstructions: 'Machine wash cold, tumble dry low',
    isFavorite: false,
  },
  {
    id: '12',
    name: 'Dark Wash Jeans',
    category: 'Bottoms',
    color: 'Blue',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
    brand: 'Levi\'s',
    material: 'Denim',
    description: 'Classic dark wash straight leg jeans',
    tags: ['casual', 'denim', 'classic'],
    addedAt: new Date('2023-01-20'),
    lastWorn: new Date('2023-04-26'),
    timesWorn: 22,
    topPairings: ['2', '1', '4'],
    healthStatus: 'overused',
    suggestedTags: ['straight-leg', 'dark-wash'],
    isPublic: false,
    careInstructions: 'Machine wash cold inside out, hang dry',
    isFavorite: true,
  },
  {
    id: '13',
    name: 'Striped Long Sleeve Tee',
    category: 'Tops',
    color: 'Navy',
    season: ['Spring', 'Fall'],
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
    brand: 'Gap',
    material: 'Cotton',
    description: 'Navy and white striped long sleeve tee',
    tags: ['casual', 'striped', 'basic'],
    addedAt: new Date('2023-02-28'),
    lastWorn: new Date('2023-04-12'),
    timesWorn: 9,
    topPairings: ['3', '12'],
    healthStatus: 'balanced',
    suggestedTags: ['nautical', 'layering'],
    isPublic: true,
    careInstructions: 'Machine wash warm, tumble dry medium',
    isFavorite: false,
  },
  {
    id: '14',
    name: 'Black Ankle Boots',
    category: 'Footwear',
    color: 'Black',
    season: ['Fall', 'Winter', 'Spring'],
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop',
    brand: 'Steve Madden',
    material: 'Leather',
    description: 'Sleek black ankle boots with low heel',
    tags: ['versatile', 'chic', 'ankle'],
    addedAt: new Date('2023-02-15'),
    lastWorn: new Date('2023-04-20'),
    timesWorn: 14,
    topPairings: ['9', '7', '12'],
    healthStatus: 'balanced',
    suggestedTags: ['heeled', 'office'],
    isPublic: false,
    careInstructions: 'Clean with leather conditioner',
    isFavorite: true,
  },
  {
    id: '15',
    name: 'Cream Cardigan',
    category: 'Outerwear',
    color: 'Cream',
    season: ['Fall', 'Winter', 'Spring'],
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
    brand: 'Uniqlo',
    material: 'Cashmere',
    description: 'Soft cream cashmere cardigan',
    tags: ['cozy', 'layering', 'soft'],
    addedAt: new Date('2023-03-05'),
    lastWorn: new Date('2023-04-08'),
    timesWorn: 7,
    topPairings: ['2', '13'],
    healthStatus: 'balanced',
    suggestedTags: ['neutral', 'luxury'],
    isPublic: false,
    careInstructions: 'Hand wash cold, lay flat to dry',
    isFavorite: true,
  },
  {
    id: '16',
    name: 'Green Midi Skirt',
    category: 'Bottoms',
    color: 'Green',
    season: ['Spring', 'Summer', 'Fall'],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
    brand: 'Zara',
    material: 'Polyester',
    description: 'Flowing green midi skirt',
    tags: ['midi', 'flowy', 'colorful'],
    addedAt: new Date('2023-04-01'),
    lastWorn: new Date('2023-04-28'),
    timesWorn: 2,
    topPairings: ['2'],
    healthStatus: 'underused',
    suggestedTags: ['bohemian', 'spring'],
    isPublic: true,
    careInstructions: 'Machine wash cold, hang dry',
    isFavorite: false,
  },
  {
    id: '17',
    name: 'Denim Jacket',
    category: 'Outerwear',
    color: 'Blue',
    season: ['Spring', 'Fall'],
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop',
    brand: 'Gap',
    material: 'Denim',
    description: 'Classic light wash denim jacket',
    tags: ['casual', 'denim', 'layering'],
    addedAt: new Date('2023-03-15'),
    lastWorn: new Date('2023-04-24'),
    timesWorn: 11,
    topPairings: ['11', '2'],
    healthStatus: 'balanced',
    suggestedTags: ['light-wash', 'vintage'],
    isPublic: false,
    careInstructions: 'Machine wash cold, tumble dry low',
    isFavorite: false,
  },
  {
    id: '18',
    name: 'Black Heels',
    category: 'Footwear',
    color: 'Black',
    season: ['All Seasons'],
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop',
    brand: 'Nine West',
    material: 'Patent Leather',
    description: 'Classic black patent leather heels',
    tags: ['formal', 'elegant', 'heels'],
    addedAt: new Date('2023-01-10'),
    lastWorn: new Date('2023-04-15'),
    timesWorn: 5,
    topPairings: ['7', '9'],
    healthStatus: 'underused',
    suggestedTags: ['patent', 'evening'],
    isPublic: false,
    careInstructions: 'Wipe clean with soft cloth',
    isFavorite: false,
  },
  {
    id: '19',
    name: 'Yellow Sundress',
    category: 'Dresses',
    color: 'Yellow',
    season: ['Spring', 'Summer'],
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
    brand: 'Target',
    material: 'Cotton Blend',
    description: 'Bright yellow sundress with tie waist',
    tags: ['bright', 'casual', 'summer'],
    addedAt: new Date('2023-04-15'),
    lastWorn: new Date('2023-05-01'),
    timesWorn: 3,
    topPairings: ['10'],
    healthStatus: 'new',
    suggestedTags: ['sunny', 'cheerful'],
    isPublic: true,
    careInstructions: 'Machine wash cold, tumble dry low',
    isFavorite: true,
  },
  {
    id: '20',
    name: 'Plaid Flannel Shirt',
    category: 'Tops',
    color: 'Red',
    season: ['Fall', 'Winter'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
    brand: 'L.L.Bean',
    material: 'Cotton Flannel',
    description: 'Cozy red plaid flannel shirt',
    tags: ['cozy', 'plaid', 'casual'],
    addedAt: new Date('2023-02-25'),
    lastWorn: new Date('2023-04-05'),
    timesWorn: 8,
    topPairings: ['3', '12'],
    healthStatus: 'balanced',
    suggestedTags: ['lumberjack', 'warm'],
    isPublic: false,
    careInstructions: 'Machine wash warm, tumble dry medium',
    isFavorite: false,
  },
];

// Sample outfits
const sampleOutfits: Outfit[] = [
  {
    id: '1',
    name: 'Casual Friday',
    items: ['1', '2', '3'],
    season: ['Spring', 'Fall'],
    occasion: 'Casual',
    favorite: true,
    createdAt: new Date('2023-02-15'),
    lastWorn: new Date('2023-04-20'),
    recommendationScore: 85,
    reasons: ['Perfect for relaxed office days', 'Comfortable yet stylish']
  },
  {
    id: '2',
    name: 'Business Meeting',
    items: ['2', '6', '3'],
    season: ['All Seasons'],
    occasion: 'Formal',
    favorite: false,
    createdAt: new Date('2023-03-01'),
    lastWorn: new Date('2023-04-15'),
    recommendationScore: 92,
    reasons: ['Professional appearance', 'Weather appropriate']
  },
];

// Helper function to ensure a value is a Date object
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date(); // Fallback to current date
};

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [stylePersonality, setStylePersonalityState] = useState<StylePersonality | null>(null);

  // Load initial data
  useEffect(() => {
    const storedItems = localStorage.getItem('wardrobeItems');
    const storedOutfits = localStorage.getItem('wardrobeOutfits');
    
    // Check if we have valid stored data
    if (storedItems && storedItems !== '[]' && storedItems !== 'null') {
      try {
        // Parse the stored items and ensure dates are Date objects
        const parsedItems = JSON.parse(storedItems);
        if (parsedItems && parsedItems.length > 0) {
          const itemsWithDates = parsedItems.map((item: any) => ({
            ...item,
            addedAt: ensureDate(item.addedAt),
            lastWorn: item.lastWorn ? ensureDate(item.lastWorn) : undefined,
            timesWorn: item.timesWorn || 0,
            topPairings: item.topPairings || [],
            healthStatus: item.healthStatus || 'new',
            suggestedTags: item.suggestedTags || [],
            isPublic: item.isPublic || false,
            isFavorite: item.isFavorite || false,
          }));
          setClothingItems(itemsWithDates);
        } else {
          // If stored data is empty, load sample data
          setClothingItems(sampleClothingItems);
        }
      } catch (error) {
        console.error('Error parsing stored items:', error);
        // If there's an error parsing, load sample data
        setClothingItems(sampleClothingItems);
      }
    } else {
      // No stored data, load sample data
      console.log('Loading sample clothing items:', sampleClothingItems.length);
      setClothingItems(sampleClothingItems);
    }
    
    if (storedOutfits && storedOutfits !== '[]' && storedOutfits !== 'null') {
      try {
        // Parse the stored outfits and ensure dates are Date objects
        const parsedOutfits = JSON.parse(storedOutfits);
        if (parsedOutfits && parsedOutfits.length > 0) {
          const outfitsWithDates = parsedOutfits.map((outfit: any) => ({
            ...outfit,
            createdAt: ensureDate(outfit.createdAt),
            lastWorn: outfit.lastWorn ? ensureDate(outfit.lastWorn) : undefined
          }));
          setOutfits(outfitsWithDates);
        } else {
          // If stored data is empty, load sample data
          setOutfits(sampleOutfits);
        }
      } catch (error) {
        console.error('Error parsing stored outfits:', error);
        // If there's an error parsing, load sample data
        setOutfits(sampleOutfits);
      }
    } else {
      // No stored data, load sample data
      console.log('Loading sample outfits:', sampleOutfits.length);
      setOutfits(sampleOutfits);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('wardrobeItems', JSON.stringify(clothingItems));
    localStorage.setItem('wardrobeOutfits', JSON.stringify(outfits));
  }, [clothingItems, outfits]);

  const addClothingItem = (item: Omit<ClothingItem, 'id' | 'addedAt'>) => {
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date(),
      timesWorn: item.timesWorn || 0,
      topPairings: item.topPairings || [],
      healthStatus: item.healthStatus || 'new',
      suggestedTags: item.suggestedTags || [],
      isPublic: item.isPublic || false,
      isFavorite: item.isFavorite || false,
    };
    setClothingItems([...clothingItems, newItem]);
  };

  const updateClothingItem = (id: string, updatedItem: Partial<ClothingItem>) => {
    setClothingItems(
      clothingItems.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      )
    );
  };

  const removeClothingItem = (id: string) => {
    setClothingItems(clothingItems.filter((item) => item.id !== id));
    // Also remove the item from any outfits
    setOutfits(
      outfits.map((outfit) => ({
        ...outfit,
        items: outfit.items.filter((itemId) => itemId !== id),
      }))
    );
  };

  const getClothingItem = (id: string) => {
    return clothingItems.find((item) => item.id === id);
  };

  // Function to reset to sample data
  const resetToSampleData = () => {
    localStorage.removeItem('wardrobeItems');
    localStorage.removeItem('wardrobeOutfits');
    setClothingItems(sampleClothingItems);
    setOutfits(sampleOutfits);
  };

  const addOutfit = (outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setOutfits([...outfits, newOutfit]);
  };

  const updateOutfit = (id: string, updatedOutfit: Partial<Outfit>) => {
    setOutfits(
      outfits.map((outfit) =>
        outfit.id === id ? { ...outfit, ...updatedOutfit } : outfit
      )
    );
  };

  const removeOutfit = (id: string) => {
    setOutfits(outfits.filter((outfit) => outfit.id !== id));
  };

  // AI recommendation with preferences integration
  const getRecommendedOutfits = (occasion?: string, season?: string) => {
    let filtered = [...outfits];
    
    if (occasion) {
      filtered = filtered.filter((outfit) => outfit.occasion === occasion);
    }
    
    if (season) {
      filtered = filtered.filter((outfit) => 
        outfit.season.includes(season) || outfit.season.includes('All Seasons')
      );
    }

    // Apply preference-based filtering and scoring
    const preferences = wardrobePreferencesService.getPreferences();
    if (preferences) {
      filtered = filtered.map(outfit => {
        const outfitItems = outfit.items.map(id => clothingItems.find(item => item.id === id)).filter(Boolean);
        
        // Calculate preference score based on outfit items
        let preferenceScore = 0;
        let reasonsSet = new Set<string>();
        
        outfitItems.forEach(item => {
          if (item) {
            const itemScore = wardrobePreferencesService.getStyleCompatibilityScore(item.tags, item.category);
            preferenceScore += itemScore;
            
            const context: RecommendationContext = { occasion, season };
            const reasons = wardrobePreferencesService.generateRecommendationReasons(
              item.tags, item.color, context
            );
            reasons.forEach(reason => reasonsSet.add(reason));
          }
        });
        
        return {
          ...outfit,
          recommendationScore: Math.round((preferenceScore / Math.max(outfitItems.length, 1)) * 100),
          reasons: Array.from(reasonsSet)
        };
      });
      
      // Sort by preference score and recency
      filtered.sort((a, b) => {
        const scoreA = a.recommendationScore || 0;
        const scoreB = b.recommendationScore || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        
        const dateA = a.lastWorn ? ensureDate(a.lastWorn) : ensureDate(a.createdAt);
        const dateB = b.lastWorn ? ensureDate(b.lastWorn) : ensureDate(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    } else {
      // Fallback to date sorting if no preferences
      filtered.sort((a, b) => {
        const dateA = a.lastWorn ? ensureDate(a.lastWorn) : ensureDate(a.createdAt);
        const dateB = b.lastWorn ? ensureDate(b.lastWorn) : ensureDate(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    return filtered;
  };

  // Find similar items based on category, color, season
  const getSimilarItems = (itemId: string) => {
    const item = getClothingItem(itemId);
    if (!item) return [];

    return clothingItems
      .filter(
        (other) =>
          other.id !== itemId &&
          (other.category === item.category ||
            other.color === item.color ||
            other.tags.some((tag) => item.tags.includes(tag)))
      )
      .slice(0, 4); // Return top 4 similar items
  };

  // Generate AI outfit suggestions for an item with preferences
  const generateAIOutfits = (itemId: string, occasion?: string) => {
    const item = getClothingItem(itemId);
    if (!item) return [];

    // Get user preferences for better recommendations
    const preferences = wardrobePreferencesService.getPreferences();
    const context: RecommendationContext = { occasion, season: getCurrentSeason() };
    const suggestions = wardrobePreferencesService.getPersonalizedSuggestions(context);

    // Filter compatible items based on preferences
    let compatibleItems = clothingItems.filter(other => 
      other.id !== itemId && 
      other.season.some(s => item.season.includes(s) || s === 'All Seasons')
    );

    // Apply preference filtering
    if (preferences) {
      compatibleItems = wardrobePreferencesService.filterItemsByPreferences(compatibleItems);
      
      // Score and sort items by compatibility
      compatibleItems = compatibleItems.map(compatItem => ({
        ...compatItem,
        compatibilityScore: wardrobePreferencesService.getStyleCompatibilityScore(compatItem.tags, compatItem.category)
      })).sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
    }

    const outfits: Outfit[] = [];
    
    // Generate 3 different outfit combinations
    for (let i = 0; i < 3; i++) {
      const outfitItems = [itemId];
      const reasons: string[] = [];
      
      // Add complementary items based on category and preferences
      if (item.category === 'Tops') {
        const bottoms = compatibleItems.filter(i => i.category === 'Bottoms');
        const footwear = compatibleItems.filter(i => i.category === 'Footwear');
        if (bottoms.length > i) {
          outfitItems.push(bottoms[i].id);
          if (preferences) {
            reasons.push(...wardrobePreferencesService.generateRecommendationReasons(
              bottoms[i].tags, bottoms[i].color, context
            ));
          }
        }
        if (footwear.length > i) {
          outfitItems.push(footwear[i].id);
          if (preferences) {
            reasons.push(...wardrobePreferencesService.generateRecommendationReasons(
              footwear[i].tags, footwear[i].color, context
            ));
          }
        }
      } else if (item.category === 'Bottoms') {
        const tops = compatibleItems.filter(i => i.category === 'Tops');
        const footwear = compatibleItems.filter(i => i.category === 'Footwear');
        if (tops.length > i) {
          outfitItems.push(tops[i].id);
          if (preferences) {
            reasons.push(...wardrobePreferencesService.generateRecommendationReasons(
              tops[i].tags, tops[i].color, context
            ));
          }
        }
        if (footwear.length > i) {
          outfitItems.push(footwear[i].id);
          if (preferences) {
            reasons.push(...wardrobePreferencesService.generateRecommendationReasons(
              footwear[i].tags, footwear[i].color, context
            ));
          }
        }
      }

      // Calculate overall recommendation score
      const avgCompatibility = outfitItems.reduce((sum, id) => {
        const outfitItem = clothingItems.find(ci => ci.id === id);
        return sum + (outfitItem && preferences ? 
          wardrobePreferencesService.getStyleCompatibilityScore(outfitItem.tags, outfitItem.category) : 0.5);
      }, 0) / outfitItems.length;

      outfits.push({
        id: `ai-${itemId}-${i}`,
        name: `AI Outfit ${i + 1} with ${item.name}`,
        items: outfitItems,
        season: item.season,
        occasion: occasion || 'Casual',
        favorite: false,
        createdAt: new Date(),
        recommendationScore: Math.round(avgCompatibility * 100),
        reasons: [...new Set(reasons)].slice(0, 3) // Remove duplicates and limit to 3 reasons
      });
    }

    return outfits;
  };

  // Get comprehensive wardrobe analytics
  const getWardrobeAnalytics = (): WardrobeAnalytics => {
    const totalItems = clothingItems.length;
    const totalValue = clothingItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const itemsWithPrice = clothingItems.filter(item => item.price && item.timesWorn > 0);
    const averageCostPerWear = itemsWithPrice.length > 0 
      ? itemsWithPrice.reduce((sum, item) => sum + (item.costPerWear || 0), 0) / itemsWithPrice.length 
      : 0;

    // Category analysis
    const categoryCount = clothingItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.timesWorn;
      return acc;
    }, {} as Record<string, number>);
    
    const mostWornCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    const leastWornCategory = Object.entries(categoryCount).sort(([,a], [,b]) => a - b)[0]?.[0] || '';

    // Color and brand analysis
    const colorCount = clothingItems.reduce((acc, item) => {
      acc[item.color] = (acc[item.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const brandCount = clothingItems.reduce((acc, item) => {
      if (item.brand) acc[item.brand] = (acc[item.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteColors = Object.entries(colorCount).sort(([,a], [,b]) => b - a).slice(0, 3).map(([color]) => color);
    const favoriteBrands = Object.entries(brandCount).sort(([,a], [,b]) => b - a).slice(0, 3).map(([brand]) => brand);

    // Seasonal distribution
    const seasonalDistribution = clothingItems.reduce((acc, item) => {
      item.season.forEach(season => {
        acc[season] = (acc[season] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Health status breakdown
    const healthStatusBreakdown = clothingItems.reduce((acc, item) => {
      acc[item.healthStatus] = (acc[item.healthStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trend analysis
    const trendAnalysis = {
      onTrend: clothingItems.filter(item => (item.trendScore || 0) >= 8).length,
      classic: clothingItems.filter(item => (item.trendScore || 0) >= 6 && (item.trendScore || 0) < 8).length,
      outdated: clothingItems.filter(item => (item.trendScore || 0) < 6).length,
    };

    return {
      totalItems,
      totalValue,
      averageCostPerWear,
      mostWornCategory,
      leastWornCategory,
      favoriteColors,
      favoriteBrands,
      seasonalDistribution,
      healthStatusBreakdown,
      trendAnalysis,
    };
  };

  // Identify wardrobe gaps
  const getWardrobeGaps = (): string[] => {
    const gaps: string[] = [];
    const categories = clothingItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Essential categories check
    if (!categories['Tops'] || categories['Tops'] < 5) gaps.push('More versatile tops needed');
    if (!categories['Bottoms'] || categories['Bottoms'] < 3) gaps.push('Additional bottoms recommended');
    if (!categories['Footwear'] || categories['Footwear'] < 3) gaps.push('More footwear options needed');
    if (!categories['Outerwear'] || categories['Outerwear'] < 2) gaps.push('Outerwear collection needs expansion');
    
    // Formal wear check
    const formalItems = clothingItems.filter(item => item.tags.includes('formal'));
    if (formalItems.length < 3) gaps.push('Professional/formal wear needed');

    // Color diversity check
    const colors = new Set(clothingItems.map(item => item.color));
    if (colors.size < 5) gaps.push('More color variety recommended');

    return gaps;
  };

  // Cost per wear analysis
  const getCostPerWearAnalysis = (): ClothingItem[] => {
    return clothingItems
      .filter(item => item.price && item.timesWorn > 0)
      .map(item => ({
        ...item,
        costPerWear: item.price! / item.timesWorn
      }))
      .sort((a, b) => (b.costPerWear || 0) - (a.costPerWear || 0));
  };

  // Advanced outfit analytics
  const getOutfitAnalytics = (): OutfitAnalytics => {
    const totalOutfits = outfits.length;
    const outfitsWithCPW = outfits.filter(outfit => outfit.totalCostPerWear);
    const averageOutfitCPW = outfitsWithCPW.length > 0 
      ? outfitsWithCPW.reduce((sum, outfit) => sum + (outfit.totalCostPerWear || 0), 0) / outfitsWithCPW.length 
      : 0;

    const wornOutfits = outfits.filter(outfit => outfit.lastWorn);
    const mostWornOutfit = wornOutfits.sort((a, b) => {
      const aWorn = a.lastWorn ? new Date(a.lastWorn).getTime() : 0;
      const bWorn = b.lastWorn ? new Date(b.lastWorn).getTime() : 0;
      return bWorn - aWorn;
    })[0] || null;

    const leastWornOutfit = wornOutfits.sort((a, b) => {
      const aWorn = a.lastWorn ? new Date(a.lastWorn).getTime() : Date.now();
      const bWorn = b.lastWorn ? new Date(b.lastWorn).getTime() : Date.now();
      return aWorn - bWorn;
    })[0] || null;

    // Style distribution
    const styleDistribution = outfits.reduce((acc, outfit) => {
      acc[outfit.occasion] = (acc[outfit.occasion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Color analysis from outfit items
    const outfitColors = outfits.flatMap(outfit => 
      outfit.items.map(itemId => clothingItems.find(item => item.id === itemId)?.color).filter(Boolean)
    );
    const colorCount = outfitColors.reduce((acc, color) => {
      if (color) acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedColors = Object.entries(colorCount).sort(([,a], [,b]) => b - a);
    const colorAnalysis = {
      dominant: sortedColors.slice(0, 3).map(([color]) => color),
      trending: sortedColors.slice(3, 6).map(([color]) => color),
      underused: sortedColors.slice(-3).map(([color]) => color),
    };

    // Freshness scores
    const now = new Date();
    const freshnessScores = outfits.reduce((acc, outfit) => {
      const daysSinceWorn = outfit.lastWorn 
        ? Math.floor((now.getTime() - new Date(outfit.lastWorn).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceWorn <= 7) acc.fresh++;
      else if (daysSinceWorn <= 30) acc.stale++;
      else acc.overdue++;
      
      return acc;
    }, { fresh: 0, stale: 0, overdue: 0 });

    return {
      totalOutfits,
      averageOutfitCPW,
      mostWornOutfit,
      leastWornOutfit,
      styleDistribution,
      colorAnalysis,
      freshnessScores,
    };
  };

  // Rate AI outfit suggestions
  const rateAIOutfit = (outfitId: string, rating: number) => {
    setOutfits(outfits.map(outfit => 
      outfit.id === outfitId ? { ...outfit, aiRating: rating } : outfit
    ));
  };

  // Schedule outfit for specific date
  const scheduleOutfit = (outfitId: string, date: Date, eventType: string) => {
    setOutfits(outfits.map(outfit => 
      outfit.id === outfitId ? { ...outfit, scheduledDate: date } : outfit
    ));
    
    addCalendarEvent({
      date,
      title: `Outfit: ${outfits.find(o => o.id === outfitId)?.name}`,
      type: eventType as any,
      outfitId,
    });
  };

  // Set user style personality
  const setStylePersonality = (personality: StylePersonality) => {
    setStylePersonalityState(personality);
    localStorage.setItem('stylePersonality', JSON.stringify(personality));
  };

  // Add calendar event
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      title: event.title || `Outfit for ${event.eventType}`
    };
    setCalendarEvents([...calendarEvents, newEvent]);
  };

  // Get outfit for specific date
  const getOutfitForDate = (date: Date): Outfit | null => {
    const event = calendarEvents.find(e => 
      e.date.toDateString() === date.toDateString() && e.outfitId
    );
    return event ? outfits.find(o => o.id === event.outfitId) || null : null;
  };

  // Get Masumi AI recommendations
  const getMasumiRecommendations = async (occasion?: string, season?: string): Promise<MasumiRecommendation[]> => {
    const currentSeason = season || getCurrentSeason();
    
    const request = {
      userPreferences: {
        favoriteColors: getWardrobeAnalytics().favoriteColors,
        preferredStyles: ['casual', 'elegant'], // Can be derived from user behavior
        lifestyle: 'professional' // Can be set by user
      },
      wardrobeItems: clothingItems.map(item => ({
        id: item.id,
        category: item.category,
        color: item.color,
        season: item.season,
        tags: item.tags
      })),
      context: {
        occasion: occasion || 'Casual',
        season: currentSeason,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
      }
    };

    return await masumiService.getOutfitRecommendations(request);
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  // Generate packing list for travel
  const generatePackingList = (startDate: Date, endDate: Date, destination: string): ClothingItem[] => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const essentials = clothingItems.filter(item => 
      item.tags.includes('essential') || item.category === 'Tops' || item.category === 'Bottoms'
    );
    
    // Basic packing logic - can be enhanced with weather API
    const packingList = [];
    const topCount = Math.min(days + 2, essentials.filter(i => i.category === 'Tops').length);
    const bottomCount = Math.min(Math.ceil(days / 2), essentials.filter(i => i.category === 'Bottoms').length);
    
    packingList.push(...essentials.filter(i => i.category === 'Tops').slice(0, topCount));
    packingList.push(...essentials.filter(i => i.category === 'Bottoms').slice(0, bottomCount));
    packingList.push(...essentials.filter(i => i.category === 'Footwear').slice(0, 2));
    
    return packingList;
  };

  // Import items from images folder
  const importImageItems = () => {
    console.log('Importing image items...', imageClothingItems.length);
    
    // Add all image items to wardrobe
    const itemsWithIds = imageClothingItems.map((item, index) => ({
      ...item,
      id: `img-${Date.now()}-${index}`,
      addedAt: new Date()
    }));
    
    console.log('Items with IDs:', itemsWithIds);
    
    // Force add items (remove duplicate check for now)
    setClothingItems(prev => {
      console.log('Previous items:', prev.length);
      const newItems = [...prev, ...itemsWithIds];
      console.log('New total items:', newItems.length);
      return newItems;
    });
    
    // Create matching outfits
    const outfitsWithIds = matchingOutfits.map((outfit, index) => {
      const itemIds = outfit.items.map(itemName => {
        const foundItem = itemsWithIds.find(item => item.name === itemName);
        return foundItem?.id || '';
      }).filter(Boolean);
      
      return {
        id: `outfit-${Date.now()}-${index}`,
        name: outfit.name,
        items: itemIds,
        season: outfit.season,
        occasion: outfit.occasion,
        favorite: outfit.favorite,
        createdAt: new Date(),
        reasons: [outfit.description]
      };
    });
    
    console.log('Outfits with IDs:', outfitsWithIds);
    
    setOutfits(prev => {
      console.log('Previous outfits:', prev.length);
      const newOutfits = [...prev, ...outfitsWithIds];
      console.log('New total outfits:', newOutfits.length);
      return newOutfits;
    });
  };

  return (
    <WardrobeContext.Provider
      value={{
        clothingItems,
        outfits,
        addClothingItem,
        updateClothingItem,
        removeClothingItem,
        getClothingItem,
        addOutfit,
        updateOutfit,
        removeOutfit,
        getRecommendedOutfits,
        getSimilarItems,
        generateAIOutfits,
        getWardrobeAnalytics,
        getWardrobeGaps,
        getCostPerWearAnalysis,
        getOutfitAnalytics,
        rateAIOutfit,
        scheduleOutfit,
        setStylePersonality,
        addCalendarEvent,
        getOutfitForDate,
        generatePackingList,
        resetToSampleData,
        getMasumiRecommendations,
        calendarEvents,
        stylePersonality,
        importImageItems,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
