import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const ClaimTerritoryModal = ({
  isOpen,
  onClose,
  onClaim,
  territory,
  currentUserColor,
}) => {
  if (!isOpen || !territory) return null;

  const isBrandTerritory = territory.isSponsored || territory.brand;
  const ownerName = territory.brand || 'Another Player';

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm bg-zinc-900/95 border-0 shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning color */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Claim Territory?</h3>
                <p className="text-sm text-white/80">You've overlapped a zone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Territory Info */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: territory.color }}
              >
                {territory.logoUrl ? (
                  <img 
                    src={territory.logoUrl} 
                    alt={territory.brand}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Flag className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{territory.name}</p>
                <p className="text-sm text-zinc-400">
                  Owned by: <span className="text-zinc-300">{ownerName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Warning for brand territories */}
          {isBrandTerritory && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                This is a sponsored brand territory. Claiming it will override the brand zone.
              </p>
            </div>
          )}

          {/* Your color preview */}
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl">
            <span className="text-zinc-400 text-sm">Your territory color:</span>
            <div 
              className="w-8 h-8 rounded-lg shadow-lg"
              style={{ backgroundColor: currentUserColor }}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onClaim(territory)}
              className={cn(
                "h-12 font-semibold",
                "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                "text-white shadow-lg"
              )}
            >
              <Flag className="w-4 h-4 mr-2" />
              Claim It
            </Button>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            The territory will be updated to your color
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimTerritoryModal;
