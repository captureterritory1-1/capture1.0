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

// Bangalore center coordinates - Indiranagar area (where brand territories are)
const BANGALORE_CENTER = [12.9750, 77.6380];

// API base URL for proxy
const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Brand logos - Original URLs (for map markers which work with img tags)
const BRAND_LOGOS_DIRECT = {
  MuscleBlaze: 'https://static.prod-images.emergentagent.com/jobs/62a390cf-e991-4f9e-9698-d97c5fc17e8c/images/a1e286660452ee772461319f47f6c2d26505153492ccf260839fc12854fc75b5.png',
  SuperYou: 'https://static.prod-images.emergentagent.com/jobs/62a390cf-e991-4f9e-9698-d97c5fc17e8c/images/353c69b660c5a9d87ed77019a52a130d9b3ad1dc80a8f026a2c2f4189573e2fb.png',
  TheWholeTruth: 'https://static.prod-images.emergentagent.com/jobs/62a390cf-e991-4f9e-9698-d97c5fc17e8c/images/a61d5ce669bb099866a4b8fd9ff58ef1c808ddf2f9a129d41b39ee4c710f3389.png',
};

// Brand logos - Proxied URLs (for canvas drawing which requires CORS)
const getProxiedLogoUrl = (brandKey) => {
  const directUrl = BRAND_LOGOS_DIRECT[brandKey];
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(directUrl)}`;
};

// Brand prizes/coupons
const BRAND_PRIZES = {
  MuscleBlaze: { discount: '₹500 OFF', code: 'CAPTURE500', description: 'on your next MuscleBlaze order' },
  SuperYou: { discount: '30% OFF', code: 'SUPERYOU30', description: 'on all SuperYou products' },
  TheWholeTruth: { discount: 'FREE BAR', code: 'TRUTHBAR', description: 'Get 1 protein bar free' },
};

// Hardcoded brand territories with REALISTIC road-snapped coordinates in Bangalore
const BRAND_TERRITORIES = [
  // === MuscleBlaze Territories (3) ===
  {
    id: 'brand_muscleblaze_1',
    name: 'MuscleBlaze - Indiranagar 12th Main',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00', // Orange
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze, // Direct URL for map markers
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'), // Proxied URL for canvas
    prize: BRAND_PRIZES.MuscleBlaze,
    // Rectangular block along Indiranagar 12th Main Road
    coordinates: [
      [77.6380, 12.9780],
      [77.6420, 12.9780],
      [77.6420, 12.9760],
      [77.6380, 12.9760],
      [77.6380, 12.9780],
    ],
    area: 0.12,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_2',
    name: 'MuscleBlaze - Koramangala 80ft Road',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00',
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze,
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'),
    prize: BRAND_PRIZES.MuscleBlaze,
    // Rectangular block along Koramangala 80ft Road
    coordinates: [
      [77.6160, 12.9345],
      [77.6200, 12.9345],
      [77.6200, 12.9320],
      [77.6160, 12.9320],
      [77.6160, 12.9345],
    ],
    area: 0.14,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_3',
    name: 'MuscleBlaze - HSR Layout Sector 2',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00',
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze,
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'),
    prize: BRAND_PRIZES.MuscleBlaze,
    // Rectangular block in HSR Layout
    coordinates: [
      [77.6400, 12.9130],
      [77.6450, 12.9130],
      [77.6450, 12.9100],
      [77.6400, 12.9100],
      [77.6400, 12.9130],
    ],
    area: 0.15,
    isSponsored: true,
  },
  
  // === Super You Territories (2) ===
  {
    id: 'brand_superyou_1',
    name: 'Super You - Indiranagar 100ft Road',
    brand: 'Super You',
    brandKey: 'SuperYou',
    color: '#EF4444', // Red (matches brand)
    logoUrl: BRAND_LOGOS.SuperYou,
    prize: BRAND_PRIZES.SuperYou,
    // Long rectangular block along 100ft Road Indiranagar
    coordinates: [
      [77.6350, 12.9720],
      [77.6410, 12.9720],
      [77.6410, 12.9700],
      [77.6350, 12.9700],
      [77.6350, 12.9720],
    ],
    area: 0.18,
    isSponsored: true,
  },
  {
    id: 'brand_superyou_2',
    name: 'Super You - Indiranagar Double Road',
    brand: 'Super You',
    brandKey: 'SuperYou',
    color: '#EF4444',
    logoUrl: BRAND_LOGOS.SuperYou,
    prize: BRAND_PRIZES.SuperYou,
    // Block near Double Road intersection
    coordinates: [
      [77.6420, 12.9810],
      [77.6460, 12.9810],
      [77.6460, 12.9785],
      [77.6420, 12.9785],
      [77.6420, 12.9810],
    ],
    area: 0.12,
    isSponsored: true,
  },
  
  // === The Whole Truth Territories (2) ===
  {
    id: 'brand_twt_1',
    name: 'The Whole Truth - Koramangala 5th Block',
    brand: 'The Whole Truth',
    brandKey: 'TheWholeTruth',
    color: '#6B21A8', // Purple (matches brand)
    logoUrl: BRAND_LOGOS.TheWholeTruth,
    prize: BRAND_PRIZES.TheWholeTruth,
    // Square park block in 5th Block Koramangala
    coordinates: [
      [77.6100, 12.9360],
      [77.6130, 12.9360],
      [77.6130, 12.9330],
      [77.6100, 12.9330],
      [77.6100, 12.9360],
    ],
    area: 0.10,
    isSponsored: true,
  },
  {
    id: 'brand_twt_2',
    name: 'The Whole Truth - Sony World Signal',
    brand: 'The Whole Truth',
    brandKey: 'TheWholeTruth',
    color: '#6B21A8',
    logoUrl: BRAND_LOGOS.TheWholeTruth,
    prize: BRAND_PRIZES.TheWholeTruth,
    // Triangular junction block near Sony World Signal
    coordinates: [
      [77.6180, 12.9280],
      [77.6220, 12.9295],
      [77.6210, 12.9260],
      [77.6180, 12.9280],
    ],
    area: 0.08,
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
  const [allTerritories, setAllTerritories] = useState([]); // All territories from all users
  const [isLoadingTerritories, setIsLoadingTerritories] = useState(true);

  // API base URL
  const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

  // Fetch ALL territories from backend (multi-user)
  const fetchAllTerritories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/territories`);
      if (response.ok) {
        const data = await response.json();
        setAllTerritories(data);
      }
    } catch (error) {
      console.error('Failed to fetch territories:', error);
    } finally {
      setIsLoadingTerritories(false);
    }
  }, [API_BASE]);

  // Save territory to backend
  const saveTerritory = useCallback(async (territory, userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/territories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 'anonymous',
          name: territory.name,
          coordinates: territory.coordinates,
          color: territory.color,
          distance: territory.distance,
          duration: territory.duration,
        }),
      });
      if (response.ok) {
        // Refresh all territories
        fetchAllTerritories();
      }
    } catch (error) {
      console.error('Failed to save territory to backend:', error);
    }
  }, [API_BASE, fetchAllTerritories]);

  // Load territories on mount - both from backend and localStorage
  useEffect(() => {
    // Fetch from backend for multi-user view
    fetchAllTerritories();
    
    // Also load local territories (for offline/immediate display)
    const stored = localStorage.getItem('capture_territories');
    if (stored) {
      setUserTerritories(JSON.parse(stored));
    }
    const storedRuns = localStorage.getItem('capture_runs');
    if (storedRuns) {
      setSavedRuns(JSON.parse(storedRuns));
    }
  }, [fetchAllTerritories]);

  // Save territories to localStorage (for offline access)
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
      
      // Save to backend for multi-user sync
      saveTerritory(newTerritory);
      
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
  }, [currentPath, userTerritories.length, userPreferences.territoryColor, totalDistance, elapsedTime, calculateDistance, saveTerritory]);

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
    allTerritories, // All territories from all users (multi-user view)
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
    isLoadingTerritories,
    
    // Actions
    startTracking,
    stopTracking,
    analyzeAndCreateTerritory,
    updatePreferences,
    setMapCenter,
    setCurrentPosition,
    fetchAllTerritories,
    
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
