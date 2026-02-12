import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Play, Square, Route, Clock, X } from 'lucide-react';
import { cn } from '../lib/utils';

const TrackingSheet = ({
  isTracking,
  elapsedTime,
  totalDistance,
  formatTime,
  formatDistance,
  unit,
  onStartRun,
  onEndRun,
  showConfirmEnd,
  holdProgress,
  onHoldStart,
  onHoldEnd,
  onCancelEnd,
}) => {
  // Handle button click with stopPropagation to prevent map interaction
  const handleStartClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onStartRun();
  };

  const handleEndClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEndRun();
  };

  const handleHoldStartWithStop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onHoldStart();
  };

  const handleHoldEndWithStop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onHoldEnd();
  };

  const handleCancelWithStop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onCancelEnd();
  };

  return (
    <div 
      className="absolute bottom-4 left-0 right-0 px-4"
      style={{ zIndex: 9999, position: 'relative' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="floating-sheet border-0 overflow-hidden">
        <CardContent className="p-4">
          {/* Confirm End Modal */}
          {showConfirmEnd && (
            <div className="animate-fade-in mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-foreground">Finish Capture?</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={handleCancelWithStop}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Hold to confirm button */}
              <div className="relative">
                <Button
                  className={cn(
                    "w-full h-14 bg-destructive text-destructive-foreground font-semibold text-base rounded-xl",
                    "transition-all duration-100",
                    holdProgress > 0 && "scale-[0.98]"
                  )}
                  onMouseDown={handleHoldStartWithStop}
                  onMouseUp={handleHoldEndWithStop}
                  onMouseLeave={handleHoldEndWithStop}
                  onTouchStart={handleHoldStartWithStop}
                  onTouchEnd={handleHoldEndWithStop}
                >
                  {holdProgress > 0 ? (
                    <span>Hold... {Math.round(holdProgress)}%</span>
                  ) : (
                    <span>Hold to Finish</span>
                  )}
                </Button>
                {holdProgress > 0 && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-full transition-all duration-100"
                    style={{ width: `${holdProgress}%` }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Returns to start = Territory • Otherwise = Run saved
              </p>
            </div>
          )}

          {/* Stats Display */}
          <div className={cn(
            "transition-opacity duration-200",
            showConfirmEnd && "opacity-50 pointer-events-none"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-foreground">
                {isTracking ? 'Capturing...' : 'Ready to Capture'}
              </h3>
              {isTracking && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-xs text-destructive font-medium">LIVE</span>
                </div>
              )}
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Distance */}
              <div className="bg-secondary rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Route className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Distance</span>
                </div>
                <p className="text-2xl font-bold text-foreground font-metrics">
                  {formatDistance(totalDistance)}
                </p>
                <p className="text-xs text-muted-foreground">{unit}</p>
              </div>
              
              {/* Duration */}
              <div className="bg-secondary rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold text-foreground font-metrics">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-xs text-muted-foreground">min:sec</p>
              </div>
            </div>
            
            {/* Action Button - with high z-index and stopPropagation */}
            {!showConfirmEnd && (
              <div style={{ position: 'relative', zIndex: 10000 }}>
                {!isTracking ? (
                  <Button
                    onClick={handleStartClick}
                    className={cn(
                      "w-full h-14 font-semibold text-base rounded-xl shadow-lg transition-all duration-200",
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white hover:shadow-xl active:scale-[0.98]"
                    )}
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Capture
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndClick}
                    className={cn(
                      "w-full h-14 font-semibold text-base rounded-xl transition-all duration-200",
                      "bg-destructive hover:bg-destructive/90 text-white",
                      "shadow-lg hover:shadow-xl active:scale-[0.98]"
                    )}
                  >
                    <Square className="w-5 h-5 mr-2 fill-current" />
                    Stop Capture
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingSheet;
