import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Story } from './PlayerContext';

interface LibraryContextType {
  purchasedStories: string[];
  favorites: string[];
  wishlist: string[];
  addToLibrary: (storyId: string) => void;
  removeFromLibrary: (storyId: string) => void;
  toggleFavorite: (storyId: string) => void;
  toggleWishlist: (storyId: string) => void;
  isPurchased: (storyId: string) => boolean;
  isFavorited: (storyId: string) => boolean;
  isWishlisted: (storyId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  // Initialize with some test data for demonstration
  const [purchasedStories, setPurchasedStories] = useState<string[]>(['1', '3']); // Purchased stories 1 and 3
  const [favorites, setFavorites] = useState<string[]>(['1']); // Story 1 is favorited
  const [wishlist, setWishlist] = useState<string[]>(['2', '4']); // Stories 2 and 4 are wishlisted

  const addToLibrary = (storyId: string) => {
    setPurchasedStories(prev => 
      prev.includes(storyId) ? prev : [...prev, storyId]
    );
    // Remove from wishlist when purchased
    setWishlist(prev => prev.filter(id => id !== storyId));
  };

  const removeFromLibrary = (storyId: string) => {
    setPurchasedStories(prev => prev.filter(id => id !== storyId));
    // Also remove from favorites when removing from library
    setFavorites(prev => prev.filter(id => id !== storyId));
  };

  const toggleFavorite = (storyId: string) => {
    // Only allow favoriting purchased stories
    if (!purchasedStories.includes(storyId)) return;

    setFavorites(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const toggleWishlist = (storyId: string) => {
    // Only allow wishlisting non-purchased stories
    if (purchasedStories.includes(storyId)) return;
    
    setWishlist(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const isPurchased = (storyId: string) => purchasedStories.includes(storyId);
  const isFavorited = (storyId: string) => favorites.includes(storyId);
  const isWishlisted = (storyId: string) => wishlist.includes(storyId);

  return (
    <LibraryContext.Provider value={{
      purchasedStories,
      favorites,
      wishlist,
      addToLibrary,
      removeFromLibrary,
      toggleFavorite,
      toggleWishlist,
      isPurchased,
      isFavorited,
      isWishlisted,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
