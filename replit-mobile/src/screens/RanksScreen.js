import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { leaderboardAPI } from '../services/api';

export default function RanksScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get(20);
      setLeaderboard(response.data);
    } catch (error) {
      console.log('Failed to load leaderboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboardItem = ({ item }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.display_name}</Text>
        <Text style={styles.playerStats}>
          {item.territories} territories • {item.total_distance} km
        </Text>
      </View>

      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{item.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Territory Conquerors</Text>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 28,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  playerStats: {
    ...TYPOGRAPHY.caption,
  },
  pointsBadge: {
    alignItems: 'flex-end',
  },
  pointsText: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
  },
  pointsLabel: {
    ...TYPOGRAPHY.caption,
  },
});
