import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs } from 'expo-router';
import { Moon as Home, User, Book, Mic } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={theme.mode === 'dark' ? 40 : 20} 
            tint={theme.mode === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.6)',
            }}
          />
        ),
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
      })}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <Book size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai_voices"
        options={{
          title: 'AI Voices',
          tabBarIcon: ({ size, color }) => (
            <Mic size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}