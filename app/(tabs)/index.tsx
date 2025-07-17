import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Clock, Star, Search, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePlayer } from '@/contexts/PlayerContext';

const { width } = Dimensions.get('window');

const categories = ['All', 'New', 'Popular', 'Adventure', 'Fantasy', 'Bedtime'];

const stories = [
  {
    id: 1,
    title: 'The Magical Forest',
    description: 'A young adventurer discovers a forest filled with talking animals and hidden treasures.',
    duration: '8 min',
    rating: 4.8,
    category: 'Adventure',
    cover: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#667eea', '#764ba2'],
    isNew: true,
  },
  {
    id: 2,
    title: 'Luna and the Moon Rabbit',
    description: 'Luna befriends a magical rabbit who lives on the moon and grants wishes.',
    duration: '10 min',
    rating: 4.9,
    category: 'Fantasy',
    cover: 'https://images.pexels.com/photos/1346713/pexels-photo-1346713.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#f093fb', '#f5576c'],
    isNew: false,
  },
  {
    id: 3,
    title: 'The Sleepy Dragon',
    description: 'A friendly dragon who loves bedtime stories and helps children fall asleep.',
    duration: '12 min',
    rating: 4.7,
    category: 'Bedtime',
    cover: 'https://images.pexels.com/photos/1097930/pexels-photo-1097930.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#4facfe', '#00f2fe'],
    isNew: false,
  },
  {
    id: 4,
    title: 'The Starlight Princess',
    description: 'A princess who paints the night sky with stars and creates beautiful dreams.',
    duration: '9 min',
    rating: 4.8,
    category: 'Fantasy',
    cover: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#fa709a', '#fee140'],
    isNew: true,
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([2, 4, 6]);
  const { openPlayer } = usePlayer();

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handlePlayStory = (story: any) => {
    const storyData = {
      id: story.id.toString(),
      title: story.title,
      description: story.description,
      duration: story.duration,
      cover: story.cover,
      color: story.color,
    };
    
    openPlayer(storyData);
    router.push({
      pathname: '/story-player',
      params: { 
        id: story.id,
        title: story.title,
        description: story.description,
        duration: story.duration,
        cover: story.cover,
        color: JSON.stringify(story.color),
      }
    });
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'New' && story.isNew) ||
      (selectedCategory === 'Popular' && story.rating >= 4.8) ||
      story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Use the first story from filtered results for featured, or fallback to first story
  const featuredStory = filteredStories.length > 0 ? filteredStories[0] : stories[0];

  return (
    <LinearGradient
      colors={['#fdf2f8', '#f8fafc']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening! 🌙</Text>
          <Text style={styles.subtitle}>Time for magical stories</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search magical stories..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Tonight</Text>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => handlePlayStory(featuredStory)}
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
                onPress={() => handlePlayStory(story)}
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
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(story.id)}
                  >
                    <Heart
                      size={16}
                      color={favorites.includes(story.id) ? "#ef4444" : "#ffffff"}
                      fill={favorites.includes(story.id) ? "#ef4444" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyDescription} numberOfLines={2}>
                    {story.description}
                  </Text>
                  <View style={styles.storyMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#94a3b8" />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#94a3b8',
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
    backgroundColor: '#ffffff',
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
    height: 120,
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
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
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
    color: '#1f2937',
    marginBottom: 5,
  },
  storyDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});