import React, { useRef, useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import { X, Gift, Ticket, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const ScratchCard = ({ isOpen, onClose, territory }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const logoImageRef = useRef(null);

  // Get brand info from territory
  const brandName = territory?.brand || 'Brand';
  const brandColor = territory?.color || '#FFD700';
  // Use proxied URL for canvas (CORS), fall back to direct URL
  const logoUrl = territory?.logoUrlProxied || territory?.logoUrl;
  const logoUrlDirect = territory?.logoUrl; // Direct URL for header image
  const prize = territory?.prize || { 
    discount: '₹500 OFF', 
    code: 'CAPTURE500', 
    description: 'on your next order',
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

  // Load brand logo image
  useEffect(() => {
    if (!isOpen || !logoUrl) {
      setLogoLoadError(true);
      setLogoLoaded(true);
      return;
    }
    
    // Reset states
    setLogoLoaded(false);
    setLogoLoadError(false);
    logoImageRef.current = null;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Logo loaded successfully:', logoUrl);
      logoImageRef.current = img;
      setLogoLoadError(false);
      setLogoLoaded(true);
    };
    
    img.onerror = (error) => {
      console.error('Logo failed to load:', logoUrl, error);
      logoImageRef.current = null;
      setLogoLoadError(true);
      setLogoLoaded(true); // Continue with fallback
    };
    
    img.src = logoUrl;
    
    return () => {
      setLogoLoaded(false);
      setLogoLoadError(false);
    };
  }, [isOpen, logoUrl]);

  // Initialize canvas with brand logo as scratch cover
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !logoLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    
    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Draw the brand logo as the scratch layer (only if logo loaded successfully)
    if (logoImageRef.current && !logoLoadError) {
      // Fill with brand color first as fallback
      ctx.fillStyle = brandColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw logo centered and covering the area
      const img = logoImageRef.current;
      const imgAspect = img.width / img.height;
      const canvasAspect = rect.width / rect.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      // Cover the entire canvas (like CSS background-size: cover)
      if (imgAspect > canvasAspect) {
        drawHeight = rect.height;
        drawWidth = drawHeight * imgAspect;
        drawX = (rect.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = rect.width;
        drawHeight = drawWidth / imgAspect;
        drawX = 0;
        drawY = (rect.height - drawHeight) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      // Add semi-transparent overlay for better scratch visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Add "Scratch Me!" hint text with better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 18px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text shadow effect for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText('✨ SCRATCH ME! ✨', rect.width / 2, rect.height / 2);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      console.log('Canvas drawn with logo successfully');
    } else {
      // Fallback: Draw brand color with text if no logo
      console.log('Using fallback - no logo available');
      ctx.fillStyle = brandColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(brandName.toUpperCase(), rect.width / 2, rect.height / 2 - 15);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('✨ Scratch to Reveal! ✨', rect.width / 2, rect.height / 2 + 20);
    }

    // Reset state
    setScratchPercent(0);
    setIsRevealed(false);
    setShowConfetti(false);
  }, [isOpen, logoLoaded, logoLoadError, brandColor, brandName]);

  // Calculate scratch percentage
  const calculateScratchPercent = useCallback(() => {
    if (!canvasRef.current) return 0;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    const dpr = window.devicePixelRatio || 1;
    
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale for high DPI
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Erase area with circular brush
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, 35 * dpr, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Calculate and update scratch percent
    const percent = calculateScratchPercent();
    setScratchPercent(percent);

    // Check if enough is scratched (>50%)
    if (percent > 50 && !isRevealed) {
      setIsRevealed(true);
      setShowConfetti(true);
      
      // Fade out remaining cover
      setTimeout(() => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
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
    toast.success('Coupon code copied!', {
      description: prize.code,
    });
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
          colors={[brandColor, '#FFD700', '#FFA500', '#3B82F6', '#22C55E', '#A855F7']}
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

        {/* Header with brand color */}
        <div 
          className="px-6 py-4"
          style={{ background: `linear-gradient(135deg, ${brandColor}, ${adjustColor(brandColor, -20)})` }}
        >
          <div className="flex items-center gap-3">
            {logoUrlDirect && (
              <img 
                src={logoUrlDirect} 
                alt={brandName}
                className="w-12 h-12 object-cover bg-white rounded-xl"
              />
            )}
            <div>
              <h2 className="text-white font-bold text-lg font-heading drop-shadow-md">Territory Captured!</h2>
              <p className="text-white/90 text-sm">You earned a reward from {brandName}</p>
            </div>
          </div>
        </div>

        {/* Scratch Area Container */}
        <div className="p-6">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border-2 border-dashed border-border">
            {/* Prize Layer (Bottom) - Always visible underneath */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <Gift className="w-10 h-10 text-amber-500 mb-2" />
              <p className="text-2xl font-bold font-heading" style={{ color: brandColor }}>{prize.discount}</p>
              <p className="text-sm text-muted-foreground mt-1">{prize.description}</p>
              
              {/* Coupon Code */}
              <div className="mt-3 bg-white dark:bg-card border-2 border-dashed border-amber-400 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  <span className="font-mono font-bold text-lg text-foreground">{prize.code}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">Valid till Dec 31, 2026</p>
            </div>

            {/* Scratch Canvas (Top) - Brand Logo as surface */}
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
                  className="h-full transition-all duration-200"
                  style={{ 
                    width: `${Math.min(scratchPercent * 2, 100)}%`,
                    background: `linear-gradient(90deg, ${brandColor}, ${adjustColor(brandColor, 20)})`
                  }}
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
                className="w-full h-12 font-semibold rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${brandColor}, ${adjustColor(brandColor, -20)})` }}
              >
                <Check className="w-5 h-5 mr-2" />
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

// Helper function to adjust color brightness
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export default ScratchCard;
