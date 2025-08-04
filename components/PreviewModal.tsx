import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Dimensions, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Heart, Play, Pause, Star, Clock, ShoppingCart, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Story } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface PreviewModalProps {
  visible: boolean;
  story: Story | null;
  onClose: () => void;
  onPurchase: (story: Story) => void;
}

export default function PreviewModal({ visible, story, onClose, onPurchase }: PreviewModalProps) {
  const { theme } = useTheme();
  const { addToLibrary, toggleWishlist, isPurchased, isWishlisted } = useLibrary();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration] = useState(10); // 10 seconds preview
  const [progressInterval, setProgressInterval] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const backgroundPanAnimation = useRef(new Animated.Value(0)).current;
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
      stopBackgroundAnimation();
    } else if (story) {
      // Get image dimensions and start animation
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
        }
      );
    }
  }, [visible, story]);

  const startBackgroundAnimation = (imageWidth?: number) => {
    const actualImageWidth = imageWidth || imageSize.width;
    
    // Simple calculation: panDistance = (imageWidth - screenWidth) / 2
    const panDistance = actualImageWidth > width ? (actualImageWidth - width) / 2 : 0;
    
    if (panDistance > 0) {
      // Start from left, go to right, come back to left
      const animation = Animated.loop(
        Animated.sequence([
          // From left, move to right edge
          Animated.timing(backgroundPanAnimation, {
            toValue: -panDistance * 2, // Move to right edge
            duration: 30000,
            useNativeDriver: true,
          }),
          // From right, back to left
          Animated.timing(backgroundPanAnimation, {
            toValue: 0, // Back to left edge
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
    backgroundPanAnimation.setValue(0); // Reset to left edge
  };

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
    }
  };

  const handleToggleWishlist = () => {
    if (story) {
      toggleWishlist(story.id);
    }
  };

  if (!story) return null;

  const purchased = isPurchased(story.id);
  const wishlisted = isWishlisted(story.id);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Full-screen background image with pan animation */}
        <Animated.Image 
          source={{ uri: story.cover }} 
          style={[
            styles.backgroundImage,
            imageSize.width > width && {
              width: imageSize.width, // Use actual image width when wider than screen
            },
            {
              transform: [{ translateX: backgroundPanAnimation }]
            }
          ]} 
        />
        
        {/* Progressive overlay gradients */}
        <LinearGradient
          colors={theme.mode === 'dark' ? [
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
          locations={[0, 0.3, 0.4, 0.5, 0.8, 1]}
          style={styles.backgroundOverlay}
        />

        {/* Header with controls */}
        <View style={styles.header}>
          <BlurView intensity={30} tint="dark" style={styles.closeButton}>
            <TouchableOpacity style={styles.closeButtonTouch} onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </BlurView>
          <BlurView 
            intensity={30} 
            tint="dark" 
            style={[
              styles.wishlistButton, 
              purchased ? styles.purchasedButton : (wishlisted ? styles.wishlistedButton : styles.defaultWishlistButton)
            ]}
          >
            <TouchableOpacity 
              style={styles.wishlistButtonTouch}
              onPress={handleToggleWishlist}
              disabled={purchased}
            >
              <Text style={[
                styles.wishlistButtonText,
                purchased ? styles.purchasedButtonText : (wishlisted ? styles.wishlistedButtonText : styles.defaultWishlistButtonText)
              ]}>
                {purchased ? 'Purchased' : (wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist')}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Scrollable content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Spacer to push content down */}
          <View style={styles.topSpacer} />
          
          {/* Story information */}
          <View style={styles.contentContainer}>
            <View style={styles.storyInfo}>
              <Text style={styles.title}>{story.title}</Text>
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Clock size={16} color="rgba(255,255,255,0.8)" />
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

            {/* Blurred preview section */}
            <BlurView intensity={30} tint="dark" style={styles.previewSection}>
              <View style={styles.previewContent}>
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
            </BlurView>

            {/* Purchase/Library button */}
            <View style={styles.actions}>
              {purchased ? (
                <BlurView intensity={40} tint="dark" style={styles.libraryButton}>
                  <TouchableOpacity 
                    style={styles.libraryButtonTouch} 
                    onPress={() => {
                      router.push('/(tabs)/library');
                      onClose();
                    }}
                  >
                    <LinearGradient
                      colors={['rgba(5, 150, 24, 0.1)', 'rgba(16, 185, 44, 0.1)']}
                      style={styles.libraryButtonGradient}
                    >
                      <Text style={styles.libraryButtonText}>See in Library</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
              ) : (
                <BlurView intensity={40} tint="dark" style={styles.purchaseButton}>
                  <TouchableOpacity style={styles.purchaseButtonTouch} onPress={handlePurchase}>
                    <LinearGradient
                      colors={['rgba(139,92,246,0.1)', 'rgba(124,58,237,0.1)']}
                      style={styles.purchaseButtonGradient}
                    >
                      <ShoppingCart size={20} color="#ffffff" />
                      <Text style={styles.purchaseButtonText}>
                        Add to Library {story.price ? `$${story.price}` : 'Free'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
              )}
            </View>

            {/* Bottom spacer */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width, // Default width, will be overridden for wide images
    height: height,
    resizeMode: 'cover', // This will maintain aspect ratio and crop if needed
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeButtonTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  topSpacer: {
    height: height * 0.4, // 40% of screen height
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  storyInfo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: '#ff6b6b',
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
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewSection: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  narratorInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  actions: {
    marginBottom: 20,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138, 92, 246, 0.5)',
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  purchaseButtonTouch: {
    width: '100%',
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  libraryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.5)',
    elevation: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  libraryButtonTouch: {
    width: '100%',
  },
  libraryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  libraryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Wishlist button styles
  wishlistButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  wishlistButtonTouch: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  defaultWishlistButton: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  defaultWishlistButtonText: {
    color: '#ffffff',
  },
  wishlistedButton: {
    borderColor: '#f43f5e',
    backgroundColor: '#f43f5e4d',
  },
  wishlistedButtonText: {
    color: '#ffffff',
  },
  purchasedButton: {
    borderColor: '#059669',
    backgroundColor: '#0596694d',
  },
  purchasedButtonText: {
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 60,
  },
});
