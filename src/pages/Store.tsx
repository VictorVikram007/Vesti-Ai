import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Sparkles, Zap, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "subscription" | "product";
}

const Store = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "Basic wardrobe management",
        "Simple outfit suggestions", 
        "Up to 50 clothing items",
        "Basic color analysis"
      ],
      popular: false
    },
    {
      id: "premium", 
      name: "Premium",
      price: { monthly: 799, yearly: 7999 },
      description: "Advanced AI styling features",
      features: [
        "Unlimited clothing items",
        "AI-powered recommendations",
        "Weather-based suggestions",
        "Advanced analytics",
        "Personal style insights",
        "Priority support"
      ],
      popular: true
    },
    {
      id: "pro",
      name: "Pro Stylist", 
      price: { monthly: 1599, yearly: 15999 },
      description: "Professional styling services",
      features: [
        "Everything in Premium",
        "1-on-1 virtual stylist sessions",
        "Custom style reports",
        "Wardrobe audit service",
        "Shopping assistance",
        "Exclusive brand partnerships"
      ],
      popular: false
    }
  ];

  const products = [
    {
      id: "style-report",
      name: "Personal Style Report",
      price: 2999,
      description: "Detailed AI analysis of your style",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop"
    },
    {
      id: "wardrobe-audit",
      name: "Virtual Wardrobe Audit", 
      price: 4999,
      description: "Professional wardrobe assessment",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop"
    }
  ];

  const addToCart = (item: any, type: "subscription" | "product") => {
    const price = type === "subscription" ? item.price[billingCycle] : item.price;
    if (price === 0) return;

    const cartItem: CartItem = {
      id: `${item.id}-${type}-${billingCycle}`,
      name: type === "subscription" ? `${item.name} (${billingCycle})` : item.name,
      price,
      quantity: 1,
      type
    };

    setCartItems(prev => {
      const existing = prev.find(i => i.id === cartItem.id);
      if (existing) {
        return prev.map(i => i.id === cartItem.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, cartItem];
    });

    toast({
      title: "Added to Cart",
      description: `${cartItem.name} added successfully`
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? {...item, quantity} : item));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleMasumiCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      });
      return;
    }

    // Navigate to Masumi checkout page
    navigate('/checkout', { 
      state: { 
        items: cartItems,
        total 
      } 
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-wardrobe-navy mb-2">Vesti AI Store</h1>
        <p className="text-lg text-muted-foreground">Premium styling plans and services</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="services">Services & Products</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-center gap-4">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              onClick={() => setBillingCycle("yearly")}
              className="relative"
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500">Save 17%</Badge>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-wardrobe-teal shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-wardrobe-teal text-white px-4 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      ₹{plan.price[billingCycle].toLocaleString('en-IN')}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    onClick={() => addToCart(plan, "subscription")}
                    disabled={plan.price[billingCycle] === 0}
                  >
                    {plan.id === "premium" && <Sparkles className="h-4 w-4 mr-2" />}
                    {plan.id === "pro" && <Zap className="h-4 w-4 mr-2" />}
                    {plan.price[billingCycle] === 0 ? "Current Plan" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <p className="text-muted-foreground text-sm">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-wardrobe-teal">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <Button onClick={() => addToCart(product, "product")}>
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cart Section */}
      {cartItems.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart ({cartItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.price.toLocaleString('en-IN')} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, 0)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total: ₹{total.toLocaleString('en-IN')}</span>
                <Button 
                  onClick={handleMasumiCheckout}
                  className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
                  size="lg"
                >
                  Pay with Masumi
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Secure payments powered by Masumi • All prices in Indian Rupees
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Store;