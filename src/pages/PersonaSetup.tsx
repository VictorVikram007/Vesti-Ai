import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { Sparkles, User, Palette, Shirt } from "lucide-react";

interface PersonaData {
  height: number;
  weight: number;
  gender: string;
  skinUndertone: string;
  bodyType: string;
  styleProfile: string;
  likedColors: string[];
  dislikedColors: string[];
  occasions: string[];
  bodyTypeDetails: string;
  preferredFit: string;
  budgetRange: string;
  sustainabilityPreference: boolean;
  weatherSensitivity: string;
  activityLevel: string;
  colorTemperature: string;
  avoidPatterns: string[];
}

const PersonaSetup = () => {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState<PersonaData>({
    height: 170,
    weight: 70,
    gender: "",
    skinUndertone: "",
    bodyType: "",
    styleProfile: settings.wardrobe.styleProfile || "",
    likedColors: settings.wardrobe.likedColors || [],
    dislikedColors: settings.wardrobe.dislikedColors || [],
    occasions: settings.wardrobe.occasions || [],
    bodyTypeDetails: settings.wardrobe.bodyType || "",
    preferredFit: settings.wardrobe.preferredFit || "",
    budgetRange: settings.wardrobe.budgetRange || "",
    sustainabilityPreference: settings.wardrobe.sustainabilityPreference || false,
    weatherSensitivity: settings.wardrobe.weatherSensitivity || "",
    activityLevel: settings.wardrobe.activityLevel || "",
    colorTemperature: settings.wardrobe.colorTemperature || "",
    avoidPatterns: settings.wardrobe.avoidPatterns || []
  });

  const bodyTypes = [
    { id: "ectomorph", name: "Ectomorph", icon: "🏃", description: "Lean, long limbs, fast metabolism" },
    { id: "mesomorph", name: "Mesomorph", icon: "💪", description: "Athletic build, well-defined muscles" },
    { id: "endomorph", name: "Endomorph", icon: "🧸", description: "Rounder physique, slower metabolism" }
  ];

  const skinTones = [
    { id: "fair", name: "Fair", colors: ["#FDBCB4", "#EAA9A0", "#F2C2A7", "#E8B5A2"] },
    { id: "light", name: "Light", colors: ["#E8B5A2", "#D4A574", "#C8956D", "#B8956D"] },
    { id: "medium", name: "Medium", colors: ["#C8956D", "#A67C52", "#8D5524", "#704214"] },
    { id: "tan", name: "Tan", colors: ["#8D5524", "#704214", "#5C2E04", "#4A1F04"] },
    { id: "deep", name: "Deep", colors: ["#4A1F04", "#3C1A03", "#2E1503", "#1F0E02"] }
  ];

  const [selectedSkinTone, setSelectedSkinTone] = useState("");

  const styleOptions = ["Casual", "Formal", "Minimalist", "Streetwear", "Bohemian", "Athleisure"];
  const occasionOptions = ["Work", "Casual", "Date night", "Special events", "Travel"];
  const palette = ["Black", "White", "Navy", "Beige", "Grey", "Blue", "Green", "Red", "Yellow", "Purple"];
  const fitOptions = ["Tight", "Fitted", "Regular", "Loose", "Oversized"];
  const budgetOptions = ["Low", "Medium", "High", "Luxury"];
  const weatherOptions = ["Very sensitive", "Sensitive", "Normal", "Not sensitive"];
  const activityOptions = ["Low", "Moderate", "High", "Very high"];
  const colorTempOptions = ["Warm", "Cool", "Neutral"];
  const patternOptions = ["Stripes", "Polka dots", "Floral", "Geometric", "Animal print", "Plaid"];

  const handleSubmit = async () => {
    try {
      // Update settings with the new data
      updateSettings({
        ...settings,
        wardrobe: {
          ...settings.wardrobe,
          styleProfile: formData.styleProfile,
          likedColors: formData.likedColors,
          dislikedColors: formData.dislikedColors,
          occasions: formData.occasions,
          bodyType: formData.bodyTypeDetails,
          preferredFit: formData.preferredFit,
          budgetRange: formData.budgetRange,
          sustainabilityPreference: formData.sustainabilityPreference,
          weatherSensitivity: formData.weatherSensitivity,
          activityLevel: formData.activityLevel,
          colorTemperature: formData.colorTemperature,
          avoidPatterns: formData.avoidPatterns
        }
      });

      // Optional: Try to send to backend if available
      try {
        await fetch('/api/v1/save-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (apiError) {
        console.log('Backend API not available, data saved locally');
      }

      toast({
        title: "Style Persona Created! ✨",
        description: "Your personalized fashion profile has been analyzed and saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your style persona. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-wardrobe-navy flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-wardrobe-teal" />
          Fashion Persona Setup
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's create your personalized style profile for AI-powered recommendations
        </p>
      </div>

      {/* Physical Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Physical Attributes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Height: {formData.height} cm</Label>
              <input
                type="range"
                min="140"
                max="210"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                className="w-20"
              />
            </div>
            <div className="space-y-3">
              <Label>Weight: {formData.weight} kg</Label>
              <input
                type="range"
                min="40"
                max="150"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Gender</Label>
            <div className="flex gap-4">
              {["Male", "Female", "Other"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-4 h-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Style Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Visual Style Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select Your Skin Tone</Label>
              <div className="space-y-3">
                {skinTones.map((tone) => (
                  <div key={tone.id} className="space-y-2">
                    <h4 className="font-medium text-sm">{tone.name}</h4>
                    <div className="flex gap-2">
                      {tone.colors.map((color, index) => (
                        <div
                          key={`${tone.id}-${index}`}
                          onClick={() => setSelectedSkinTone(color)}
                          className={`w-10 h-10 rounded-full cursor-pointer border-3 transition-all hover:scale-110 ${
                            selectedSkinTone === color ? 'border-wardrobe-teal shadow-lg' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Skin Undertone</Label>
              <div className="flex gap-4">
                {["Cool", "Warm", "Neutral"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="undertone"
                      value={option.toLowerCase()}
                      checked={formData.skinUndertone === option.toLowerCase()}
                      onChange={(e) => setFormData({...formData, skinUndertone: e.target.value})}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Body Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {bodyTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setFormData({...formData, bodyType: type.id, bodyTypeDetails: type.name})}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    formData.bodyType === type.id ? 'border-wardrobe-teal bg-wardrobe-teal/10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-medium text-sm">{type.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Style Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Style Profile</Label>
              <Select value={formData.styleProfile} onValueChange={(v) => setFormData({...formData, styleProfile: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Fit</Label>
              <Select value={formData.preferredFit} onValueChange={(v) => setFormData({...formData, preferredFit: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fit" />
                </SelectTrigger>
                <SelectContent>
                  {fitOptions.map((fit) => (<SelectItem key={fit} value={fit}>{fit}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Occasions</Label>
            <div className="grid grid-cols-2 gap-2">
              {occasionOptions.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formData.occasions.includes(o)}
                    onCheckedChange={(c) => {
                      const next = new Set(formData.occasions);
                      c ? next.add(o) : next.delete(o);
                      setFormData({...formData, occasions: Array.from(next)});
                    }}
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Liked Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                {palette.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.likedColors.includes(c)}
                      onCheckedChange={(v) => {
                        const next = new Set(formData.likedColors);
                        v ? next.add(c) : next.delete(c);
                        setFormData({...formData, likedColors: Array.from(next)});
                      }}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avoid Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                {palette.map((c) => (
                  <label key={`dis-${c}`} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.dislikedColors.includes(c)}
                      onCheckedChange={(v) => {
                        const next = new Set(formData.dislikedColors);
                        v ? next.add(c) : next.delete(c);
                        setFormData({...formData, dislikedColors: Array.from(next)});
                      }}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select value={formData.budgetRange} onValueChange={(v) => setFormData({...formData, budgetRange: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((budget) => (<SelectItem key={budget} value={budget}>{budget}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Weather Sensitivity</Label>
              <Select value={formData.weatherSensitivity} onValueChange={(v) => setFormData({...formData, weatherSensitivity: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((weather) => (<SelectItem key={weather} value={weather}>{weather}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={formData.activityLevel} onValueChange={(v) => setFormData({...formData, activityLevel: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityOptions.map((activity) => (<SelectItem key={activity} value={activity}>{activity}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color Temperature</Label>
              <Select value={formData.colorTemperature} onValueChange={(v) => setFormData({...formData, colorTemperature: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color temperature" />
                </SelectTrigger>
                <SelectContent>
                  {colorTempOptions.map((temp) => (<SelectItem key={temp} value={temp}>{temp}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sustainability Preference</p>
                <p className="text-sm text-muted-foreground">Prioritize eco-friendly choices</p>
              </div>
              <Switch 
                checked={formData.sustainabilityPreference} 
                onCheckedChange={(v) => setFormData({...formData, sustainabilityPreference: !!v})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avoid Patterns</Label>
            <div className="grid grid-cols-2 gap-2">
              {patternOptions.map((pattern) => (
                <label key={pattern} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formData.avoidPatterns.includes(pattern)}
                    onCheckedChange={(v) => {
                      const next = new Set(formData.avoidPatterns);
                      v ? next.add(pattern) : next.delete(pattern);
                      setFormData({...formData, avoidPatterns: Array.from(next)});
                    }}
                  />
                  {pattern}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button 
          onClick={handleSubmit}
          className="bg-wardrobe-teal hover:bg-wardrobe-teal/90 text-white px-8 py-3 text-lg"
          size="lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Analyze My Style
        </Button>
      </div>
    </div>
  );
};

export default PersonaSetup;