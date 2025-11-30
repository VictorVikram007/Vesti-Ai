import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWardrobe } from '@/context/WardrobeContext';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { Sparkles, Palette, Heart, Star, Zap, Target } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    icon: React.ReactNode;
    styleTraits: string[];
  }[];
}

const questions: Question[] = [
  {
    id: 'style-preference',
    question: 'How would you describe your overall style?',
    options: [
      {
        id: 'minimalist',
        text: 'Minimalist & Clean',
        icon: <Target className="h-6 w-6" />,
        styleTraits: ['minimalist', 'clean', 'simple', 'neutral']
      },
      {
        id: 'bohemian',
        text: 'Bohemian & Free-spirited',
        icon: <Heart className="h-6 w-6" />,
        styleTraits: ['bohemian', 'eclectic', 'artistic', 'flowy']
      },
      {
        id: 'classic',
        text: 'Classic & Timeless',
        icon: <Star className="h-6 w-6" />,
        styleTraits: ['classic', 'timeless', 'elegant', 'sophisticated']
      },
      {
        id: 'trendy',
        text: 'Trendy & Fashion-forward',
        icon: <Zap className="h-6 w-6" />,
        styleTraits: ['trendy', 'fashion-forward', 'bold', 'experimental']
      }
    ]
  },
  {
    id: 'color-preference',
    question: 'What color palette speaks to you?',
    options: [
      {
        id: 'neutral',
        text: 'Neutrals (Black, White, Beige)',
        icon: <Palette className="h-6 w-6" />,
        styleTraits: ['neutral', 'monochrome', 'sophisticated']
      },
      {
        id: 'warm',
        text: 'Warm Tones (Browns, Reds, Oranges)',
        icon: <Heart className="h-6 w-6" />,
        styleTraits: ['warm', 'earthy', 'cozy']
      },
      {
        id: 'cool',
        text: 'Cool Tones (Blues, Greens, Purples)',
        icon: <Sparkles className="h-6 w-6" />,
        styleTraits: ['cool', 'calm', 'serene']
      },
      {
        id: 'vibrant',
        text: 'Vibrant & Bold Colors',
        icon: <Zap className="h-6 w-6" />,
        styleTraits: ['vibrant', 'bold', 'energetic']
      }
    ]
  },
  {
    id: 'occasion-focus',
    question: 'What occasions do you dress for most often?',
    options: [
      {
        id: 'casual',
        text: 'Casual & Everyday',
        icon: <Heart className="h-6 w-6" />,
        styleTraits: ['casual', 'comfortable', 'practical']
      },
      {
        id: 'professional',
        text: 'Professional & Work',
        icon: <Target className="h-6 w-6" />,
        styleTraits: ['professional', 'polished', 'business']
      },
      {
        id: 'social',
        text: 'Social & Events',
        icon: <Sparkles className="h-6 w-6" />,
        styleTraits: ['social', 'stylish', 'event-ready']
      },
      {
        id: 'creative',
        text: 'Creative & Artistic',
        icon: <Palette className="h-6 w-6" />,
        styleTraits: ['creative', 'artistic', 'expressive']
      }
    ]
  },
  {
    id: 'fit-preference',
    question: 'What fit do you prefer?',
    options: [
      {
        id: 'fitted',
        text: 'Fitted & Structured',
        icon: <Target className="h-6 w-6" />,
        styleTraits: ['fitted', 'structured', 'tailored']
      },
      {
        id: 'relaxed',
        text: 'Relaxed & Comfortable',
        icon: <Heart className="h-6 w-6" />,
        styleTraits: ['relaxed', 'comfortable', 'easy']
      },
      {
        id: 'oversized',
        text: 'Oversized & Loose',
        icon: <Sparkles className="h-6 w-6" />,
        styleTraits: ['oversized', 'loose', 'trendy']
      },
      {
        id: 'mixed',
        text: 'Mix of Fits',
        icon: <Palette className="h-6 w-6" />,
        styleTraits: ['versatile', 'balanced', 'mixed']
      }
    ]
  }
];

