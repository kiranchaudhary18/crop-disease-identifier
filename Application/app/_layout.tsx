import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import App from '../src/App';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <NavigationIndependentTree>
      <App />
    </NavigationIndependentTree>
  );
}
