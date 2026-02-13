import React, { useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { X, Download, Share2, MapPin, Clock, Route, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const ShareCaptureModal = ({
  isOpen,
  onClose,
  territory,
  distance,
  duration,
  pace,
}) => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (dist, dur) => {
    if (!dist || dist === 0) return '--:--';
    const paceSeconds = dur / dist;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate shareable image using Canvas
  const generateImage = async () => {
    setIsGenerating(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Square format for Instagram (1080x1080)
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Background - dark gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#09090B');
    gradient.addColorStop(1, '#18181B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < size; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y < size; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Draw territory shape if available
    if (territory?.coordinates && territory.coordinates.length > 0) {
      const coords = territory.coordinates;
      
      // Find bounds
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });

      const padding = 150;
      const drawWidth = size - padding * 2;
      const drawHeight = size - padding * 2 - 200; // Leave room for stats
      
      const lngRange = maxLng - minLng || 0.001;
      const latRange = maxLat - minLat || 0.001;
      const scale = Math.min(drawWidth / lngRange, drawHeight / latRange);

      const centerX = size / 2;
      const centerY = size / 2 - 80;

      // Draw glow effect
      ctx.shadowColor = territory.color || '#F59E0B';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = territory.color || '#F59E0B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      coords.forEach(([lng, lat], i) => {
        const x = centerX + (lng - (minLng + maxLng) / 2) * scale;
        const y = centerY - (lat - (minLat + maxLat) / 2) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // Fill with transparent color
      ctx.shadowBlur = 0;
      ctx.fillStyle = `${territory.color || '#F59E0B'}33`;
      ctx.fill();

      // Draw route dots
      ctx.fillStyle = territory.color || '#F59E0B';
      coords.forEach(([lng, lat]) => {
        const x = centerX + (lng - (minLng + maxLng) / 2) * scale;
        const y = centerY - (lat - (minLat + maxLat) / 2) * scale;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Stats section at bottom
    const statsY = size - 280;
    
    // Stats background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, statsY - 20, size, 200);

    // Draw stats
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';

    // Territory name
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.fillText(territory?.name || 'Territory Captured', size / 2, statsY + 30);

    // Stats row
    const statWidth = size / 3;
    const statY = statsY + 100;

    // Distance
    ctx.fillStyle = '#71717A';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText('DISTANCE', statWidth * 0.5, statY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.fillText(`${(distance || 0).toFixed(2)}`, statWidth * 0.5, statY + 50);
    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText('km', statWidth * 0.5, statY + 75);

    // Duration
    ctx.fillStyle = '#71717A';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText('DURATION', statWidth * 1.5, statY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.fillText(formatTime(duration || 0), statWidth * 1.5, statY + 50);

    // Pace
    ctx.fillStyle = '#71717A';
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillText('AVG PACE', statWidth * 2.5, statY);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.fillText(formatPace(distance, duration), statWidth * 2.5, statY + 50);
    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText('min/km', statWidth * 2.5, statY + 75);

    // CAPTURE branding
    ctx.textAlign = 'center';
    ctx.font = 'bold italic 28px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('CAPTURE', size / 2, size - 50);

    // Date
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText(formatDate(), size / 2, size - 25);

    // Convert to image
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setGeneratedImage(dataUrl);
    setIsGenerating(false);
  };

  // Generate image on mount
  React.useEffect(() => {
    if (isOpen && !generatedImage) {
      generateImage();
    }
  }, [isOpen]);

  // Download image
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `capture-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    toast.success('Image downloaded!');
  };

  // Share image (native share API)
  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'capture.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My CAPTURE Territory',
          text: `I just captured a territory! ${(distance || 0).toFixed(2)}km in ${formatTime(duration || 0)}`,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback to download
        handleDownload();
        toast.info('Share not supported. Image downloaded instead.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        handleDownload();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white">Share Your Capture</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="aspect-square bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-400">Generating image...</p>
              </div>
            ) : generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Capture share" 
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          <Button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImage}
            className="h-12 bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating || !generatedImage}
            className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>

        <p className="text-xs text-zinc-500 text-center pb-4">
          Share to Instagram, WhatsApp, Twitter & more
        </p>
      </Card>
    </div>
  );
};

export default ShareCaptureModal;
