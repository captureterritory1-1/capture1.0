import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TrackingSheet from '../components/TrackingSheet';
import ScratchCard from '../components/ScratchCard';
import { toast } from 'sonner';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// MuscleBlaze logo URL
const MUSCLEBLAZE_LOGO = 'https://customer-assets.emergentagent.com/job_instantapp-2/artifacts/puq75076_unnamed.png';

// Map tile URLs
const MAP_TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Blue Dot marker for user's current position (always visible)
const createBlueDotIcon = () => {
  return L.divIcon({
    className: 'blue-dot-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(0,0,0,0.1);
        position: relative;
      ">
        <div style="
          position: absolute;
          inset: -10px;
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Capture mode marker (shows user's territory color while tracking)
const createCaptureIcon = (color) => {
  return L.divIcon({
    className: 'capture-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3), 0 0 20px ${color}40;
        position: relative;
      ">
        <div style="
          position: absolute;
          inset: -8px;
          border: 3px solid ${color};
          border-radius: 50%;
          opacity: 0.6;
          animation: pulse-ring 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: -16px;
          border: 2px solid ${color};
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Brand marker with dynamic logo - clickable
const createBrandLogoIcon = (territory) => {
  const logoUrl = territory.logoUrl;
  const brandColor = territory.color;
  const brandName = territory.brand;
  
  return L.divIcon({
    className: 'brand-logo-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      ">
        <img 
          src="${logoUrl}" 
          alt="${brandName}" 
          style="
            width: 44px;
            height: 44px;
            object-fit: cover;
            border-radius: 10px;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
            border: 2px solid white;
          "
        />
        <div style="
          background: ${brandColor};
          color: white;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">
          ${brandName}
        </div>
      </div>
    `,
    iconSize: [80, 70],
    iconAnchor: [40, 35],
  });
};

// Map controller component - follows user when tracking + handles flyTo
const MapController = ({ center, isTracking, shouldCenter, flyToTarget, onFlyComplete }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && (isTracking || shouldCenter)) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, isTracking, shouldCenter, map]);
  
  // Handle fly-to requests
  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget.position, flyToTarget.zoom || 16, {
        duration: 1.5
      });
      if (onFlyComplete) {
        setTimeout(onFlyComplete, 1500);
      }
    }
  }, [flyToTarget, map, onFlyComplete]);
  
  return null;
};

// Re-center button component that uses the map
const RecenterButton = ({ userPosition, onClick }) => {
  const map = useMap();
  
  const handleRecenter = (e) => {
    e.stopPropagation();
    if (userPosition) {
      map.flyTo(userPosition, 16, { duration: 1 });
      if (onClick) onClick();
    }
  };
  
  return (
    <button
      onClick={handleRecenter}
      className="absolute top-4 right-4 z-[500] w-11 h-11 bg-card/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors active:scale-95 border border-border/50"
      title="Re-center on my location"
    >
      <Navigation className="w-5 h-5 text-foreground" />
    </button>
  );
};

const MapPage = () => {
  const { 
    userTerritories,
    allTerritories,
    brandTerritories,
    isTracking,
    currentPath,
    currentPosition,
    mapCenter,
    userPreferences,
    startTracking,
    stopTracking,
    analyzeAndCreateTerritory,
    elapsedTime,
    totalDistance,
    formatTime,
    formatDistance,
  } = useGame();
  
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [initialCentered, setInitialCentered] = useState(false);
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const holdTimerRef = useRef(null);

  // Combine local and server territories for display
  const displayTerritories = allTerritories.length > 0 ? allTerritories : userTerritories;

  // Center map on user's position once when they first load
  useEffect(() => {
    if (currentPosition && !initialCentered) {
      setInitialCentered(true);
    }
  }, [currentPosition, initialCentered]);

  const handleStartRun = () => {
    const started = startTracking();
    if (started) {
      toast.success('Capture started! Run a loop to claim territory.');
    } else {
      toast.error('Could not start tracking. Please check location permissions.');
    }
  };

  const handleEndRun = () => {
    setShowConfirmEnd(true);
  };

  const handleHoldStart = () => {
    holdTimerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          handleConfirmEnd();
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
    }
    setHoldProgress(0);
  };

  const handleConfirmEnd = () => {
    stopTracking();
    const result = analyzeAndCreateTerritory();
    
    if (result.success) {
      toast.success(result.message, {
        description: `Area: ${(result.territory.area * 1000000).toFixed(0)} sq meters`,
      });
    } else if (result.isRun) {
      toast.info(result.message, {
        description: `Distance: ${result.run?.distance?.toFixed(2) || 0} km`,
      });
    } else {
      toast.error(result.message);
    }
    
    setShowConfirmEnd(false);
    setHoldProgress(0);
  };

  const handleCancelEnd = () => {
    setShowConfirmEnd(false);
    setHoldProgress(0);
  };

  // Calculate polygon center for brand markers
  const getPolygonCenter = (coordinates) => {
    const lats = coordinates.map(c => c[1]);
    const lngs = coordinates.map(c => c[0]);
    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
    ];
  };

  // Handle brand territory click - fly to and show scratch card
  const handleBrandClick = (territory) => {
    const center = getPolygonCenter(territory.coordinates);
    setFlyToTarget({
      position: center,
      zoom: 18
    });
    setSelectedBrand(territory);
    
    // Show scratch card after fly animation
    setTimeout(() => {
      setShowScratchCard(true);
    }, 1600);
    
    toast.info(`Flying to ${territory.name}`, {
      duration: 2000,
    });
  };

  // Clear fly target after animation
  const handleFlyComplete = () => {
    setFlyToTarget(null);
  };

  // Close scratch card
  const handleCloseScratchCard = () => {
    setShowScratchCard(false);
    setSelectedBrand(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background theme-transition" style={{ height: '100dvh' }}>
      {/* Map Container - Takes all available space above nav */}
      <div className="flex-1 relative pb-20">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          {/* Dynamic Map Tiles based on theme */}
          <TileLayer
            url={isDarkMode ? MAP_TILES.dark : MAP_TILES.light}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Map Controller - centers on user + handles flyTo */}
          <MapController 
            center={currentPosition || mapCenter} 
            isTracking={isTracking} 
            shouldCenter={!initialCentered && currentPosition}
            flyToTarget={flyToTarget}
            onFlyComplete={handleFlyComplete}
          />
          
          {/* Re-center Button (inside MapContainer for map access) */}
          <RecenterButton userPosition={currentPosition} />
          
          {/* Brand Territories with Logos - Clickable */}
          {brandTerritories.map((territory) => (
            <React.Fragment key={territory.id}>
              <Polygon
                positions={territory.coordinates.map(([lng, lat]) => [lat, lng])}
                pathOptions={{
                  color: territory.color,
                  fillColor: territory.color,
                  fillOpacity: 0.25,
                  weight: 3,
                  dashArray: '8, 8',
                }}
                eventHandlers={{
                  click: () => handleBrandClick(territory),
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <img 
                      src={territory.logoUrl} 
                      alt={territory.brand} 
                      className="w-12 h-12 mx-auto mb-2 object-cover rounded-lg"
                    />
                    <p className="font-bold text-sm">{territory.name}</p>
                    <p className="text-xs text-gray-500">Sponsored Zone • {territory.brand}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrandClick(territory);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Claim Reward 🎁
                    </button>
                  </div>
                </Popup>
              </Polygon>
              {/* Brand Logo Marker at center - Clickable */}
              <Marker
                position={getPolygonCenter(territory.coordinates)}
                icon={createBrandLogoIcon(territory)}
                eventHandlers={{
                  click: () => handleBrandClick(territory),
                }}
              />
            </React.Fragment>
          ))}
          
          {/* User Territories (all users from server + local) */}
          {displayTerritories.map((territory) => (
            <Polygon
              key={territory.id}
              positions={territory.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: territory.color,
                fillColor: territory.color,
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">{territory.name}</p>
                  <p className="text-xs text-gray-500">
                    {(territory.area * 1000000).toFixed(0)} sq m
                  </p>
                </div>
              </Popup>
            </Polygon>
          ))}
          
          {/* Current tracking path (polyline) */}
          {currentPath.length > 1 && (
            <Polyline
              positions={currentPath}
              pathOptions={{
                color: userPreferences.territoryColor.hex,
                weight: 5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}
          
          {/* Current position marker - ALWAYS VISIBLE when we have position */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={isTracking 
                ? createCaptureIcon(userPreferences.territoryColor.hex) 
                : createBlueDotIcon()
              }
            />
          )}
        </MapContainer>
        
        {/* Location status indicator */}
        {!currentPosition && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
            <div className="bg-card/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-border/50">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-foreground font-medium">Finding your location...</span>
            </div>
          </div>
        )}
        
        {/* Attribution overlay */}
        <div className="absolute bottom-24 left-2 text-xs text-muted-foreground/60 z-[400]">
          © OpenStreetMap
        </div>
        
        {/* Tracking Sheet - floats above bottom nav */}
        <TrackingSheet
          isTracking={isTracking}
          elapsedTime={elapsedTime}
          totalDistance={totalDistance}
          formatTime={formatTime}
          formatDistance={formatDistance}
          unit={userPreferences.unit}
          onStartRun={handleStartRun}
          onEndRun={handleEndRun}
          showConfirmEnd={showConfirmEnd}
          holdProgress={holdProgress}
          onHoldStart={handleHoldStart}
          onHoldEnd={handleHoldEnd}
          onCancelEnd={handleCancelEnd}
        />
      </div>

      {/* Scratch Card Modal - pass full territory object */}
      <ScratchCard 
        isOpen={showScratchCard}
        onClose={handleCloseScratchCard}
        territory={selectedBrand}
      />
    </div>
  );
};

export default MapPage;
