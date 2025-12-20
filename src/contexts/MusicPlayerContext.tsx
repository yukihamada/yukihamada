import { createContext, useContext, useState, ReactNode } from 'react';

interface MusicPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  analyzerData: number[];
  setAnalyzerData: (data: number[]) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(32).fill(0));
  const [currentColor, setCurrentColor] = useState('hsl(var(--primary))');

  return (
    <MusicPlayerContext.Provider value={{ 
      isPlaying, 
      setIsPlaying, 
      analyzerData, 
      setAnalyzerData,
      currentColor,
      setCurrentColor 
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
