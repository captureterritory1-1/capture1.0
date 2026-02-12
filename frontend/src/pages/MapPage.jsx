import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import TrackingSheet from '../components/TrackingSheet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker for current position
const createPulsingIcon = (color) => {
  return L.divIcon({
    className: 'custom-pulsing-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          inset: -8px;
          border: 2px solid ${color};
          border-radius: 50%;
          opacity: 0.5;
          animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Brand marker icon
const createBrandIcon = () => {
  return L.divIcon({
    className: 'brand-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        MuscleBlaze
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });
};

// Map controller component
const MapController = ({ center, isTracking }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && isTracking) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, isTracking, map]);
  
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
  const holdTimerRef = useRef(null);

  // Request geolocation permission on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location access granted');
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Please enable location access to use CAPTURE');
        }
      );
    }
  }, []);

  const handleStartRun = () => {
    const started = startTracking();
    if (started) {
      toast.success('Tracking started! Start running to capture territory.');
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
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
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
          
          {/* Map Controller */}
          <MapController center={currentPosition || mapCenter} isTracking={isTracking} />
          
          {/* Brand Territories (MuscleBlaze) */}
          {brandTerritories.map((territory) => (
            <React.Fragment key={territory.id}>
              <Polygon
                positions={territory.coordinates.map(([lng, lat]) => [lat, lng])}
                pathOptions={{
                  color: territory.color,
                  fillColor: territory.color,
                  fillOpacity: 0.25,
                  weight: 3,
                  dashArray: '5, 10',
                }}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-sm">{territory.name}</p>
                    <p className="text-xs text-muted-foreground">Sponsored Zone</p>
                  </div>
                </Popup>
              </Polygon>
              <Marker
                position={getPolygonCenter(territory.coordinates)}
                icon={createBrandIcon()}
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
                  <p className="text-xs text-muted-foreground">
                    {(territory.area * 1000000).toFixed(0)} sq m
                  </p>
                </div>
              </Popup>
            </Polygon>
          ))}
          
          {/* Current tracking path */}
          {currentPath.length > 1 && (
            <Polyline
              positions={currentPath}
              pathOptions={{
                color: userPreferences.territoryColor.hex,
                weight: 4,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}
          
          {/* Current position marker */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={createPulsingIcon(userPreferences.territoryColor.hex)}
            />
          )}
        </MapContainer>
        
        {/* Attribution overlay */}
        <div className="absolute bottom-28 left-2 text-xs text-muted-foreground/60 z-[400]">
          © OpenStreetMap
        </div>
      </div>

      {/* Tracking Sheet */}
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MapPage;
