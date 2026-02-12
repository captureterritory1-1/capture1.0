import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
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
  return (
    <div className="absolute bottom-20 left-0 right-0 z-[500] px-4">
      <Card className="floating-sheet border-0 overflow-hidden">
        <CardContent className="p-4">
          {/* Confirm End Modal */}
          {showConfirmEnd && (
            <div className="animate-fade-in mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-foreground">Finish Run?</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={onCancelEnd}
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
                  onMouseDown={onHoldStart}
                  onMouseUp={onHoldEnd}
                  onMouseLeave={onHoldEnd}
                  onTouchStart={onHoldStart}
                  onTouchEnd={onHoldEnd}
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
            </div>
          )}

          {/* Stats Display */}
          <div className={cn(
            "transition-opacity duration-200",
            showConfirmEnd && "opacity-50"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-foreground">
                {isTracking ? 'Tracking...' : 'Ready to Run'}
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
                <p className="text-2xl font-bold text-foreground font-heading">
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
                <p className="text-2xl font-bold text-foreground font-heading">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-xs text-muted-foreground">min:sec</p>
              </div>
            </div>
            
            {/* Action Button */}
            {!showConfirmEnd && (
              <>
                {!isTracking ? (
                  <Button
                    onClick={onStartRun}
                    className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Run
                  </Button>
                ) : (
                  <Button
                    onClick={onEndRun}
                    variant="outline"
                    className="w-full h-14 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold text-base rounded-xl transition-all duration-200"
                  >
                    <Square className="w-5 h-5 mr-2 fill-current" />
                    End Run
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingSheet;
