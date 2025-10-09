// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Camera } from 'lucide-react-native';
// import { colors, spacing, fontSizes, borderRadius } from '../styles/theme';

// export default function HomeScreen({ navigation }: any) {
//   function handleScanPress() {
//     navigation.navigate('Camera');
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>फसल रोग पहचानकर्ता</Text>
//         <Text style={styles.subtitle}>Crop Disease Identifier</Text>
//       </View>

//       <View style={styles.content}>
//         <TouchableOpacity style={styles.scanButton} onPress={handleScanPress} activeOpacity={0.8}>
//           <Camera size={48} color={colors.surface} />
//           <Text style={styles.scanText}>स्कैन करें</Text>
//           <Text style={styles.scanSubtext}>Scan Plant</Text>
//         </TouchableOpacity>

//         <View style={styles.tipsContainer}>
//           <Text style={styles.tipsTitle}>Tips for best results:</Text>
//           <Text style={styles.tipText}>• Take photo in good lighting</Text>
//           <Text style={styles.tipText}>• Focus on affected leaf area</Text>
//           <Text style={styles.tipText}>• Keep leaf centered in frame</Text>
//           <Text style={styles.tipText}>• Avoid blurry images</Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     paddingTop: spacing.xxl,
//     paddingHorizontal: spacing.lg,
//     paddingBottom: spacing.lg,
//     backgroundColor: colors.primary,
//   },
//   title: {
//     fontSize: fontSizes.xl,
//     fontWeight: 'bold',
//     color: colors.surface,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: fontSizes.md,
//     color: colors.surface,
//     textAlign: 'center',
//     marginTop: spacing.xs,
//     opacity: 0.9,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: spacing.lg,
//     paddingTop: spacing.xl,
//     alignItems: 'center',
//   },
//   scanButton: {
//     backgroundColor: colors.primary,
//     width: 200,
//     height: 200,
//     borderRadius: borderRadius.full,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   scanText: {
//     fontSize: fontSizes.xl,
//     fontWeight: 'bold',
//     color: colors.surface,
//     marginTop: spacing.md,
//   },
//   scanSubtext: {
//     fontSize: fontSizes.sm,
//     color: colors.surface,
//     opacity: 0.9,
//   },
//   tipsContainer: {
//     marginTop: spacing.xxl,
//     padding: spacing.lg,
//     backgroundColor: colors.surface,
//     borderRadius: borderRadius.md,
//     width: '100%',
//   },
//   tipsTitle: {
//     fontSize: fontSizes.md,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: spacing.sm,
//   },
//   tipText: {
//     fontSize: fontSizes.sm,
//     color: colors.textSecondary,
//     marginVertical: spacing.xs,
//   },
// });




import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Camera, Settings, History, BookOpen } from "lucide-react-native";

export default function HomeScreen({ navigation }: any) {
  function handleScanPress() {
    navigation.navigate("Camera");
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>🌱 CropGuard</Text>
          <TouchableOpacity>
            <Settings size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          {/* Farmer with crops image above text */}
          <Image
            source={{
              uri: "https://example.com/path-to-farmer-with-crops.jpg", // ✅ Working image link
            }}
            style={styles.heroImageLarge}
          />
          <Text style={styles.heroTitle}>Protect Your Crops</Text>
          <Text style={styles.heroSubtitle}>
            Identify diseases instantly with AI-powered detection
          </Text>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.scanText}>Scan Now</Text>
        </TouchableOpacity>

        {/* History & Tips */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.smallCard}>
            <History size={22} color="#22c55e" />
            <Text style={styles.smallCardText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallCard}>
            <BookOpen size={22} color="#22c55e" />
            <Text style={styles.smallCardText}>Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <Text style={styles.quickTipsTitle}>Quick Tips</Text>

        {/* Tip 1 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipCardTitle}>📷 Upload Leaf Photo</Text>
          <Text style={styles.tipCardText}>
            Take a clear photo of the affected leaf for accurate detection
          </Text>
        </View>

        {/* Tip 2 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipCardTitle}>💧 Watering Schedule</Text>
          <Text style={styles.tipCardText}>
            Water your crops early in the morning to reduce evaporation and prevent fungal growth.
          </Text>
        </View>

        {/* Tip 3 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipCardTitle}>🌞 Proper Sunlight</Text>
          <Text style={styles.tipCardText}>
            Ensure your crops get enough sunlight but avoid overexposure to prevent leaf burns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
    marginTop: 25,
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  // Hero card
  heroCard: {
    backgroundColor: "#22c55e",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  heroImageLarge: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 12,
    borderRadius: 70,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
    marginTop: 4,
  },

  // Scan button
  scanButton: {
    backgroundColor: "#22c55e",
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Row buttons
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 2,
  },
  smallCardText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    color: "#111827",
  },

  // Quick Tips
  quickTipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 8,
    color: "#111827",
  },
  tipCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tipCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  tipCardText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
