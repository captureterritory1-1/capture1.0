import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Check, ChevronRight, ChevronLeft, User, Settings, Palette, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const SetupPage = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { territoryColors, userPreferences, updatePreferences } = useGame();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [unit, setUnit] = useState(userPreferences.unit);
  const [activityType, setActivityType] = useState(userPreferences.activityType);
  const [selectedColor, setSelectedColor] = useState(userPreferences.territoryColor);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Update preferences
      updatePreferences({
        unit,
        activityType,
        territoryColor: selectedColor,
      });
      
      // Update user profile
      updateProfile({
        displayName,
        unit,
        activityType,
        territoryColor: selectedColor,
      });
      
      toast.success('Setup complete! Let\'s capture some territory!');
      navigate('/map');
    } catch (error) {
      toast.error('Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <div className="pt-safe">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10" /> {/* Spacer */}
          <h1 className="text-xl font-heading font-bold text-foreground">
            Get Started
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/map')}
            className="text-muted-foreground"
          >
            Skip
          </Button>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-secondary" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Step 1: Display Name */}
        {step === 1 && (
          <div className="animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-foreground" />
                </div>
                <CardTitle className="text-2xl font-heading">What's your name?</CardTitle>
                <CardDescription>This is how other runners will see you</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="sr-only">Display Name</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-14 text-lg text-center bg-secondary border-0 focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-foreground" />
                </div>
                <CardTitle className="text-2xl font-heading">Your Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                {/* Unit Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Distance Unit
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUnit('km')}
                      className={cn(
                        "h-14 rounded-xl font-semibold transition-all duration-200",
                        unit === 'km'
                          ? "bg-foreground text-background"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      Kilometers
                    </button>
                    <button
                      onClick={() => setUnit('miles')}
                      className={cn(
                        "h-14 rounded-xl font-semibold transition-all duration-200",
                        unit === 'miles'
                          ? "bg-foreground text-background"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      Miles
                    </button>
                  </div>
                </div>

                {/* Activity Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Activity Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActivityType('run')}
                      className={cn(
                        "h-14 rounded-xl font-semibold transition-all duration-200",
                        activityType === 'run'
                          ? "bg-foreground text-background"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      🏃 Run
                    </button>
                    <button
                      onClick={() => setActivityType('walk')}
                      className={cn(
                        "h-14 rounded-xl font-semibold transition-all duration-200",
                        activityType === 'walk'
                          ? "bg-foreground text-background"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      🚶 Walk
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Territory Color */}
        {step === 3 && (
          <div className="animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-foreground" />
                </div>
                <CardTitle className="text-2xl font-heading">Choose Your Paint</CardTitle>
                <CardDescription>This color will mark your territories on the map</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-3">
                  {territoryColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "aspect-square rounded-2xl transition-all duration-200 relative",
                        "hover:scale-105 active:scale-95",
                        selectedColor.id === color.id && "ring-4 ring-offset-2 ring-foreground"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor.id === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Selected: <span className="font-semibold">{selectedColor.name}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Buttons */}
        <div className="pt-4 pb-safe space-y-3">
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 font-semibold text-base rounded-xl"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Start Capturing
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
          
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
