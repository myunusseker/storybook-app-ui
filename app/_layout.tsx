import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PlayerProvider } from '@/contexts/PlayerContext';
import MiniPlayer from '@/components/MiniPlayer';
import React from 'react';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PlayerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen 
          name="story-player" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'vertical',
            animationTypeForReplace: 'push'
          }} 
        />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="voice-setup" options={{ headerShown: false }} />
      </Stack>
      <MiniPlayer />
      <StatusBar style="auto" />
    </PlayerProvider>
  );
}
