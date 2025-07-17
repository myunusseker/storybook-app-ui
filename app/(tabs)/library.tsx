import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Heart, Clock, Star } from 'lucide-react-native';

const categories = ['All', 'New', 'Favorites', 'Adventure', 'Fantasy', 'Bedtime'];

const libraryStories = [
  {
    id: 1,
    title: 'The Magical Forest',
    duration: '8 min',
    rating: 4.8,
    category: 'Adventure',
    isNew: true,
    isFavorite: false,
  },
  {
    id: 2,
    title: 'Luna and the Moon Rabbit',
    duration: '10 min',
    rating: 4.9,
    category: 'Fantasy',
    isNew: false,
    isFavorite: true,
  },
  {
    id: 3,
    title: 'The Sleepy Dragon',
    duration: '12 min',
    rating: 4.7,
    category: 'Bedtime',
    isNew: false,
    isFavorite: false,
  },
  {
    id: 4,
    title: 'The Starlight Princess',
    duration: '9 min',
    rating: 4.8,
    category: 'Fantasy',
    isNew: true,
    isFavorite: true,
  },
  {
    id: 5,
    title: 'Ocean Adventure',
    duration: '11 min',
    rating: 4.6,
    category: 'Adventure',
    isNew: false,
    isFavorite: false,
  },
  {
    id: 6,
    title: 'The Gentle Giant',
    duration: '7 min',
    rating: 4.9,
    category: 'Bedtime',
    isNew: false,
    isFavorite: true,
  },
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([2, 4, 6]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
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
      colors={['#fdf2f8', '#f8fafc']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Story Library</Text>
          <Text style={styles.subtitle}>Your personal collection</Text>
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
            <TouchableOpacity key={story.id} style={styles.storyItem}>
              <View style={styles.storyItemContent}>
                <View style={styles.storyItemLeft}>
                  <View style={styles.storyIcon}>
                    <Text style={styles.storyIconText}>{story.title.charAt(0)}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
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
  storiesList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  storyItem: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: '#1f2937',
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
    color: '#94a3b8',
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
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomSpacing: {
    height: 100,
  },
});