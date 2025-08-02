import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MiniPlayer from '@/components/MiniPlayer';
import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    const isStoryPlayer = segments[0] === 'story-player';
    const isVoiceSetup = segments[0] === 'voice-setup';
    const isEditProfile = segments[0] === 'edit-profile';

    if (!user && (inAuthGroup || isStoryPlayer || isVoiceSetup || isEditProfile)) {
      router.replace('/login');
    } else if (user && !inAuthGroup && !isStoryPlayer && !isVoiceSetup && !isEditProfile) {
      router.replace('/(tabs)/explore');
    }
  }, [user, segments]);
}

export default function RootLayout() {
  useFrameworkReady();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useProtectedRoute(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return null; // You could show a splash screen here
  }

  return (
    <ThemeProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
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
    </ThemeProvider>
  );
}
