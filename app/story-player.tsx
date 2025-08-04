import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Share, 
  ArrowLeft,
  Volume2,
  Moon, Star
} from 'lucide-react-native';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function StoryPlayerScreen() {
  const params = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(480); // 8 minutes in seconds
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const backgroundPanAnimation = useRef(new Animated.Value(0)).current;
  const { minimizePlayer } = usePlayer();
  const { theme } = useTheme();

  // Auto-detect dark mode from theme context
  useEffect(() => {
    setIsNightMode(theme.mode === 'dark');
  }, [theme.mode]);

  // Auto-minimize when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This cleanup function runs when the screen loses focus
        stopBackgroundAnimation();
        minimizePlayer();
      };
    }, [minimizePlayer])
  );

  const handleMinimize = () => {
    stopBackgroundAnimation();
    minimizePlayer();
    router.back();
  };

  const story = {
    id: params.id,
    title: params.title,
    description: params.description,
    duration: params.duration,
    cover: params.cover as string,
    color: params.color ? JSON.parse(params.color as string) : ['#667eea', '#764ba2'],
  };

  // Initialize background animation for wide images
  useEffect(() => {
    if (story?.cover && typeof story.cover === 'string' && story.cover.trim() !== '') {
      Image.getSize(
        story.cover, 
        (imageWidth, imageHeight) => {
          setImageSize({ width: imageWidth, height: imageHeight });
          
          // Simple logic: if image width > screen width, animate
          if (imageWidth > width) {
            setTimeout(() => startBackgroundAnimation(imageWidth), 100);
          }
        },
        (error) => {
          console.log('Error getting image size:', error);
          // Set default dimensions if image fails to load
          setImageSize({ width: width, height: width * 1.5 });
        }
      );
    } else {
      // Set default dimensions if no valid cover URL
      setImageSize({ width: width, height: width * 1.5 });
    }
  }, [story?.cover]);

  const startBackgroundAnimation = (imageWidth?: number) => {
    const actualImageWidth = imageWidth || imageSize.width;
    const panDistance = actualImageWidth > width ? (actualImageWidth - width) / 2 : 0;
    
    if (panDistance > 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundPanAnimation, {
            toValue: -panDistance * 2,
            duration: 30000,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundPanAnimation, {
            toValue: 0,
            duration: 30000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }
  };

  const stopBackgroundAnimation = () => {
    backgroundPanAnimation.stopAnimation();
    backgroundPanAnimation.setValue(0);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (currentTime / duration) * 100;
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    const newTime = direction === 'forward' 
      ? Math.min(currentTime + 15, duration)
      : Math.max(currentTime - 15, 0);
    setCurrentTime(newTime);
  };

  return (
    <View style={styles.container}>
      {/* Full-screen background image with pan animation */}
      <Animated.Image 
        source={{ uri: typeof story.cover === 'string' ? story.cover : story.cover?.[0] || '' }} 
        style={[
          styles.backgroundImage,
          imageSize.width > width && {
            width: imageSize.width,
          },
          {
            transform: [{ translateX: backgroundPanAnimation }]
          }
        ]} 
      />
      
      {/* Progressive overlay gradients */}
      <LinearGradient
        colors={isNightMode ? [
          'rgba(0,0,0,0.75)',
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,0.85)',
          'rgba(0,0,0,0.9)',
          'rgba(0,0,0,0.95)',
          'rgba(0,0,0,1)'
        ] : [
          'transparent',
          'rgba(0,0,0,0.1)',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,0.95)'
        ]}
        locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
        style={styles.backgroundOverlay}
      />

      <View style={styles.cardHandle} />
      
      {/* Header with glassmorphism */}
      <View style={styles.header}>
        <BlurView intensity={30} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.backButton}>
          <TouchableOpacity 
            style={styles.backButtonTouch}
            onPress={handleMinimize}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </BlurView>
        
        <View style={styles.headerActions}>
          <BlurView intensity={30} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.headerButton}>
            <TouchableOpacity 
              style={styles.headerButtonTouch}
              onPress={() => setIsNightMode(!isNightMode)}
            >
              <Moon 
                size={20} 
                color="#ffffff" 
                fill={isNightMode ? "#ffffff" : "transparent"}
              />
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={30} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.headerButton}>
            <TouchableOpacity style={styles.headerButtonTouch}>
              <Share size={20} color="#ffffff" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>

      {/* Spacer to push content to bottom */}
      <View style={styles.flexSpacer} />

      {/* Story information section above player */}
      <View style={styles.storyInfoSection}>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <View style={styles.storyMeta}>
          <Star size={16} color="#fbbf24" />
          <Text style={styles.metaText}>4.8 • Bedtime Story</Text>
        </View>
        <Text style={styles.storyDescription}>{story.description}</Text>
      </View>

      {/* Player controls with glassmorphism */}
      <BlurView intensity={isNightMode ? 50 : 40} tint="dark" style={styles.playerContainer}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${getProgress()}%` }]} 
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <BlurView intensity={isNightMode ? 30 : 20} tint="dark" style={styles.controlButton}>
            <TouchableOpacity 
              style={styles.controlButtonTouch}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart 
                size={24} 
                color={isFavorite ? "#ef4444" : "#ffffff"} 
                fill={isFavorite ? "#ef4444" : "transparent"}
              />
            </TouchableOpacity>
          </BlurView>

          <BlurView intensity={isNightMode ? 30 : 20} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.controlButton}>
            <TouchableOpacity 
              style={styles.controlButtonTouch}
              onPress={() => handleSeek('backward')}
            >
              <SkipBack size={28} color="#ffffff" />
            </TouchableOpacity>
          </BlurView>

          <BlurView intensity={isNightMode ? 40 : 30} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.playButton}>
            <TouchableOpacity 
              style={styles.playButtonTouch}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={32} color="#ffffff" />
              ) : (
                <Play size={32} color="#ffffff" />
              )}
            </TouchableOpacity>
          </BlurView>

          <BlurView intensity={isNightMode ? 30 : 20} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.controlButton}>
            <TouchableOpacity 
              style={styles.controlButtonTouch}
              onPress={() => handleSeek('forward')}
            >
              <SkipForward size={28} color="#ffffff" />
            </TouchableOpacity>
          </BlurView>

          <BlurView intensity={isNightMode ? 30 : 20} tint={isNightMode ? "systemMaterialDark" : "dark"} style={styles.controlButton}>
            <TouchableOpacity style={styles.controlButtonTouch}>
              <Volume2 size={24} color="#ffffff" />
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={styles.bottomInfo}>
          <View style={styles.narratorInfo}>
            <Text style={styles.narratorLabel}>Narrated by</Text>
            <Text style={styles.narratorName}>Your AI Voice</Text>
          </View>
          <View style={styles.sleepTimer}>
            <Text style={styles.sleepLabel}>Sleep in 30 min</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexSpacer: {
    flex: 1,
  },
  storyInfoSection: {
    paddingHorizontal: 30,
    paddingVertical: 25,
    marginBottom: 5,
  },
  storyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  storyDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playerContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
    borderWidth: 0,
    overflow: 'hidden',
  },
  progressSection: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  narratorInfo: {
    alignItems: 'flex-start',
  },
  narratorLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
    marginBottom: 2,
  },
  narratorName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  sleepTimer: {
    alignItems: 'flex-end',
  },
  sleepLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
  },
});
