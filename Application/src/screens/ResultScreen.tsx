import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Share,
  TouchableOpacity,
} from 'react-native';
import { Share as ShareIcon, CircleAlert as AlertCircle } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, fontSizes, borderRadius } from '../styles/theme';
import { getConfidenceColor } from '../utils/helpers';

export default function ResultScreen({ route, navigation }: any) {
  const { predictions, imageUrl, isLowConf } = route.params;

  async function handleShare() {
    try {
      const topPrediction = predictions[0];
      await Share.share({
        message: `Disease Detection Result:\n${topPrediction.name} (${Math.round(topPrediction.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  function handleScanAgain() {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>

      {isLowConf && (
        <View style={styles.warningContainer}>
          <AlertCircle size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Low confidence detected. Results may not be accurate.
          </Text>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Detected Conditions</Text>

        {predictions.map((pred: any, index: number) => (
          <View key={index} style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <Text style={styles.predictionName}>{pred.name}</Text>
              <Text
                style={[
                  styles.predictionConfidence,
                  { color: getConfidenceColor(pred.confidence) },
                ]}
              >
                {Math.round(pred.confidence * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${pred.confidence * 100}%`,
                    backgroundColor: getConfidenceColor(pred.confidence),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.remediesContainer}>
        <Text style={styles.sectionTitle}>Recommended Actions</Text>
        {predictions[0].name === 'Healthy' ? (
          <Text style={styles.remedyText}>
            ✓ Your plant looks healthy! Continue regular care and monitoring.
          </Text>
        ) : (
          <>
            <Text style={styles.remedyText}>• Remove and destroy infected leaves</Text>
            <Text style={styles.remedyText}>• Apply appropriate fungicide or treatment</Text>
            <Text style={styles.remedyText}>• Improve air circulation around plants</Text>
            <Text style={styles.remedyText}>• Avoid overhead watering</Text>
            <Text style={styles.remedyText}>• Consult local agricultural expert if severe</Text>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <ShareIcon size={20} color={colors.surface} />
          <Text style={styles.shareButtonText}>Share Result</Text>
        </TouchableOpacity>

        <PrimaryButton title="Scan Again" onPress={handleScanAgain} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.warning,
  },
  resultsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  predictionCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  predictionName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  predictionConfidence: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  remediesContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  remedyText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  shareButtonText: {
    color: colors.surface,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
