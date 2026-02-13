import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Play, Square, Pause, MapPin, Clock, Route, Zap, Signal } from 'lucide-react';
import { cn } from '../lib/utils';

const TrackingSheet = ({
  isTracking,
  isPaused,
  elapsedTime,
  totalDistance,
  formatTime,
  formatDistance,
  unit,
  onStartRun,
  onEndRun,
  onPauseRun,
  onResumeRun,
  showConfirmEnd,
  holdProgress,
  onHoldStart,
  onHoldEnd,
  onCancelEnd,
  gpsAccuracy,
}) => {
  const [currentPace, setCurrentPace] = useState('--:--');
  
  // Calculate average pace (min/km)
  useEffect(() => {
    if (totalDistance > 0 && elapsedTime > 0) {
      const paceInSeconds = elapsedTime / totalDistance; // seconds per km
      const minutes = Math.floor(paceInSeconds / 60);
      const seconds = Math.floor(paceInSeconds % 60);
      setCurrentPace(`${minutes}:${String(seconds).padStart(2, '0')}`);
    } else {
      setCurrentPace('--:--');
    }
  }, [totalDistance, elapsedTime]);

  // GPS signal quality indicator
  const getGpsQuality = () => {
    if (!gpsAccuracy) return { bars: 0, text: 'No GPS' };
    if (gpsAccuracy <= 5) return { bars: 4, text: 'Excellent' };
    if (gpsAccuracy <= 10) return { bars: 3, text: 'Good' };
    if (gpsAccuracy <= 20) return { bars: 2, text: 'Fair' };
    return { bars: 1, text: 'Poor' };
  };

  const gpsQuality = getGpsQuality();

  // Handle button clicks with stopPropagation
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

  const handlePauseClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPaused) {
      onResumeRun?.();
    } else {
      onPauseRun?.();
    }
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
      className="absolute left-0 right-0 px-4"
      style={{ zIndex: 9999, position: 'absolute', bottom: '88px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="border-0 overflow-hidden bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl">
        <CardContent className="p-0">
          {/* Confirm End Modal */}
          {showConfirmEnd && (
            <div className="animate-fade-in p-4 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Finish Capture?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={handleCancelWithStop}
                >
                  Cancel
                </Button>
              </div>
              
              {/* Hold to confirm button */}
              <div className="relative">
                <Button
                  className={cn(
                    "w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-xl",
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
              <p className="text-xs text-zinc-500 text-center mt-2">
                Loop = Territory • Open path = Run saved
              </p>
            </div>
          )}

          {/* Header with Status */}
          <div className={cn(
            "px-4 pt-4 pb-3 flex items-center justify-between",
            showConfirmEnd && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-2">
              {isTracking && (
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              )}
              <span className="text-white font-medium">
                {isTracking ? 'Capturing...' : 'Ready to Capture'}
              </span>
            </div>
            
            {/* GPS and BG Indicators */}
            {isTracking && (
              <div className="flex items-center gap-3">
                {/* Background tracking indicator */}
                <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-zinc-300 font-medium">BG</span>
                </div>
                
                {/* GPS Quality indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">GPS</span>
                  <div className="flex items-end gap-0.5 h-3">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={cn(
                          "w-1 rounded-sm transition-colors",
                          bar <= gpsQuality.bars ? "bg-green-500" : "bg-zinc-700"
                        )}
                        style={{ height: `${bar * 25}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Metrics Display */}
          <div className={cn(
            "transition-opacity duration-200",
            showConfirmEnd && "opacity-50 pointer-events-none"
          )}>
            {/* Metrics Grid - 3 columns */}
            <div className="grid grid-cols-3 divide-x divide-zinc-800 px-4 pb-4">
              {/* Distance */}
              <div className="text-center pr-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Distance</p>
                <p className="text-3xl font-bold text-white font-metrics">
                  {formatDistance(totalDistance)}
                </p>
                <p className="text-xs text-zinc-500">{unit}</p>
              </div>
              
              {/* Duration */}
              <div className="text-center px-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Duration</p>
                <p className="text-3xl font-bold text-white font-metrics">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              
              {/* Average Pace */}
              <div className="text-center pl-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Pace</p>
                <p className="text-3xl font-bold text-white font-metrics">
                  {currentPace}
                </p>
                <p className="text-xs text-zinc-500">min/{unit}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!showConfirmEnd && (
              <div className="px-4 pb-4">
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
                  <div className="grid grid-cols-2 gap-3">
                    {/* Pause/Resume Button */}
                    <Button
                      onClick={handlePauseClick}
                      className={cn(
                        "h-14 font-semibold text-base rounded-xl transition-all duration-200",
                        "bg-zinc-800 hover:bg-zinc-700 text-white",
                        "active:scale-[0.98]"
                      )}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    
                    {/* End Button */}
                    <Button
                      onClick={handleEndClick}
                      className={cn(
                        "h-14 font-semibold text-base rounded-xl transition-all duration-200",
                        "bg-zinc-800 hover:bg-zinc-700 text-white",
                        "active:scale-[0.98]"
                      )}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      End
                    </Button>
                  </div>
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
