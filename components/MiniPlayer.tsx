import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Play, Pause, X } from 'lucide-react-native';
import { usePlayer } from '@/contexts/PlayerContext';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { 
    currentStory, 
    isPlaying, 
    isMinimized, 
    setIsPlaying, 
    closePlayer, 
    expandPlayer 
  } = usePlayer();

  if (!currentStory || !isMinimized) {
    return null;
  }

  const handleExpand = () => {
    expandPlayer();
    router.push({
      pathname: '/story-player',
      params: {
        id: currentStory.id,
        title: currentStory.title,
        description: currentStory.description,
        duration: currentStory.duration,
        cover: currentStory.cover,
        color: JSON.stringify(currentStory.color),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.miniPlayer} onPress={handleExpand} activeOpacity={0.8}>
        <LinearGradient
          colors={currentStory.color as any}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <Image 
                source={{ uri: currentStory.cover }} 
                style={styles.coverImage} 
              />
              <View style={styles.storyInfo}>
                <Text style={styles.title} numberOfLines={1}>
                  {currentStory.title}
                </Text>
                <Text style={styles.description} numberOfLines={1}>
                  {currentStory.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.rightSection}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
              >
                {isPlaying ? (
                  <Pause size={20} color="#ffffff" />
                ) : (
                  <Play size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  closePlayer();
                }}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above the tab bar
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  miniPlayer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  coverImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  storyInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
