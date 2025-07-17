import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Share, 
  ArrowLeft,
  Volume2,
  Moon,
  Star
} from 'lucide-react-native';
import { usePlayer } from '@/contexts/PlayerContext';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

export default function StoryPlayerScreen() {
  const params = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(480); // 8 minutes in seconds
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  const story = {
    id: params.id,
    title: params.title,
    description: params.description,
    duration: params.duration,
    cover: params.cover,
    color: params.color ? JSON.parse(params.color as string) : ['#667eea', '#764ba2'],
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
      <LinearGradient
        colors={isNightMode ? ['#1f2937', '#111827'] : story.color}
        style={styles.card}
      >
        <View style={styles.cardHandle} />
        <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setIsNightMode(!isNightMode)}
              >
                <Moon size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Share size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

      <View style={styles.coverContainer}>
        <View style={styles.coverWrapper}>
          <Image 
            source={{ uri: typeof story.cover === 'string' ? story.cover : story.cover?.[0] || '' }} 
            style={styles.coverImage} 
          />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.coverOverlay}
          >
            <View style={styles.storyInfo}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyDescription}>{story.description}</Text>
              <View style={styles.storyMeta}>
                <Star size={14} color="#fbbf24" />
                <Text style={styles.metaText}>4.8 • Bedtime Story</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.playerContainer}>
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
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#ef4444" : "#ffffff"} 
              fill={isFavorite ? "#ef4444" : "transparent"}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleSeek('backward')}
          >
            <SkipBack size={28} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause size={32} color="#ffffff" />
            ) : (
              <Play size={32} color="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleSeek('forward')}
          >
            <SkipForward size={28} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Volume2 size={24} color="#ffffff" />
          </TouchableOpacity>
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
      </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  coverWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  storyInfo: {
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  playerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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