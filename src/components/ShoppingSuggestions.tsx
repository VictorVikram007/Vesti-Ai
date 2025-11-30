import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWardrobe } from '@/context/WardrobeContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, ExternalLink, Search, Filter, Star, TrendingUp, Heart, MapPin } from 'lucide-react';

interface ShoppingSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  retailers: Retailer[];
  image: string;
  rating: number;
  reviews: number;
  trending: boolean;
  inStock: boolean;
  colors: string[];
  sizes: string[];
  description: string;
  tags: string[];
}

interface Retailer {
  name: string;
  url: string;
  price: string;
  inStock: boolean;
  rating: number;
  delivery: string;
}

const shoppingItems: ShoppingItem[] = [
  {
    id: '1',
    name: 'Classic White Oxford Shirt',
    category: 'Shirts',
    price: '₹1,200',
    originalPrice: '₹2,000',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    rating: 4.5,
    reviews: 128,
    trending: true,
    inStock: true,
    colors: ['White', 'Light Blue', 'Pink'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A timeless Oxford shirt perfect for any occasion. Made from premium cotton for comfort and durability.',
    tags: ['formal', 'classic', 'versatile'],
    retailers: [
      {
        name: 'H&M',
        url: 'https://www2.hm.com/en_in/productpage.0984564001.html',
        price: '₹1,200',
        inStock: true,
        rating: 4.3,
        delivery: '2-3 days'
      },
      {
        name: 'Uniqlo',
        url: 'https://www.uniqlo.com/in/en/products/E450234-000',
        price: '₹1,500',
        inStock: true,
        rating: 4.6,
        delivery: '1-2 days'
      },
      {
        name: 'Van Heusen',
        url: 'https://www.vanheusenindia.com/shirts/formal-shirts',
        price: '₹1,800',
        inStock: true,
        rating: 4.4,
        delivery: '3-4 days'
      }
    ]
  },
  {
    id: '2',
    name: 'Slim Fit Dark Denim Jeans',
    category: 'Pants',
    price: '₹2,500',
    originalPrice: '₹3,500',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
    rating: 4.3,
    reviews: 89,
    trending: false,
    inStock: true,
    colors: ['Dark Blue', 'Black'],
    sizes: ['30', '32', '34', '36'],
    description: 'Premium denim jeans with perfect stretch and comfort. Ideal for both casual and smart-casual looks.',
    tags: ['denim', 'casual', 'versatile'],
    retailers: [
      {
        name: 'Levi\'s',
        url: 'https://www.levi.in/jeans/mens-jeans',
        price: '₹2,500',
        inStock: true,
        rating: 4.5,
        delivery: '2-3 days'
      },
      {
        name: 'Myntra',
        url: 'https://www.myntra.com/jeans',
        price: '₹2,200',
        inStock: true,
        rating: 4.2,
        delivery: '1-2 days'
      }
    ]
  },
  {
    id: '3',
    name: 'Navy Blue Blazer',
    category: 'Outerwear',
    price: '₹4,500',
    originalPrice: '₹6,000',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    rating: 4.7,
    reviews: 56,
    trending: true,
    inStock: true,
    colors: ['Navy Blue', 'Black', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A sophisticated blazer that transitions seamlessly from office to evening events.',
    tags: ['formal', 'professional', 'elegant'],
    retailers: [
      {
        name: 'Zara',
        url: 'https://www.zara.com/in/en/men-blazers-l1066.html',
        price: '₹4,500',
        inStock: true,
        rating: 4.4,
        delivery: '3-4 days'
      },
      {
        name: 'H&M',
        url: 'https://www2.hm.com/en_in/men/products/clothing/blazers.html',
        price: '₹3,800',
        inStock: true,
        rating: 4.1,
        delivery: '2-3 days'
      }
    ]
  },
  {
    id: '4',
    name: 'Leather Oxford Shoes',
    category: 'Footwear',
    price: '₹3,500',
    originalPrice: '₹5,000',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    rating: 4.6,
    reviews: 203,
    trending: false,
    inStock: true,
    colors: ['Brown', 'Black'],
    sizes: ['7', '8', '9', '10'],
    description: 'Handcrafted leather Oxford shoes with superior comfort and timeless style.',
    tags: ['formal', 'leather', 'classic'],
    retailers: [
      {
        name: 'Bata',
        url: 'https://www.bata.in/men/shoes/formal-shoes',
        price: '₹3,500',
        inStock: true,
        rating: 4.3,
        delivery: '2-3 days'
      },
      {
        name: 'Amazon',
        url: 'https://www.amazon.in/s?k=oxford+shoes+men',
        price: '₹3,200',
        inStock: true,
        rating: 4.4,
        delivery: '1-2 days'
      }
    ]
  },
  {
    id: '5',
    name: 'Cotton Crew Neck Sweater',
    category: 'Sweaters',
    price: '₹1,800',
    originalPrice: '₹2,500',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    rating: 4.4,
    reviews: 167,
    trending: true,
    inStock: true,
    colors: ['Gray', 'Navy', 'Burgundy'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Soft cotton sweater perfect for layering. Comfortable and stylish for any casual occasion.',
    tags: ['casual', 'comfortable', 'layering'],
    retailers: [
      {
        name: 'Uniqlo',
        url: 'https://www.uniqlo.com/in/en/products/E450234-000',
        price: '₹1,800',
        inStock: true,
        rating: 4.5,
        delivery: '1-2 days'
      },
      {
        name: 'H&M',
        url: 'https://www2.hm.com/en_in/men/products/clothing/sweaters.html',
        price: '₹1,600',
        inStock: true,
        rating: 4.2,
        delivery: '2-3 days'
      }
    ]
  }
];

const categories = ['All', 'Shirts', 'Pants', 'Outerwear', 'Footwear', 'Sweaters', 'Accessories'];
const priceRanges = ['All', 'Under ₹1,000', '₹1,000 - ₹2,000', '₹2,000 - ₹5,000', 'Above ₹5,000'];

export const ShoppingSuggestions: React.FC<ShoppingSuggestionsProps> = ({
  open,
  onOpenChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const { toast } = useToast();

  const handleRetailerClick = (retailer: Retailer, itemName: string) => {
    // In a real app, you might want to track this click
    toast({
      title: "Opening retailer",
      description: `Redirecting to ${retailer.name} for ${itemName}`
    });
    
    // Open in new tab
    window.open(retailer.url, '_blank');
  };

  const filteredItems = shoppingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    const matchesPrice = selectedPriceRange === 'All' || (() => {
      const price = parseInt(item.price.replace('₹', '').replace(',', ''));
      switch (selectedPriceRange) {
        case 'Under ₹1,000': return price < 1000;
        case '₹1,000 - ₹2,000': return price >= 1000 && price <= 2000;
        case '₹2,000 - ₹5,000': return price >= 2000 && price <= 5000;
        case 'Above ₹5,000': return price > 5000;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return parseInt(a.price.replace('₹', '').replace(',', '')) - parseInt(b.price.replace('₹', '').replace(',', ''));
      case 'price-high':
        return parseInt(b.price.replace('₹', '').replace(',', '')) - parseInt(a.price.replace('₹', '').replace(',', ''));
      default:
        return 0;
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-wardrobe-teal" />
            Shopping Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(range => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  {item.trending && (
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {item.originalPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      {Math.round(((parseInt(item.originalPrice.replace('₹', '').replace(',', '')) - parseInt(item.price.replace('₹', '').replace(',', ''))) / parseInt(item.originalPrice.replace('₹', '').replace(',', ''))) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{item.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({item.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">{item.originalPrice}</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Available at:</p>
                      {item.retailers.map((retailer, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{retailer.name}</span>
                            <span className="text-sm text-muted-foreground">• {retailer.delivery}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{retailer.price}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetailerClick(retailer, item.name)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
