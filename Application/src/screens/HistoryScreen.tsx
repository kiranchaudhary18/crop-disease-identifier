import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ Ionicons import
import { useAuth } from '../context/AuthContext';
import { getUserScans } from '../services/scanService';
import { ScanCard } from '../components/ScanCard';
import { Loader } from '../components/Loader';
import { colors, spacing, fontSizes } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { STORAGE_BUCKET } from '../utils/constants';

export default function HistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Resolve image URLs from Supabase
  async function resolveImageUrl(imageUrl: string): Promise<string> {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(imageUrl, 60 * 60);

      if (!error && data?.signedUrl) return data.signedUrl;
    } catch (e) {
      console.error('Error resolving image URL:', e);
    }

    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imageUrl);
    return publicData.publicUrl;
  }

  const loadScans = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getUserScans(user.id);
      const withResolvedUrls = await Promise.all(
        (data || []).map(async (scan: any) => ({
          ...scan,
          image_url: await resolveImageUrl(scan.image_url),
        }))
      );
      setScans(withResolvedUrls);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const handleScanPress = (scan: any) => {
    navigation.navigate('Result', {
      scanId: scan.id,
      predictions: scan.prediction?.predictions || scan.prediction,
      imageUrl: scan.image_url,
      isLowConf: scan.is_low_conf,
    });
  };

  if (loading) {
    return <Loader message="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>स्कैन इतिहास</Text>
        <Text style={styles.subtitle}>Scan History</Text>
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>Start by scanning your first plant!</Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanCard
              imageUrl={item.image_url}
              prediction={item.prediction}
              confidence={item.confidence}
              createdAt={item.created_at}
              onPress={() => handleScanPress(item)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Static Plus Button */}
      <TouchableOpacity style={styles.fab} onPress={() => console.log('Plus pressed')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.surface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.surface,
    textAlign: 'center',
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  list: {
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: 'green',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
