import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

const Pricing = () => {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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
        "Basic color analysis",
        "Community access"
      ],
      popular: false,
      buttonText: "Current Plan",
      buttonVariant: "outline" as const
    },
    {
      id: "premium",
      name: "Premium",
      price: { monthly: 9.99, yearly: 99.99 },
      description: "Advanced AI styling features",
      features: [
        "Unlimited clothing items",
        "AI-powered outfit recommendations",
        "Weather-based suggestions",
        "Advanced analytics",
        "Personal style insights",
        "Priority support",
        "Trend forecasting"
      ],
      popular: true,
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const
    },
    {
      id: "pro",
      name: "Pro Stylist",
      price: { monthly: 19.99, yearly: 199.99 },
      description: "Professional styling services",
      features: [
        "Everything in Premium",
        "1-on-1 virtual stylist sessions",
        "Custom style reports",
        "Wardrobe audit service",
        "Shopping assistance",
        "Exclusive brand partnerships",
        "Early trend access"
      ],
      popular: false,
      buttonText: "Go Pro",
      buttonVariant: "default" as const
    }
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      // Integrate with Masumi payment service
      const response = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          paymentProvider: 'masumi'
        })
      });

      if (response.ok) {
        toast({
          title: "Subscription Activated! ✨",
          description: `Welcome to ${plans.find(p => p.id === planId)?.name}!`
        });
      }
    } catch (error) {
      toast({
        title: "Payment Processing",
        description: "Redirecting to secure payment...",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-wardrobe-navy">
          Choose Your Style Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Unlock the full potential of AI-powered fashion assistance
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
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
                  ${plan.price[billingCycle]}
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
                variant={plan.buttonVariant}
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === "free"}
              >
                {plan.id === "premium" && <Sparkles className="h-4 w-4 mr-2" />}
                {plan.id === "pro" && <Zap className="h-4 w-4 mr-2" />}
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
        <p>Secure payments powered by Masumi</p>
      </div>
    </div>
  );
};

export default Pricing;