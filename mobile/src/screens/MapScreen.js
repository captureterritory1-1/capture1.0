import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SPACING } from '../constants/theme';
import { territoryAPI, brandAPI } from '../services/api';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState([]);
  const [territories, setTerritories] = useState([]);

  useEffect(() => {
    requestLocationPermission();
    loadTerritories();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required for this app');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const loadTerritories = async () => {
    try {
      const response = await territoryAPI.getAll();
      setTerritories(response.data);
    } catch (error) {
      console.log('Failed to load territories:', error.message);
    }
  };

  const startTracking = async () => {
    setTracking(true);
    setRoute([]);

    // Start watching location
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Update every 10 meters
      },
      (newLocation) => {
        const newPoint = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };
        setRoute((prev) => [...prev, newPoint]);
        setLocation({
          ...newPoint,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    );

    // Store subscription to stop later
    return locationSubscription;
  };

  const stopTracking = () => {
    setTracking(false);
    if (route.length > 3) {
      Alert.alert(
        'Claim Territory?',
        'You have completed a route! Do you want to claim this territory?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Claim',
            onPress: () => navigation.navigate('ClaimTerritory', { route }),
          },
        ]
      );
    }
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={location} showsUserLocation>
        {/* Render existing territories */}
        {territories.map((territory) => (
          <Polygon
            key={territory.id}
            coordinates={territory.coordinates.map((coord) => ({
              latitude: coord[1],
              longitude: coord[0],
            }))}
            fillColor={territory.color + '40'}
            strokeColor={territory.color}
            strokeWidth={2}
          />
        ))}

        {/* Render current tracking route */}
        {route.length > 0 && (
          <Polygon
            coordinates={route}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            fillColor={COLORS.primary + '20'}
          />
        )}
      </MapView>

      {/* Tracking button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.trackingButton,
            tracking && styles.trackingButtonActive,
          ]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackingButtonText}>
            {tracking ? 'Stop & Claim' : 'Start Run'}
          </Text>
        </TouchableOpacity>

        {tracking && (
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              Distance: {route.length * 10}m
            </Text>
            <Text style={styles.statsText}>
              Points: {route.length}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  controls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  trackingButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  trackingButtonActive: {
    backgroundColor: COLORS.error,
  },
  trackingButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  statsText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
});
