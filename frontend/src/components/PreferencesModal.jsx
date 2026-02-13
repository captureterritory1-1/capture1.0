import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const PreferencesModal = ({
  isOpen,
  onClose,
  preferences,
  onSave,
}) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Reset local prefs when modal opens or preferences change
  useEffect(() => {
    if (isOpen) {
      setLocalPrefs(preferences);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm bg-card border-border shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Preferences</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="p-4 space-y-6">
          {/* Unit Selection */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Distance Unit</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'km', label: 'Kilometers', short: 'km' },
                { id: 'miles', label: 'Miles', short: 'mi' },
              ].map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setLocalPrefs({ ...localPrefs, unit: unit.id })}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all",
                    localPrefs.unit === unit.id
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <p className="font-semibold">{unit.short}</p>
                  <p className="text-xs">{unit.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Activity Type</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'run', label: 'Running', emoji: '🏃' },
                { id: 'walk', label: 'Walking', emoji: '🚶' },
              ].map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setLocalPrefs({ ...localPrefs, activityType: activity.id })}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all",
                    localPrefs.activityType === activity.id
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <p className="text-2xl mb-1">{activity.emoji}</p>
                  <p className="text-sm font-medium">{activity.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            <Check className="w-5 h-5 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesModal;
