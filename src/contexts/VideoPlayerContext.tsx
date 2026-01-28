import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoPlayerContextType {
  activeVideoId: string | null;
  isFloating: boolean;
  isExpanded: boolean;
  setActiveVideoId: (id: string | null) => void;
  setIsFloating: (floating: boolean) => void;
  setIsExpanded: (expanded: boolean) => void;
  closeVideo: () => void;
  playVideo: (videoId: string) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const closeVideo = () => {
    setActiveVideoId(null);
    setIsFloating(false);
    setIsExpanded(false);
  };

  const playVideo = (videoId: string) => {
    setActiveVideoId(videoId);
    setIsFloating(true);
    setIsExpanded(false);
  };

  return (
    <VideoPlayerContext.Provider value={{ 
      activeVideoId, 
      isFloating, 
      isExpanded,
      setActiveVideoId, 
      setIsFloating, 
      setIsExpanded,
      closeVideo,
      playVideo
    }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};
