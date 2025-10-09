import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Home as HomeIcon, History as HistoryIcon, Settings as SettingsIcon } from "lucide-react-native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { Loader } from "./components/Loader";

import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/CameraScreen";
import PreviewScreen from "./screens/PreviewScreen";
import ResultScreen from "./screens/ResultScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.surface,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => <HistoryIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();
  const { theme, colors } = useApp();

  if (loading) {
    return <Loader message="Loading..." />;
  }

  // Navigation theme setup
  const navTheme: Theme = theme === "dark" ? DarkTheme : DefaultTheme;
  navTheme.colors.background = colors.background;
  navTheme.colors.card = colors.surface;
  navTheme.colors.text = colors.text;
  navTheme.colors.border = colors.surface;

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function NavigationWrapper() {
  const { theme } = useApp();
  return (
    <>
      <Navigation />
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavigationWrapper />
      </AppProvider>
    </AuthProvider>
  );
}
