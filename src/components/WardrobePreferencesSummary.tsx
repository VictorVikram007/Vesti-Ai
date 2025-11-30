import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWardrobePreferences } from '@/services/wardrobePreferencesService';
import { Palette, User, Activity, Thermometer, DollarSign, Leaf } from 'lucide-react';

interface WardrobePreferencesSummaryProps {
  showTitle?: boolean;
  compact?: boolean;
}

export const WardrobePreferencesSummary: React.FC<WardrobePreferencesSummaryProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const { preferences } = useWardrobePreferences();

  if (!preferences) {
    return null;
  }

  const PreferenceSection = ({ 
    icon: Icon, 
    title, 
    items, 
    color = "default" 
  }: { 
    icon: React.ElementType; 
    title: string; 
    items: string[]; 
    color?: "default" | "secondary" | "destructive" | "outline";
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Badge key={index} variant={color} className="text-xs">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Not specified</span>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Style:</span>
            <p className="text-sm">{preferences.styleProfile}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Fit:</span>
            <p className="text-sm">{preferences.preferredFit}</p>
          </div>
        </div>
        {preferences.likedColors.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Preferred Colors:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {preferences.likedColors.slice(0, 4).map((color, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {color}
                </Badge>
              ))}
              {preferences.likedColors.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{preferences.likedColors.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Style Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            These preferences help our AI provide personalized recommendations
          </p>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Style Profile
            </div>
            <Badge variant="default" className="text-sm">
              {preferences.styleProfile}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Preferred Fit
            </div>
            <Badge variant="secondary" className="text-sm">
              {preferences.preferredFit}
            </Badge>
          </div>
        </div>

        <PreferenceSection
          icon={Palette}
          title="Preferred Colors"
          items={preferences.likedColors}
          color="secondary"
        />

        {preferences.dislikedColors.length > 0 && (
          <PreferenceSection
            icon={Palette}
            title="Colors to Avoid"
            items={preferences.dislikedColors}
            color="destructive"
          />
        )}

        <PreferenceSection
          icon={Activity}
          title="Occasions"
          items={preferences.occasions}
          color="outline"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Activity Level
            </div>
            <Badge variant="outline" className="text-sm">
              {preferences.activityLevel}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              Weather Sensitivity
            </div>
            <Badge variant="outline" className="text-sm">
              {preferences.weatherSensitivity}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </div>
            <Badge variant="outline" className="text-sm">
              {preferences.budgetRange}
            </Badge>
          </div>
        </div>

        {preferences.bodyType !== 'Not specified' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Body Type
            </div>
            <Badge variant="secondary" className="text-sm">
              {preferences.bodyType}
            </Badge>
          </div>
        )}

        {preferences.avoidPatterns.length > 0 && (
          <PreferenceSection
            icon={Palette}
            title="Patterns to Avoid"
            items={preferences.avoidPatterns}
            color="destructive"
          />
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Sustainability Preference</span>
          </div>
          <Badge variant={preferences.sustainabilityPreference ? "default" : "outline"}>
            {preferences.sustainabilityPreference ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">How this helps:</p>
          <ul className="space-y-1">
            <li>• AI recommendations are tailored to your style and preferences</li>
            <li>• Outfit suggestions consider your activity level and weather sensitivity</li>
            <li>• Color combinations match your preferred palette</li>
            <li>• Shopping suggestions align with your budget and sustainability goals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WardrobePreferencesSummary;