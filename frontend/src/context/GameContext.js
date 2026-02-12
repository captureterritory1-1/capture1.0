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
  
  // Saved runs (non-territory trails)
  const [savedRuns, setSavedRuns] = useState([]);
  
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
  
  // Geolocation watch IDs - separate for passive tracking and active capture
  const [passiveWatchId, setPassiveWatchId] = useState(null);
  const [captureWatchId, setCaptureWatchId] = useState(null);

  // Load user territories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('capture_territories');
    if (stored) {
      setUserTerritories(JSON.parse(stored));
    }
    const storedRuns = localStorage.getItem('capture_runs');
    if (storedRuns) {
      setSavedRuns(JSON.parse(storedRuns));
    }
  }, []);

  // Save territories to localStorage
  useEffect(() => {
    if (userTerritories.length > 0) {
      localStorage.setItem('capture_territories', JSON.stringify(userTerritories));
    }
  }, [userTerritories]);

  // Save runs to localStorage
  useEffect(() => {
    if (savedRuns.length > 0) {
      localStorage.setItem('capture_runs', JSON.stringify(savedRuns));
    }
  }, [savedRuns]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('capture_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // IMMEDIATE GPS TRACKING - Start watching position on mount (Blue Dot always visible)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = [latitude, longitude];
        setCurrentPosition(newPoint);
        // Center map on first position only
        setMapCenter((prev) => {
          if (prev[0] === BANGALORE_CENTER[0] && prev[1] === BANGALORE_CENTER[1]) {
            return newPoint;
          }
          return prev;
        });
      },
      (error) => {
        console.error('Passive geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setPassiveWatchId(id);

    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

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

  // Calculate path distance using turf.length for accuracy
  const calculatePathDistance = useCallback((path) => {
    if (path.length < 2) return 0;
    
    // Convert path to GeoJSON LineString format [lng, lat]
    const lineCoords = path.map(([lat, lng]) => [lng, lat]);
    const line = turf.lineString(lineCoords);
    
    // Calculate total length in kilometers
    return turf.length(line, { units: 'kilometers' });
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1, point2) => {
    const from = turf.point([point1[1], point1[0]]);
    const to = turf.point([point2[1], point2[0]]);
    return turf.distance(from, to, { units: 'kilometers' });
  }, []);

  // Start tracking/capture - only records path, Blue Dot already visible
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return false;
    }

    // Initialize capture state
    setIsTracking(true);
    setCurrentPath(currentPosition ? [currentPosition] : []);
    setTrackingStartTime(Date.now());
    setElapsedTime(0);
    setTotalDistance(0);

    // Start high-accuracy tracking for capture (separate from passive Blue Dot)
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = [latitude, longitude];
        
        // Update current position (Blue Dot)
        setCurrentPosition(newPoint);
        setMapCenter(newPoint);
        
        // Record path for capture - NO auto-detection, just collect points
        setCurrentPath((prev) => {
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = calculateDistance(lastPoint, newPoint);
            
            // Only add point if moved more than 5 meters (to filter GPS noise)
            if (dist > 0.005) {
              const newPath = [...prev, newPoint];
              // Use turf.length for accurate total distance
              const totalDist = calculatePathDistance(newPath);
              setTotalDistance(totalDist);
              return newPath;
            }
            return prev;
          }
          return [newPoint];
        });
      },
      (error) => {
        console.error('Capture geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setCaptureWatchId(id);
    return true;
  }, [calculateDistance, calculatePathDistance, currentPosition]);

  // Stop tracking - just stops, doesn't analyze
  const stopTracking = useCallback(() => {
    if (captureWatchId) {
      navigator.geolocation.clearWatch(captureWatchId);
      setCaptureWatchId(null);
    }
    setIsTracking(false);
  }, [captureWatchId]);

  // Analyze and create territory from path - ONLY called on manual "End Capture"
  const analyzeAndCreateTerritory = useCallback(() => {
    // Save the run data regardless of loop status
    const runData = {
      id: `run_${Date.now()}`,
      path: currentPath.map(([lat, lng]) => [lng, lat]),
      distance: totalDistance,
      duration: elapsedTime,
      createdAt: new Date().toISOString(),
    };

    if (currentPath.length < 4) {
      // Save as run (not territory)
      setSavedRuns((prev) => [...prev, runData]);
      
      // Reset tracking state
      setCurrentPath([]);
      setTotalDistance(0);
      setElapsedTime(0);
      setTrackingStartTime(null);
      
      return { 
        success: false, 
        isRun: true,
        message: 'Run Saved! Need more points for territory.', 
        run: runData 
      };
    }

    // Close the loop by connecting last point to first
    const closedPath = [...currentPath, currentPath[0]];
    
    // Convert to GeoJSON format (lon, lat)
    const coordinates = closedPath.map(([lat, lng]) => [lng, lat]);
    
    try {
      // Create polygon
      const polygon = turf.polygon([coordinates]);
      
      // Check if valid polygon
      if (!polygon) {
        // Save as run instead
        setSavedRuns((prev) => [...prev, runData]);
        setCurrentPath([]);
        setTotalDistance(0);
        setElapsedTime(0);
        setTrackingStartTime(null);
        return { success: false, isRun: true, message: 'Run Saved! Trail did not form a closed loop.', run: runData };
      }

      // Calculate area
      const area = turf.area(polygon) / 1000000; // Convert to sq km
      
      // Check if start and end are close enough (within 50 meters)
      const startPoint = currentPath[0];
      const endPoint = currentPath[currentPath.length - 1];
      const loopDistance = calculateDistance(startPoint, endPoint);
      
      // If loop is not closed (start/end > 50m apart), save as run
      if (loopDistance > 0.05) {
        setSavedRuns((prev) => [...prev, runData]);
        setCurrentPath([]);
        setTotalDistance(0);
        setElapsedTime(0);
        setTrackingStartTime(null);
        return { success: false, isRun: true, message: 'Run Saved! Return to start point to claim territory.', run: runData };
      }
      
      // Minimum area check (100 sq meters = 0.0001 sq km)
      if (area < 0.0001) {
        setSavedRuns((prev) => [...prev, runData]);
        setCurrentPath([]);
        setTotalDistance(0);
        setElapsedTime(0);
        setTrackingStartTime(null);
        return { success: false, isRun: true, message: 'Run Saved! Territory too small.', run: runData };
      }

      // SUCCESS - Create territory object
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
      // Save as run on error
      setSavedRuns((prev) => [...prev, runData]);
      setCurrentPath([]);
      setTotalDistance(0);
      setElapsedTime(0);
      setTrackingStartTime(null);
      return { success: false, isRun: true, message: 'Run Saved! Could not create territory.', run: runData };
    }
  }, [currentPath, userTerritories.length, userPreferences.territoryColor, totalDistance, elapsedTime, calculateDistance]);

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
    savedRuns,
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
    setCurrentPosition,
    
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
