import { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface TTSPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  postSlug: string | null;
  postTitle: string | null;
}

interface TTSPlayerContextType extends TTSPlayerState {
  startTTS: (content: string, title: string, postSlug: string, language: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const TTSPlayerContext = createContext<TTSPlayerContextType | undefined>(undefined);

export const TTSPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TTSPlayerState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.2,
    postSlug: null,
    postTitle: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress tracking
  useEffect(() => {
    if (state.isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying]);

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = state.playbackRate;
    }
  }, [state.playbackRate]);

  // Clean content for TTS
  const cleanContent = useCallback((text: string): string => {
    return text
      .replace(/^##+ .+$/gm, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\|.+\|/g, '')
      .replace(/^[-*] /gm, '')
      .replace(/^\d+\. /gm, '')
      .replace(/^> /gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  const startTTS = useCallback(async (content: string, title: string, postSlug: string, language: string) => {
    // If already playing this post, just resume
    if (state.postSlug === postSlug && audioRef.current && !audioRef.current.ended) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      return;
    }

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      postSlug, 
      postTitle: title,
      currentTime: 0,
      duration: 0 
    }));

    try {
      const textToRead = `${title}。${cleanContent(content)}`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: textToRead, language, postSlug }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate audio');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const audio = new Audio(data.audioUrl);
      audio.playbackRate = state.playbackRate;
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        setState(prev => ({ ...prev, duration: audio.duration }));
      };
      
      audio.onended = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isPaused: false, 
          currentTime: 0 
        }));
      };

      audio.onerror = () => {
        toast.error(language === 'ja' ? '再生エラーが発生しました' : 'Playback error occurred');
        setState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
      };

      await audio.play();
      setState(prev => ({ ...prev, isLoading: false, isPlaying: true, isPaused: false }));
      
      if (data.cached) {
        toast.success(language === 'ja' ? 'キャッシュから読み込みました' : 'Loaded from cache');
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error(language === 'ja' ? '音声生成に失敗しました' : 'Failed to generate audio');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.postSlug, state.playbackRate, cleanContent]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0,
      postSlug: null,
      postTitle: null 
    }));
  }, []);

  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false, currentTime: 0 }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  return (
    <TTSPlayerContext.Provider value={{ 
      ...state,
      startTTS,
      play,
      pause,
      stop,
      restart,
      seek,
      setPlaybackRate,
    }}>
      {children}
    </TTSPlayerContext.Provider>
  );
};

export const useTTSPlayer = () => {
  const context = useContext(TTSPlayerContext);
  if (context === undefined) {
    throw new Error('useTTSPlayer must be used within a TTSPlayerProvider');
  }
  return context;
};
