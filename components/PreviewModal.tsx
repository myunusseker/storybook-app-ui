import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, Play, Pause, Star, Clock, ShoppingCart, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Story } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';

const { width } = Dimensions.get('window');

interface PreviewModalProps {
  visible: boolean;
  story: Story | null;
  onClose: () => void;
  onPurchase: (story: Story) => void;
}

export default function PreviewModal({ visible, story, onClose, onPurchase }: PreviewModalProps) {
  const { theme } = useTheme();
  const { addToLibrary, toggleWishlist, isOwned, isWishlisted } = useLibrary();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration] = useState(10); // 10 seconds preview
  const [progressInterval, setProgressInterval] = useState<number | null>(null);
  const styles = getStyles(theme);

  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  useEffect(() => {
    if (!visible) {
      stopPreview();
    }
  }, [visible]);

  const playPreview = async () => {
    try {
      // For demo purposes, we'll simulate preview playback
      // In real implementation, you'd load from story.previewUrl
      console.log(`Playing preview for: ${story?.title}`);
      
      // Simulate 10-second preview with progress
      setIsPreviewPlaying(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.1;
        setPreviewProgress(progress);
        
        if (progress >= 10) {
          clearInterval(interval);
          setIsPreviewPlaying(false);
          setPreviewProgress(0);
          setProgressInterval(null);
        }
      }, 100);
      
      setProgressInterval(interval);
    } catch (error) {
      console.error('Error playing preview:', error);
    }
  };

  const stopPreview = async () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setIsPreviewPlaying(false);
    setPreviewProgress(0);
  };

  const handlePurchase = () => {
    if (story) {
      addToLibrary(story.id);
      onPurchase(story);
      onClose();
    }
  };

  const handleToggleWishlist = () => {
    if (story) {
      toggleWishlist(story.id);
    }
  };

  if (!story) return null;

  const owned = isOwned(story.id);
  const wishlisted = isWishlisted(story.id);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={theme.gradientBackground.colors} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleWishlist}>
            <Bookmark
              size={24}
              color={wishlisted ? theme.favoriteBorderColor : theme.secondaryText}
              fill={wishlisted ? theme.favoriteBackgroundColor : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.coverContainer}>
            <Image source={{ uri: story.cover }} style={styles.coverImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.coverOverlay}
            />
          </View>

          <View style={styles.storyInfo}>
            <Text style={styles.title}>{story.title}</Text>
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Clock size={16} color={theme.secondaryText} />
                <Text style={styles.metaText}>{story.duration}</Text>
              </View>
              {story.rating && (
                <View style={styles.metaItem}>
                  <Star size={16} color="#fbbf24" />
                  <Text style={styles.metaText}>{story.rating}</Text>
                </View>
              )}
              {story.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              )}
            </View>
            <Text style={styles.description}>{story.description}</Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Text style={styles.previewSubtitle}>Listen to a 10-second preview</Text>
            
            <View style={styles.previewPlayer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPreviewPlaying ? stopPreview : playPreview}
              >
                {isPreviewPlaying ? (
                  <Pause size={24} color="#ffffff" />
                ) : (
                  <Play size={24} color="#ffffff" />
                )}
              </TouchableOpacity>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${(previewProgress / previewDuration) * 100}%` }]} 
                  />
                </View>
                <Text style={styles.progressTime}>
                  {Math.floor(previewProgress)}s / {previewDuration}s
                </Text>
              </View>
            </View>
            
            <Text style={styles.narratorInfo}>Narrated by Preview Voice</Text>
          </View>

          <View style={styles.actions}>
            {owned ? (
              <TouchableOpacity style={styles.ownedButton} disabled>
                <Text style={styles.ownedButtonText}>✓ In Your Library</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
                <LinearGradient
                  colors={[theme.accent, '#7c3aed']}
                  style={styles.purchaseButtonGradient}
                >
                  <ShoppingCart size={20} color="#ffffff" />
                  <Text style={styles.purchaseButtonText}>
                    Add to Library {story.price ? `$${story.price}` : 'Free'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coverContainer: {
    width: width - 40,
    height: (width - 40) * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  storyInfo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: theme.secondaryText,
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: theme.secondaryText,
    lineHeight: 24,
  },
  previewSection: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    marginBottom: 20,
  },
  previewPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 2,
  },
  progressTime: {
    fontSize: 12,
    color: theme.secondaryText,
  },
  narratorInfo: {
    fontSize: 12,
    color: theme.secondaryText,
    fontStyle: 'italic',
  },
  actions: {
    paddingBottom: 40,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownedButton: {
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  ownedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
});
