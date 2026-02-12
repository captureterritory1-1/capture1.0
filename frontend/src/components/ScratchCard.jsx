import React, { useRef, useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import { X, Gift, Ticket } from 'lucide-react';
import { Button } from './ui/button';

// MuscleBlaze logo
const MUSCLEBLAZE_LOGO = 'https://customer-assets.emergentagent.com/job_instantapp-2/artifacts/puq75076_unnamed.png';

// Scratch card icons for the cover
const SCRATCH_ICONS = ['🏆', '💪', '🎁', '💰', '⭐', '🎯', '🔥', '💎'];

const ScratchCard = ({ isOpen, onClose, brandName = 'MuscleBlaze' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Prize data
  const prize = {
    discount: '₹500 OFF',
    code: 'CAPTURE500',
    description: 'on your next MuscleBlaze order',
    validity: 'Valid till Dec 31, 2026',
  };

  // Update window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize canvas with scratch cover
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw scratch cover - gradient blue background with pattern
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(0.5, '#2563EB');
    gradient.addColorStop(1, '#1D4ED8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add decorative pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = '24px Arial';
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const icon = SCRATCH_ICONS[Math.floor(Math.random() * SCRATCH_ICONS.length)];
      ctx.fillText(icon, x, y);
    }

    // Add "Scratch to Reveal" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎁 Scratch to Reveal!', rect.width / 2, rect.height / 2);

    // Reset state
    setScratchPercent(0);
    setIsRevealed(false);
    setShowConfetti(false);
  }, [isOpen]);

  // Calculate scratch percentage
  const calculateScratchPercent = useCallback(() => {
    if (!canvasRef.current) return 0;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    const totalPixels = pixels.length / 4;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }
    
    return (transparentPixels / totalPixels) * 100;
  }, []);

  // Handle scratch
  const handleScratch = useCallback((e) => {
    if (!isScratching || !canvasRef.current || isRevealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Erase area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Calculate and update scratch percent
    const percent = calculateScratchPercent();
    setScratchPercent(percent);

    // Check if enough is scratched
    if (percent > 50 && !isRevealed) {
      setIsRevealed(true);
      setShowConfetti(true);
      
      // Fade out remaining cover
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 300);
    }
  }, [isScratching, isRevealed, calculateScratchPercent]);

  // Handle start scratching
  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScratching(true);
    handleScratch(e);
  };

  // Handle stop scratching
  const handleEnd = () => {
    setIsScratching(false);
  };

  // Copy coupon code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(prize.code);
    // Could add toast here
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#F59E0B', '#EAB308', '#FFD700', '#FFA500', '#3B82F6', '#22C55E']}
        />
      )}

      {/* Modal */}
      <div 
        ref={containerRef}
        className="relative w-[340px] mx-4 bg-card rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={MUSCLEBLAZE_LOGO} 
              alt={brandName}
              className="w-12 h-12 object-contain bg-white rounded-xl p-1"
            />
            <div>
              <h2 className="text-white font-bold text-lg font-heading">Territory Captured!</h2>
              <p className="text-white/80 text-sm">You earned a reward from {brandName}</p>
            </div>
          </div>
        </div>

        {/* Scratch Area Container */}
        <div className="p-6">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-secondary">
            {/* Prize Layer (Bottom) - Always visible underneath */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <Gift className="w-12 h-12 text-amber-500 mb-2" />
              <p className="text-3xl font-bold text-amber-600 font-heading">{prize.discount}</p>
              <p className="text-sm text-muted-foreground mt-1">{prize.description}</p>
              
              {/* Coupon Code */}
              <div className="mt-4 bg-white dark:bg-card border-2 border-dashed border-amber-400 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  <span className="font-mono font-bold text-lg text-foreground">{prize.code}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">{prize.validity}</p>
            </div>

            {/* Scratch Canvas (Top) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              style={{ opacity: isRevealed ? 0 : 1, transition: 'opacity 0.3s ease-out' }}
              onMouseDown={handleStart}
              onMouseMove={handleScratch}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleScratch}
              onTouchEnd={handleEnd}
            />
          </div>

          {/* Progress indicator */}
          {!isRevealed && scratchPercent > 0 && (
            <div className="mt-3">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
                  style={{ width: `${Math.min(scratchPercent * 2, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {scratchPercent < 25 ? 'Keep scratching...' : scratchPercent < 50 ? 'Almost there!' : 'Just a bit more!'}
              </p>
            </div>
          )}

          {/* Revealed state actions */}
          {isRevealed && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <Button
                onClick={handleCopyCode}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl"
              >
                Copy Coupon Code
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-10 rounded-xl"
              >
                Continue Exploring
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchCard;
