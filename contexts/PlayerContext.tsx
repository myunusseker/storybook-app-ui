import React, { createContext, useContext, useState, ReactNode } from 'react';

const DEFAULT_PLAYER_DURATION = 480;

export interface Story {
  id: string;
  title: string;
  description: string;
  duration: string;
  cover: string;
  color: string[];
  price?: number;
  isOwned?: boolean;
  isFavorited?: boolean;
  previewUrl?: string;
  rating?: number;
  category?: string;
  isNew?: boolean;
}

interface PlayerContextType {
  currentStory: Story | null;
  isPlaying: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  setCurrentStory: (story: Story | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsMinimized: (minimized: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  openPlayer: (story: Story) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  expandPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_PLAYER_DURATION);

  const openPlayer = (story: Story) => {
    setCurrentStory(story);
    setIsMinimized(false);
    setCurrentTime(0);
  };

  const closePlayer = () => {
    setCurrentStory(null);
    setIsPlaying(false);
    setIsMinimized(false);
    setCurrentTime(0);
  };

  const minimizePlayer = () => {
    setIsMinimized(true);
  };

  const expandPlayer = () => {
    setIsMinimized(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentStory,
        isPlaying,
        isMinimized,
        currentTime,
        duration,
        setCurrentStory,
        setIsPlaying,
        setIsMinimized,
        setCurrentTime,
        setDuration,
        openPlayer,
        closePlayer,
        minimizePlayer,
        expandPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
