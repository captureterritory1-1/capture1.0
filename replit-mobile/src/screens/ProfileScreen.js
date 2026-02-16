import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { userAPI, territoryAPI } from '../services/api';

export default function ProfileScreen({ route }) {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ territories: 0, totalDistance: 0 });

  useEffect(() => {
    loadUserData();
    loadUserStats();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await userAPI.getUser(userId);
      setUser(response.data);
    } catch (error) {
      console.log('Failed to load user:', error.message);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await territoryAPI.getAll(userId);
      const territories = response.data;
      const totalDistance = territories.reduce(
        (sum, t) => sum + t.distance,
        0
      );
      setStats({
        territories: territories.length,
        totalDistance: totalDistance.toFixed(2),
      });
    } catch (error) {
      console.log('Failed to load stats:', error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.display_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{user.display_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.territories}</Text>
          <Text style={styles.statLabel}>Territories</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalDistance}</Text>
          <Text style={styles.statLabel}>Total KM</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.territories * 100}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Unit</Text>
          <Text style={styles.preferenceValue}>
            {user.preferences?.unit || 'km'}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Activity Type</Text>
          <Text style={styles.preferenceValue}>
            {user.preferences?.activity_type || 'run'}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Theme</Text>
          <Text style={styles.preferenceValue}>
            {user.preferences?.theme || 'dark'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  displayName: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  email: {
    ...TYPOGRAPHY.caption,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  preferenceLabel: {
    ...TYPOGRAPHY.body,
  },
  preferenceValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
