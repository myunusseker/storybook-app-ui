import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Heart, Clock, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePlayer } from '@/contexts/PlayerContext';

const categories = ['All', 'New', 'Favorites', 'Adventure', 'Fantasy', 'Bedtime'];

const libraryStories = [
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
    isFavorite: false,
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
    isFavorite: true,
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
    isFavorite: false,
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
    isFavorite: true,
  },
  {
    id: 5,
    title: 'Ocean Adventure',
    description: 'Dive deep into the underwater world filled with colorful fish and coral reefs.',
    duration: '11 min',
    rating: 4.6,
    category: 'Adventure',
    cover: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#a8edea', '#fed6e3'],
    isNew: false,
    isFavorite: false,
  },
  {
    id: 6,
    title: 'The Gentle Giant',
    description: 'A kind-hearted giant who helps animals and protects the forest.',
    duration: '7 min',
    rating: 4.9,
    category: 'Bedtime',
    cover: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: ['#d299c2', '#fef9d7'],
    isNew: false,
    isFavorite: true,
  },
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([2, 4, 6]);
  const { theme } = useTheme();
  const styles = getStyles(theme);
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

  const filteredStories = libraryStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'New' && story.isNew) ||
      (selectedCategory === 'Favorites' && favorites.includes(story.id)) ||
      story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <LinearGradient
      colors={theme.gradientBackground.colors}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Story Library</Text>
          <Text style={styles.subtitle}>Your personal story collection</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stories..."
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

        <View style={styles.storiesList}>
          {filteredStories.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={styles.storyItem}
              onPress={() => handlePlayStory(story)}
            >
              <View style={styles.storyItemContent}>
                <View style={styles.storyItemLeft}>
                  <View style={styles.storyIcon}>
                    <Image 
                      source={{ uri: story.cover }} 
                      style={styles.storyImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.storyInfo}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <View style={styles.storyMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={12} color="#94a3b8" />
                        <Text style={styles.metaText}>{story.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Star size={12} color="#fbbf24" />
                        <Text style={styles.metaText}>{story.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.storyItemRight}>
                  {story.isNew && (
                    <View style={styles.newBadgeSmall}>
                      <Text style={styles.newBadgeTextSmall}>New</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.favoriteButtonSmall}
                    onPress={() => toggleFavorite(story.id)}
                  >
                    <Heart
                      size={16}
                      color={favorites.includes(story.id) ? "#ef4444" : "#94a3b8"}
                      fill={favorites.includes(story.id) ? "#ef4444" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
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
  storiesList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  storyItem: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  storyIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 5,
  },
  storyMeta: {
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
    color: theme.secondaryText,
    fontWeight: '500',
  },
  storyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  newBadgeSmall: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeTextSmall: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  favoriteButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  bottomSpacing: {
    height: 100,
  },
});