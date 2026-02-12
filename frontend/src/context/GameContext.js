import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as turf from '@turf/turf';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Bangalore center coordinates
const BANGALORE_CENTER = [12.9716, 77.5946];

// Hardcoded MuscleBlaze brand territories in Bangalore
const BRAND_TERRITORIES = [
  {
    id: 'brand_muscleblaze_1',
    name: 'MuscleBlaze Zone - Indiranagar',
    brand: 'MuscleBlaze',
    color: '#FFD700', // Gold
    coordinates: [
      [77.6390, 12.9780],
      [77.6420, 12.9810],
      [77.6450, 12.9790],
      [77.6440, 12.9750],
      [77.6400, 12.9740],
      [77.6390, 12.9780],
    ],
    area: 0.15,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_2',
    name: 'MuscleBlaze Zone - Koramangala',
    brand: 'MuscleBlaze',
    color: '#FFD700',
    coordinates: [
      [77.6150, 12.9340],
      [77.6190, 12.9370],
      [77.6230, 12.9350],
      [77.6220, 12.9310],
      [77.6170, 12.9300],
      [77.6150, 12.9340],
    ],
    area: 0.18,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_3',
    name: 'MuscleBlaze Zone - HSR Layout',
    brand: 'MuscleBlaze',
    color: '#FFD700',
    coordinates: [
      [77.6400, 12.9120],
      [77.6440, 12.9150],
      [77.6480, 12.9130],
      [77.6470, 12.9090],
      [77.6420, 12.9080],
      [77.6400, 12.9120],
    ],
    area: 0.16,
    isSponsored: true,
  },
];

// Territory colors available for users
const TERRITORY_COLORS = [
  { id: 'red', name: 'Ruby Red', hex: '#EF4444' },
  { id: 'blue', name: 'Ocean Blue', hex: '#3B82F6' },
  { id: 'green', name: 'Forest Green', hex: '#22C55E' },
  { id: 'yellow', name: 'Sunburst Yellow', hex: '#EAB308' },
  { id: 'purple', name: 'Royal Purple', hex: '#A855F7' },
  { id: 'orange', name: 'Sunset Orange', hex: '#F97316' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#06B6D4' },
  { id: 'magenta', name: 'Neon Magenta', hex: '#EC4899' },
];

export const GameProvider = ({ children }) => {
  // User territories
  const [userTerritories, setUserTerritories] = useState([]);
  
  // Current tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  
  // Map center
  const [mapCenter, setMapCenter] = useState(BANGALORE_CENTER);
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState(() => {
    const stored = localStorage.getItem('capture_preferences');
    return stored ? JSON.parse(stored) : {
      unit: 'km',
      activityType: 'run',
      territoryColor: TERRITORY_COLORS[0],
    };
  });
  
  // Geolocation watch ID
  const [watchId, setWatchId] = useState(null);

  // Load user territories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('capture_territories');
    if (stored) {
      setUserTerritories(JSON.parse(stored));
    }
  }, []);

  // Save territories to localStorage
  useEffect(() => {
    if (userTerritories.length > 0) {
      localStorage.setItem('capture_territories', JSON.stringify(userTerritories));
    }
  }, [userTerritories]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('capture_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Timer for tracking
  useEffect(() => {
    let interval;
    if (isTracking && trackingStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - trackingStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, trackingStartTime]);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1, point2) => {
    const from = turf.point([point1[1], point1[0]]);
    const to = turf.point([point2[1], point2[0]]);
    return turf.distance(from, to, { units: 'kilometers' });
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return false;
    }

    setIsTracking(true);
    setCurrentPath([]);
    setTrackingStartTime(Date.now());
    setElapsedTime(0);
    setTotalDistance(0);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newPoint = [latitude, longitude];
        
        setCurrentPosition(newPoint);
        setMapCenter(newPoint);
        
        setCurrentPath((prev) => {
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = calculateDistance(lastPoint, newPoint);
            
            // Only add point if moved more than 5 meters (to filter GPS noise)
            if (dist > 0.005) {
              setTotalDistance((prevDist) => prevDist + dist);
              return [...prev, newPoint];
            }
            return prev;
          }
          return [newPoint];
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
    return true;
  }, [calculateDistance]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Analyze and create territory from path
  const analyzeAndCreateTerritory = useCallback(() => {
    if (currentPath.length < 4) {
      return { success: false, message: 'Need at least 4 points to create a territory' };
    }

    // Close the loop by connecting last point to first
    const closedPath = [...currentPath, currentPath[0]];
    
    // Convert to GeoJSON format (lon, lat)
    const coordinates = closedPath.map(([lat, lng]) => [lng, lat]);
    
    try {
      // Create polygon
      const polygon = turf.polygon([coordinates]);
      
      // Check if valid
      if (!polygon) {
        return { success: false, message: 'Trail ended without closing a loop' };
      }

      // Calculate area
      const area = turf.area(polygon) / 1000000; // Convert to sq km
      
      // Minimum area check (100 sq meters = 0.0001 sq km)
      if (area < 0.0001) {
        return { success: false, message: 'Territory too small. Run a bigger loop!' };
      }

      // Create territory object
      const newTerritory = {
        id: `territory_${Date.now()}`,
        name: `Territory ${userTerritories.length + 1}`,
        coordinates: coordinates,
        color: userPreferences.territoryColor.hex,
        area: area,
        createdAt: new Date().toISOString(),
        distance: totalDistance,
        duration: elapsedTime,
        isSponsored: false,
      };

      setUserTerritories((prev) => [...prev, newTerritory]);
      
      // Reset tracking state
      setCurrentPath([]);
      setTotalDistance(0);
      setElapsedTime(0);
      setTrackingStartTime(null);

      return { 
        success: true, 
        message: 'Territory Claimed!', 
        territory: newTerritory 
      };
    } catch (error) {
      console.error('Error creating territory:', error);
      return { success: false, message: 'Trail ended without closing a loop' };
    }
  }, [currentPath, userTerritories.length, userPreferences.territoryColor, totalDistance, elapsedTime]);

  // Format time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format distance
  const formatDistance = useCallback((km) => {
    if (userPreferences.unit === 'miles') {
      return (km * 0.621371).toFixed(2);
    }
    return km.toFixed(2);
  }, [userPreferences.unit]);

  // Update preferences
  const updatePreferences = useCallback((newPrefs) => {
    setUserPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  // Get total stats
  const getTotalStats = useCallback(() => {
    const totalArea = userTerritories.reduce((sum, t) => sum + t.area, 0);
    const totalDist = userTerritories.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalTime = userTerritories.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    return {
      territories: userTerritories.length,
      totalArea: totalArea.toFixed(4),
      totalDistance: totalDist.toFixed(2),
      totalTime: formatTime(totalTime),
    };
  }, [userTerritories, formatTime]);

  const value = {
    // State
    userTerritories,
    brandTerritories: BRAND_TERRITORIES,
    isTracking,
    currentPath,
    currentPosition,
    elapsedTime,
    totalDistance,
    mapCenter,
    userPreferences,
    territoryColors: TERRITORY_COLORS,
    
    // Actions
    startTracking,
    stopTracking,
    analyzeAndCreateTerritory,
    updatePreferences,
    setMapCenter,
    
    // Utilities
    formatTime,
    formatDistance,
    getTotalStats,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
