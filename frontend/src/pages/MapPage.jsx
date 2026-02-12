import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import TrackingSheet from '../components/TrackingSheet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// MuscleBlaze logo URL
const MUSCLEBLAZE_LOGO = 'https://customer-assets.emergentagent.com/job_instantapp-2/artifacts/puq75076_unnamed.png';

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

// MuscleBlaze brand marker with logo
const createBrandLogoIcon = () => {
  return L.divIcon({
    className: 'brand-logo-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      ">
        <img 
          src="${MUSCLEBLAZE_LOGO}" 
          alt="MuscleBlaze" 
          style="
            width: 48px;
            height: 48px;
            object-fit: contain;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
            opacity: 0.9;
          "
        />
        <div style="
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">
          MuscleBlaze Zone
        </div>
      </div>
    `,
    iconSize: [80, 70],
    iconAnchor: [40, 35],
  });
};

// Map controller component - follows user when tracking
const MapController = ({ center, isTracking, shouldCenter }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && (isTracking || shouldCenter)) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, isTracking, shouldCenter, map]);
  
  return null;
};

const MapPage = () => {
  const { 
    userTerritories, 
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
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [initialCentered, setInitialCentered] = useState(false);
  const holdTimerRef = useRef(null);

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

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ height: '100dvh' }}>
      {/* Map Container - Takes all available space above nav */}
      <div className="flex-1 relative pb-20">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          {/* Light/Clean Map Tiles - CartoDB Positron */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Map Controller - centers on user */}
          <MapController 
            center={currentPosition || mapCenter} 
            isTracking={isTracking} 
            shouldCenter={!initialCentered && currentPosition}
          />
          
          {/* Brand Territories (MuscleBlaze) with Logo */}
          {brandTerritories.map((territory) => (
            <React.Fragment key={territory.id}>
              <Polygon
                positions={territory.coordinates.map(([lng, lat]) => [lat, lng])}
                pathOptions={{
                  color: territory.color,
                  fillColor: territory.color,
                  fillOpacity: 0.2,
                  weight: 3,
                  dashArray: '8, 8',
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <img 
                      src={MUSCLEBLAZE_LOGO} 
                      alt="MuscleBlaze" 
                      className="w-12 h-12 mx-auto mb-2 object-contain"
                    />
                    <p className="font-bold text-sm">{territory.name}</p>
                    <p className="text-xs text-gray-500">Sponsored Zone</p>
                  </div>
                </Popup>
              </Polygon>
              {/* MuscleBlaze Logo Marker at center */}
              <Marker
                position={getPolygonCenter(territory.coordinates)}
                icon={createBrandLogoIcon()}
              />
            </React.Fragment>
          ))}
          
          {/* User Territories */}
          {userTerritories.map((territory) => (
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
            <div className="bg-card px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
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
    </div>
  );
};

export default MapPage;
