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

// BANNERGHATTA ROAD, BANGALORE - Default starting location (not a restriction)
const BANGALORE_CENTER = [12.8988, 77.6006];

// API base URL for proxy
const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Brand logos - Using user-uploaded logos (for map markers which work with img tags)
const BRAND_LOGOS_DIRECT = {
  MuscleBlaze: 'https://customer-assets.emergentagent.com/job_area-claim/artifacts/hdwrq9jx_images-2.png',
  SuperYou: 'https://customer-assets.emergentagent.com/job_area-claim/artifacts/qderkt0t_channels4_profile.jpg',
  TheWholeTruth: 'https://customer-assets.emergentagent.com/job_area-claim/artifacts/en3r28t5_images-4.png',
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

// BANNERGHATTA ROAD BRAND TERRITORIES - Real-world locations
const BRAND_TERRITORIES = [
  // === MuscleBlaze Territories (3) - Bannerghatta Road ===
  {
    id: 'brand_muscleblaze_1',
    name: 'MuscleBlaze - Decathlon Bannerghatta',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00', // Orange
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze,
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'),
    prize: BRAND_PRIZES.MuscleBlaze,
    // Decathlon Bannerghatta - near Gottigere junction
    coordinates: [
      [77.5985, 12.8850],
      [77.6020, 12.8850],
      [77.6020, 12.8820],
      [77.5985, 12.8820],
      [77.5985, 12.8850],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_2',
    name: 'MuscleBlaze - Meenakshi Mall',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00',
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze,
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'),
    prize: BRAND_PRIZES.MuscleBlaze,
    // Meenakshi Mall Main Entrance - Bannerghatta Road
    coordinates: [
      [77.5980, 12.9010],
      [77.6020, 12.9010],
      [77.6020, 12.8980],
      [77.5980, 12.8980],
      [77.5980, 12.9010],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  {
    id: 'brand_muscleblaze_3',
    name: 'MuscleBlaze - Hulimavu Gate',
    brand: 'MuscleBlaze',
    brandKey: 'MuscleBlaze',
    color: '#FF6B00',
    logoUrl: BRAND_LOGOS_DIRECT.MuscleBlaze,
    logoUrlProxied: getProxiedLogoUrl('MuscleBlaze'),
    prize: BRAND_PRIZES.MuscleBlaze,
    // Hulimavu Gate Junction
    coordinates: [
      [77.5950, 12.8920],
      [77.5990, 12.8920],
      [77.5990, 12.8890],
      [77.5950, 12.8890],
      [77.5950, 12.8920],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  
  // === Super You Territories (2) - Bannerghatta Road ===
  {
    id: 'brand_superyou_1',
    name: 'Super You - Arekere Signal',
    brand: 'Super You',
    brandKey: 'SuperYou',
    color: '#EF4444', // Red (matches brand)
    logoUrl: BRAND_LOGOS_DIRECT.SuperYou,
    logoUrlProxied: getProxiedLogoUrl('SuperYou'),
    prize: BRAND_PRIZES.SuperYou,
    // Arekere Signal Intersection
    coordinates: [
      [77.5995, 12.9070],
      [77.6030, 12.9070],
      [77.6030, 12.9040],
      [77.5995, 12.9040],
      [77.5995, 12.9070],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  {
    id: 'brand_superyou_2',
    name: 'Super You - IIM Bangalore',
    brand: 'Super You',
    brandKey: 'SuperYou',
    color: '#EF4444',
    logoUrl: BRAND_LOGOS_DIRECT.SuperYou,
    logoUrlProxied: getProxiedLogoUrl('SuperYou'),
    prize: BRAND_PRIZES.SuperYou,
    // IIM Bangalore Wall Strip
    coordinates: [
      [77.5940, 12.9110],
      [77.5980, 12.9110],
      [77.5980, 12.9085],
      [77.5940, 12.9085],
      [77.5940, 12.9110],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  
  // === The Whole Truth Territories (2) - Bannerghatta Road ===
  {
    id: 'brand_twt_1',
    name: 'The Whole Truth - Vega City Mall',
    brand: 'The Whole Truth',
    brandKey: 'TheWholeTruth',
    color: '#6B21A8', // Purple (matches brand)
    logoUrl: BRAND_LOGOS_DIRECT.TheWholeTruth,
    logoUrlProxied: getProxiedLogoUrl('TheWholeTruth'),
    prize: BRAND_PRIZES.TheWholeTruth,
    // Vega City Mall Zone
    coordinates: [
      [77.5960, 12.8960],
      [77.6000, 12.8960],
      [77.6000, 12.8930],
      [77.5960, 12.8930],
      [77.5960, 12.8960],
    ],
    distance: 0,
    duration: 0,
    isSponsored: true,
  },
  {
    id: 'brand_twt_2',
    name: 'The Whole Truth - Jayadeva Flyover',
    brand: 'The Whole Truth',
    brandKey: 'TheWholeTruth',
    color: '#6B21A8',
    logoUrl: BRAND_LOGOS_DIRECT.TheWholeTruth,
    logoUrlProxied: getProxiedLogoUrl('TheWholeTruth'),
    prize: BRAND_PRIZES.TheWholeTruth,
    // Jayadeva Flyover Start
    coordinates: [
      [77.5920, 12.9150],
      [77.5960, 12.9150],
      [77.5960, 12.9120],
      [77.5920, 12.9120],
      [77.5920, 12.9150],
    ],
    distance: 0,
    duration: 0,
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
  
  // User preferences - now synced with backend
  const [userPreferences, setUserPreferences] = useState(() => {
    const stored = localStorage.getItem('capture_preferences');
    return stored ? JSON.parse(stored) : {
      unit: 'km',
      activityType: 'run',
      territoryColor: TERRITORY_COLORS[0],
      theme: 'dark',
      notificationsEnabled: true,
      privacy: 'public',
    };
  });
  
  // Track if preferences are loaded from backend
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  
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

  // Save preferences to localStorage (for offline access)
  useEffect(() => {
    localStorage.setItem('capture_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Load preferences from backend for logged-in user
  const loadPreferencesFromBackend = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/preferences`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          const backendPrefs = data.preferences;
          
          // Map backend format to frontend format
          const mappedPrefs = {
            unit: backendPrefs.unit || 'km',
            activityType: backendPrefs.activity_type || 'run',
            territoryColor: backendPrefs.territory_color || TERRITORY_COLORS[0],
            theme: backendPrefs.theme || 'dark',
            notificationsEnabled: backendPrefs.notifications_enabled !== false,
            privacy: backendPrefs.privacy || 'public',
          };
          
          setUserPreferences(mappedPrefs);
          setPreferencesLoaded(true);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences from backend:', error);
    }
  }, [API_BASE]);

  // Save preferences to backend
  const savePreferencesToBackend = useCallback(async (userId, prefs) => {
    if (!userId) return;
    
    try {
      // Map frontend format to backend format
      const backendPrefs = {
        unit: prefs.unit,
        activity_type: prefs.activityType,
        territory_color: prefs.territoryColor,
        theme: prefs.theme,
        notifications_enabled: prefs.notificationsEnabled,
        privacy: prefs.privacy,
      };
      
      await fetch(`${API_BASE}/api/users/${userId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPrefs),
      });
    } catch (error) {
      console.error('Failed to save preferences to backend:', error);
    }
  }, [API_BASE]);

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

  // Update preferences (both local state and backend)
  const updatePreferences = useCallback((newPrefs, userId = null) => {
    setUserPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      
      // Save to backend if userId is provided
      if (userId) {
        savePreferencesToBackend(userId, updated);
      }
      
      return updated;
    });
  }, [savePreferencesToBackend]);

  // Get total stats (without area)
  const getTotalStats = useCallback(() => {
    const totalDist = userTerritories.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalTime = userTerritories.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    return {
      territories: userTerritories.length,
      totalDistance: totalDist.toFixed(2),
      totalTime: formatTime(totalTime),
    };
  }, [userTerritories, formatTime]);

  // Check if new territory overlaps with existing territories
  const checkTerritoryOverlap = useCallback((newCoordinates) => {
    const allExisting = [...allTerritories, ...BRAND_TERRITORIES];
    const newPolygon = turf.polygon([newCoordinates]);
    
    const overlappingTerritories = [];
    
    for (const territory of allExisting) {
      try {
        const existingPolygon = turf.polygon([territory.coordinates]);
        const intersection = turf.intersect(turf.featureCollection([newPolygon, existingPolygon]));
        
        if (intersection) {
          overlappingTerritories.push({
            ...territory,
            overlapArea: turf.area(intersection) / 1000000, // sq km
          });
        }
      } catch (error) {
        console.error('Error checking overlap:', error);
      }
    }
    
    return overlappingTerritories;
  }, [allTerritories]);

  // Claim/over-capture an existing territory
  const claimTerritory = useCallback(async (territoryId, newOwnerId, newColor) => {
    try {
      // Update in backend
      const response = await fetch(`${API_BASE}/api/territories/${territoryId}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_owner_id: newOwnerId,
          new_color: newColor,
        }),
      });
      
      if (response.ok) {
        // Refresh all territories
        fetchAllTerritories();
        return { success: true, message: 'Territory claimed!' };
      } else {
        return { success: false, message: 'Failed to claim territory' };
      }
    } catch (error) {
      console.error('Error claiming territory:', error);
      return { success: false, message: 'Error claiming territory' };
    }
  }, [API_BASE, fetchAllTerritories]);

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
    preferencesLoaded,
    
    // Actions
    startTracking,
    stopTracking,
    analyzeAndCreateTerritory,
    updatePreferences,
    loadPreferencesFromBackend,
    savePreferencesToBackend,
    setMapCenter,
    setCurrentPosition,
    fetchAllTerritories,
    checkTerritoryOverlap,
    claimTerritory,
    
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
