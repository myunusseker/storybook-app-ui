import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Clock, Star, Search, Filter, Bookmark, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePlayer, Story } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import PreviewModal from '@/components/PreviewModal';

const { width } = Dimensions.get('window');

const categories = ['All', 'Wishlist', 'New', 'Popular', 'Adventure', 'Fantasy', 'Bedtime'];

const stories = [
  {
    id: '1',
    title: 'The Magical Forest',
    description: 'A young adventurer discovers a forest filled with talking animals and hidden treasures.',
    duration: '8 min',
    rating: 4.8,
    category: 'Adventure',
    cover: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#667eea', '#764ba2'],
    isNew: true,
    price: 2.99,
    previewUrl: 'previews/1',
  },
  {
    id: '2',
    title: 'Luna and the Moon Rabbit',
    description: 'Luna befriends a magical rabbit who lives on the moon and grants wishes.',
    duration: '10 min',
    rating: 4.9,
    category: 'Fantasy',
    cover: 'https://images.pexels.com/photos/1346713/pexels-photo-1346713.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#f093fb', '#f5576c'],
    isNew: false,
    price: 3.99,
    previewUrl: 'previews/2',
  },
  {
    id: '3',
    title: 'The Sleepy Dragon',
    description: 'A friendly dragon who loves bedtime stories and helps children fall asleep.',
    duration: '12 min',
    rating: 4.7,
    category: 'Bedtime',
    cover: 'https://images.pexels.com/photos/1097930/pexels-photo-1097930.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#4facfe', '#00f2fe'],
    isNew: false,
    price: 1.99,
    previewUrl: 'previews/3',
  },
  {
    id: '4',
    title: 'The Starlight Princess',
    description: 'A princess who paints the night sky with stars and creates beautiful dreams.',
    duration: '9 min',
    rating: 4.8,
    category: 'Fantasy',
    cover: 'https://firebasestorage.googleapis.com/v0/b/ebook-app-12893.firebasestorage.app/o/books%2Fplaceholder_cover.png?alt=media&token=c0ab0a09-35e0-4696-ac2f-7ab5dfef2b57',
    color: ['#fa709a', '#fee140'],
    isNew: true,
    price: 2.49,
    previewUrl: 'previews/4',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { openPlayer } = usePlayer();
  const { toggleWishlist, isWishlisted, isPurchased, addToLibrary } = useLibrary();

  const handleToggleWishlist = (storyId: string) => {
    toggleWishlist(storyId);
  };

  const handleStoryPress = (story: any) => {
    const storyData: Story = {
      id: story.id,
      title: story.title,
      description: story.description,
      duration: story.duration,
      cover: story.cover,
      color: story.color,
      rating: story.rating,
      category: story.category,
      isNew: story.isNew,
      price: story.price,
      previewUrl: story.previewUrl,
    };

    // Always show preview modal, regardless of ownership status
    setSelectedStory(storyData);
    setShowPreview(true);
  };

  // Custom component for special category buttons
  const renderCategoryButton = (category: string) => {
    const isSelected = selectedCategory === category;
    
    if (category === 'New') {
      return (
        <TouchableOpacity
          key={category}
          style={[
            styles.specialCategoryButton,
            styles.newCategoryButton,
            isSelected && styles.newCategoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.specialCategoryText,
              isSelected && styles.specialCategoryTextActive
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      );
    }
    
    if (category === 'Wishlist') {
      return (
        <TouchableOpacity
          key={category}
          style={[
            styles.specialCategoryButton,
            styles.wishlistCategoryButton,
            isSelected && styles.wishlistCategoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.specialCategoryText,
              isSelected && styles.specialCategoryTextActive
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Regular category button
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonActive
        ]}
        onPress={() => setSelectedCategory(category)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const handlePurchase = (story: Story) => {
    console.log(`Purchased: ${story.title}`);
    addToLibrary(story.id);
    Alert.alert('(Placeholder)\nPurchase Successful', `You have purchased "${story.title}" for $${story.price}.`);
    // Here you would typically integrate with a payment system
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'New' && story.isNew) ||
      (selectedCategory === 'Wishlist' && isWishlisted(story.id)) ||
      (selectedCategory === 'Popular' && story.rating >= 4.8) ||
      story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Use the first story from filtered results for featured, or fallback to first story
  const featuredStory = filteredStories.length > 0 ? filteredStories[0] : stories[0];

  return (
    <LinearGradient
      colors={theme.gradientBackground.colors}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening! 🌙</Text>
          <Text style={styles.subtitle}>Time for magical stories</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={theme.secondaryText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search magical stories..."
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => renderCategoryButton(category))}
        </ScrollView>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Tonight</Text>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => handleStoryPress(featuredStory)}
          >
            <LinearGradient
              colors={featuredStory.color as any}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredTextContainer}>
                  <Text style={styles.featuredTitle}>{featuredStory.title}</Text>
                  <Text style={styles.featuredDescription}>{featuredStory.description}</Text>
                  <View style={styles.featuredMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#ffffff" />
                      <Text style={styles.metaText}>{featuredStory.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star size={14} color="#ffffff" />
                      <Text style={styles.metaText}>{featuredStory.rating}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>All Stories</Text>
          <View style={styles.storiesGrid}>
            {filteredStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => handleStoryPress(story)}
              >
                <View style={styles.storyImageContainer}>
                  <Image source={{ uri: story.cover }} style={styles.storyImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.storyImageOverlay}
                  />
                  {story.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                  {isPurchased(story.id) && (
                    <View style={styles.purchasedBadge}>
                      <Text style={styles.purchasedBadgeText}>Purchased</Text>
                    </View>
                  )}
                  {!isPurchased(story.id) && isWishlisted(story.id) && (
                    <View style={styles.wishlistBadge}>
                      <Text style={styles.wishlistBadgeText}>Wishlist</Text>
                    </View>
                  )}
                </View>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyDescription} numberOfLines={2}>
                    {story.description}
                  </Text>
                  <View style={styles.storyMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={12} color={theme.secondaryText} />
                      <Text style={styles.metaTextSmall}>{story.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star size={12} color="#fbbf24" />
                      <Text style={styles.metaTextSmall}>{story.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {selectedStory && (
        <PreviewModal
          story={selectedStory}
          visible={showPreview}
          onClose={() => {
            setShowPreview(false);
            // Delay clearing selectedStory to allow modal close animation to complete
            setTimeout(() => {
              setSelectedStory(null);
            }, 300); // Match React Native's default modal animation duration
          }}
          onPurchase={handlePurchase}
        />
      )}
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.secondaryText,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  categoryText: {
    fontSize: 14,
    color: theme.secondaryText,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  // Special category styles
  specialCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  specialCategoryText: {
    fontSize: 14,
    color: theme.secondaryText,
    fontWeight: '500',
  },
  specialCategoryTextActive: {
    color: '#ffffff',
  },
  // New category specific styles
  newCategoryButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.newBorderColor,
  },
  newCategoryButtonActive: {
    backgroundColor: theme.newBackgroundColor,
    borderColor: theme.newBorderColor,
  },
  // Wishlist category specific styles
  wishlistCategoryButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.favoriteBorderColor,
  },
  wishlistCategoryButtonActive: {
    backgroundColor: theme.favoriteBackgroundColor,
    borderColor: theme.favoriteBorderColor,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  metaTextSmall: {
    fontSize: 11,
    color: theme.secondaryText,
    fontWeight: '500',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  storiesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  storiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  storyCard: {
    width: (width - 55) / 2,
    backgroundColor: theme.card,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storyImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.2,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.newBackgroundColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  purchasedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.purchasedBackgroundColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  purchasedBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  wishlistBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.favoriteBackgroundColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wishlistBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  storyDescription: {
    fontSize: 12,
    color: theme.secondaryText,
    lineHeight: 16,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});