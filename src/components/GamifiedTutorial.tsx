import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Gift, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action: string;
  points: number;
  badge?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Vesti AI! 👋',
    description: 'Your personal fashion assistant is ready to help you organize and style your wardrobe.',
    target: 'dashboard',
    action: 'Click "Start Journey" to begin',
    points: 50,
    badge: 'Fashion Explorer'
  },
  {
    id: 'add-first-item',
    title: 'Add Your First Item 👕',
    description: 'Let\'s start building your digital wardrobe! Add your first clothing item.',
    target: 'add-item-button',
    action: 'Click "Add New Item" or use sample data',
    points: 100,
    badge: 'Wardrobe Builder'
  },
  {
    id: 'take-style-quiz',
    title: 'Discover Your Style 🎨',
    description: 'Take our style personality quiz to get personalized recommendations.',
    target: 'style-quiz-button',
    action: 'Complete the Style Quiz',
    points: 150,
    badge: 'Style Guru'
  },
  {
    id: 'set-preferences',
    title: 'Customize Preferences ⚙️',
    description: 'Set your wardrobe preferences for better AI recommendations.',
    target: 'settings-link',
    action: 'Update your preferences in Settings',
    points: 100,
    badge: 'Preference Master'
  },
  {
    id: 'create-outfit',
    title: 'Create Your First Outfit 👗',
    description: 'Combine items to create a stunning outfit combination.',
    target: 'outfits-page',
    action: 'Create or save an outfit',
    points: 200,
    badge: 'Outfit Creator'
  },
  {
    id: 'ai-suggestions',
    title: 'Get AI Recommendations 🤖',
    description: 'Let our AI suggest perfect outfits based on occasions and your style.',
    target: 'ai-outfits-link',
    action: 'Generate AI outfit suggestions',
    points: 150,
    badge: 'AI Stylist'
  },
  {
    id: 'explore-colors',
    title: 'Master Color Theory 🎨',
    description: 'Explore our color palette to understand perfect color combinations.',
    target: 'colors-link',
    action: 'Explore the Color Palette Studio',
    points: 100,
    badge: 'Color Expert'
  }
];

interface GamifiedTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamifiedTutorial: React.FC<GamifiedTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);
  const { toast } = useToast();

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem('vesti-tutorial-progress');
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedSteps(data.completedSteps || []);
      setTotalPoints(data.totalPoints || 0);
      setEarnedBadges(data.earnedBadges || []);
      setCurrentStep(data.currentStep || 0);
    }
  }, []);

  const saveProgress = (step: number, completed: string[], points: number, badges: string[]) => {
    const data = {
      currentStep: step,
      completedSteps: completed,
      totalPoints: points,
      earnedBadges: badges
    };
    localStorage.setItem('vesti-tutorial-progress', JSON.stringify(data));
  };

  const completeStep = () => {
    if (completedSteps.includes(currentStepData.id)) return;

    const newCompleted = [...completedSteps, currentStepData.id];
    const newPoints = totalPoints + currentStepData.points;
    const newBadges = currentStepData.badge && !earnedBadges.includes(currentStepData.badge) 
      ? [...earnedBadges, currentStepData.badge]
      : earnedBadges;

    setCompletedSteps(newCompleted);
    setTotalPoints(newPoints);
    setEarnedBadges(newBadges);
    
    // Show reward animation
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);

    toast({
      title: `🎉 Step Completed!`,
      description: `+${currentStepData.points} points earned! ${currentStepData.badge ? `Badge unlocked: ${currentStepData.badge}` : ''}`
    });

    saveProgress(currentStep, newCompleted, newPoints, newBadges);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveProgress(newStep, completedSteps, totalPoints, earnedBadges);
    } else {
      // Tutorial completed
      toast({
        title: "🏆 Tutorial Completed!",
        description: `Congratulations! You've earned ${totalPoints} points and ${earnedBadges.length} badges!`
      });
      onClose();
    }
  };

  const skipTutorial = () => {
    localStorage.setItem('vesti-tutorial-skipped', 'true');
    onClose();
  };

  const resetTutorial = () => {
    localStorage.removeItem('vesti-tutorial-progress');
    setCurrentStep(0);
    setCompletedSteps([]);
    setTotalPoints(0);
    setEarnedBadges([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          {/* Header with Progress */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{totalPoints} Points</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="font-medium">{earnedBadges.length} Badges</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>

          {/* Current Step */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
                  <p className="text-muted-foreground">{currentStepData.description}</p>
                </div>

                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Reward: {currentStepData.points} Points</span>
                  </div>
                  {currentStepData.badge && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      🏆 {currentStepData.badge}
                    </Badge>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700 mb-4">
                    📋 {currentStepData.action}
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button onClick={completeStep} className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                    <Button variant="outline" onClick={nextStep}>
                      Skip Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-center">🏆 Your Badges</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {earnedBadges.map((badge, index) => (
                  <Badge key={index} variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    ⭐ {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" onClick={skipTutorial} className="text-muted-foreground">
              Skip Tutorial
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetTutorial} size="sm">
                Reset
              </Button>
              {currentStep === tutorialSteps.length - 1 ? (
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                  🎉 Finish Tutorial
                </Button>
              ) : (
                <Button onClick={nextStep} variant="outline">
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reward Animation */}
        {showReward && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="animate-bounce">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold">+{currentStepData.points} Points!</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};