interface StylePersonalityQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StylePersonalityQuiz: React.FC<StylePersonalityQuizProps> = ({
  open,
  onOpenChange
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setStylePersonality } = useWardrobe();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Analyze answers to determine style personality
      const styleTraits: string[] = [];
      const styleScores: Record<string, number> = {};
      
      Object.entries(answers).forEach(([questionId, answerId]) => {
        const question = questions.find(q => q.id === questionId);
        const option = question?.options.find(o => o.id === answerId);
        
        if (option) {
          option.styleTraits.forEach(trait => {
            styleTraits.push(trait);
            styleScores[trait] = (styleScores[trait] || 0) + 1;
          });
        }
      });

      // Determine primary style personality
      const primaryTraits = Object.entries(styleScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([trait]) => trait);

      const personalityName = getPersonalityName(primaryTraits);
      
      const stylePersonality = {
        id: Date.now().toString(),
        name: personalityName,
        traits: primaryTraits,
        allTraits: styleTraits,
        preferences: {
          colors: getColorPreferences(answers),
          fits: getFitPreferences(answers),
          occasions: getOccasionPreferences(answers)
        },
        createdAt: new Date()
      };

      setStylePersonality(stylePersonality);
      
      // Update wardrobe preferences based on quiz results
      const updatedPreferences = {
        ...settings.wardrobe,
        styleProfile: personalityName.replace('The ', ''),
        likedColors: getColorPreferences(answers),
        occasions: getOccasionPreferences(answers),
        preferredFit: getFitPreferences(answers)[0] || 'Regular'
      };
      
      updateSettings({
        ...settings,
        wardrobe: updatedPreferences
      });
      
      toast({
        title: "Style personality discovered!",
        description: `You're a ${personalityName}. Your preferences have been updated for personalized recommendations.`
      });
      
      onOpenChange(false);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your style personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPersonalityName = (traits: string[]): string => {
    if (traits.includes('minimalist') && traits.includes('neutral')) return 'The Minimalist';
    if (traits.includes('bohemian') && traits.includes('artistic')) return 'The Free Spirit';
    if (traits.includes('classic') && traits.includes('elegant')) return 'The Classic';
    if (traits.includes('trendy') && traits.includes('bold')) return 'The Trendsetter';
    if (traits.includes('professional') && traits.includes('polished')) return 'The Professional';
    if (traits.includes('creative') && traits.includes('expressive')) return 'The Creative';
    return 'The Style Explorer';
  };

  const getColorPreferences = (answers: Record<string, string>): string[] => {
    const colorAnswer = answers['color-preference'];
    switch (colorAnswer) {
      case 'neutral': return ['black', 'white', 'beige', 'gray', 'navy'];
      case 'warm': return ['brown', 'red', 'orange', 'yellow', 'cream'];
      case 'cool': return ['blue', 'green', 'purple', 'teal', 'mint'];
      case 'vibrant': return ['pink', 'yellow', 'orange', 'purple', 'red'];
      default: return ['black', 'white', 'blue'];
    }
  };

  const getFitPreferences = (answers: Record<string, string>): string[] => {
    const fitAnswer = answers['fit-preference'];
    switch (fitAnswer) {
      case 'fitted': return ['fitted', 'tailored', 'structured'];
      case 'relaxed': return ['relaxed', 'comfortable', 'easy'];
      case 'oversized': return ['oversized', 'loose', 'baggy'];
      case 'mixed': return ['versatile', 'balanced'];
      default: return ['comfortable'];
    }
  };

  const getOccasionPreferences = (answers: Record<string, string>): string[] => {
    const occasionAnswer = answers['occasion-focus'];
    switch (occasionAnswer) {
      case 'casual': return ['casual', 'everyday', 'weekend'];
      case 'professional': return ['work', 'business', 'professional'];
      case 'social': return ['social', 'events', 'parties'];
      case 'creative': return ['creative', 'artistic', 'expressive'];
      default: return ['casual'];
    }
  };

  const currentQ = questions[currentQuestion];
  const hasAnswered = answers[currentQ?.id];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-wardrobe-teal" />
            Discover Your Style Personality
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          {currentQ && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                {currentQ.question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      answers[currentQ.id] === option.id
                        ? 'ring-2 ring-wardrobe-teal bg-wardrobe-teal/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleAnswer(currentQ.id, option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          answers[currentQ.id] === option.id
                            ? 'bg-wardrobe-teal text-white'
                            : 'bg-muted'
                        }`}>
                          {option.icon}
                        </div>
                        <span className="font-medium">{option.text}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!hasAnswered || isSubmitting}
              className="bg-wardrobe-teal hover:bg-wardrobe-teal/90"
            >
              {isSubmitting ? (
                'Analyzing...'
              ) : currentQuestion === questions.length - 1 ? (
                'Discover My Style'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
