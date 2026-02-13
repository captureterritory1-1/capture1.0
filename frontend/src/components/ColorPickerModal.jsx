import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const ColorPickerModal = ({
  isOpen,
  onClose,
  colors,
  selectedColor,
  onSelectColor,
}) => {
  if (!isOpen) return null;

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
          <h3 className="text-lg font-bold text-foreground">Choose Territory Color</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  onSelectColor(color);
                  onClose();
                }}
                className={cn(
                  "relative w-full aspect-square rounded-xl transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  selectedColor?.id === color.id && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor?.id === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedColor && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-xl flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <p className="font-medium text-foreground">{selectedColor.name}</p>
                <p className="text-xs text-muted-foreground">{selectedColor.hex}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPickerModal;
