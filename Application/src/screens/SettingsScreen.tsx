import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from "react-native";
import { LogOut, Globe, Info, Bell, SunMoon } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { signOut } from "../services/authService";

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { language, setLanguage, theme, setTheme, colors } = useApp();

  const [notificationsEnabled] = useState(true); // अभी static रहेगा

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  function toggleLanguage() {
    setLanguage(language === "hi" ? "en" : "hi");
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function openAbout() {
    navigation.navigate("About");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      {/* User Email */}
      {user?.email && (
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
      )}

      {/* Language */}
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.surface }]}
        onPress={toggleLanguage}
      >
        <View style={styles.menuItemLeft}>
          <Globe size={22} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Language</Text>
        </View>
        <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>
          {language === "hi" ? "हिंदी" : "English"}
        </Text>
      </TouchableOpacity>

      {/* Theme */}
      <View style={[styles.menuItem, { backgroundColor: colors.surface }]}>
        <View style={styles.menuItemLeft}>
          <SunMoon size={22} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Theme</Text>
        </View>
        <Switch value={theme === "dark"} onValueChange={toggleTheme} />
      </View>

      {/* Notifications */}
      <View style={[styles.menuItem, { backgroundColor: colors.surface }]}>
        <View style={styles.menuItemLeft}>
          <Bell size={22} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
        </View>
        <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>
          {notificationsEnabled ? "Enabled" : "Disabled"}
        </Text>
      </View>

      {/* About */}
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.surface }]}
        onPress={openAbout}
      >
        <View style={styles.menuItemLeft}>
          <Info size={22} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>About</Text>
        </View>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { borderColor: colors.error, backgroundColor: colors.surface },
        ]}
        onPress={handleSignOut}
      >
        <LogOut size={22} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50, // 👈 content thoda niche se start hoga
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemValue: {
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});