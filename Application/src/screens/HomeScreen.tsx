import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors, spacing, fontSizes, borderRadius } from '../styles/theme';

export default function HomeScreen({ navigation }: any) {
  function handleScanPress() {
    navigation.navigate('Camera');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>फसल रोग पहचानकर्ता</Text>
        <Text style={styles.subtitle}>Crop Disease Identifier</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress} activeOpacity={0.8}>
          <Camera size={48} color={colors.surface} />
          <Text style={styles.scanText}>स्कैन करें</Text>
          <Text style={styles.scanSubtext}>Scan Plant</Text>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for best results:</Text>
          <Text style={styles.tipText}>• Take photo in good lighting</Text>
          <Text style={styles.tipText}>• Focus on affected leaf area</Text>
          <Text style={styles.tipText}>• Keep leaf centered in frame</Text>
          <Text style={styles.tipText}>• Avoid blurry images</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.surface,
    marginTop: spacing.md,
  },
  scanSubtext: {
    fontSize: fontSizes.sm,
    color: colors.surface,
    opacity: 0.9,
  },
  tipsContainer: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  tipsTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
  },
});
