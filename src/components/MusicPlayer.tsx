import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X, ChevronUp, Shuffle, Repeat, Repeat1, SlidersHorizontal, FileText, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { Slider } from '@/components/ui/slider';

// Artwork mapping for dynamic imports
import albumFreeToChange from '@/assets/album-free-to-change.jpg';
import albumHello2150 from '@/assets/album-hello-2150.jpg';
import albumBjj from '@/assets/album-everybody-bjj.jpg';
import albumILoveYou from '@/assets/album-i-love-you.jpg';
import albumAttention from '@/assets/album-attention.jpg';
import albumKoiJujutsu from '@/assets/album-koi-jujutsu.jpg';
import albumShioPixel from '@/assets/album-shio-pixel.jpg';
import albumMusubinaosu from '@/assets/album-musubinaosu.jpg';
import albumAttentionPlease from '@/assets/album-attention-please.jpg';

const artworkMap: Record<string, string> = {
  'album-free-to-change.jpg': albumFreeToChange,
  'album-hello-2150.jpg': albumHello2150,
  'album-everybody-bjj.jpg': albumBjj,
  'album-i-love-you.jpg': albumILoveYou,
  'album-attention.jpg': albumAttention,
  'album-koi-jujutsu.jpg': albumKoiJujutsu,
  'album-shio-pixel.jpg': albumShioPixel,
  'album-musubinaosu.jpg': albumMusubinaosu,
  'album-attention-please.jpg': albumAttentionPlease,
};

interface LyricLine {
  start: number;
  end: number;
  text: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  artwork: string;
  color: string;
  lyrics?: LyricLine[] | null;
}

// Store lyrics in memory
const lyricsCache: Record<string, LyricLine[]> = {};

type RepeatMode = 'off' | 'all' | 'one';

// Equalizer presets
const EQ_BANDS = [
  { frequency: 60, label: '60' },
  { frequency: 170, label: '170' },
  { frequency: 310, label: '310' },
  { frequency: 600, label: '600' },
  { frequency: 1000, label: '1K' },
  { frequency: 3000, label: '3K' },
  { frequency: 6000, label: '6K' },
  { frequency: 12000, label: '12K' },
];

const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0],
  bass: [6, 5, 4, 2, 0, 0, 0, 0],
  treble: [0, 0, 0, 0, 2, 4, 5, 6],
  vocal: [-2, 0, 2, 4, 4, 2, 0, -2],
  rock: [5, 4, 2, 0, -1, 2, 4, 5],
  electronic: [5, 4, 0, -2, 0, 2, 4, 5],
};

// Load play counts from localStorage
const getPlayCounts = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem('musicPlayCounts');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Get or create visitor ID
const getVisitorId = (): string => {
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;
  
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('visitor_id', newId);
  return newId;
};

// Update local play count (synchronous, for UI)
const updateLocalPlayCount = (trackId: string): Record<string, number> => {
  const counts = getPlayCounts();
  counts[trackId] = (counts[trackId] || 0) + 1;
  localStorage.setItem('musicPlayCounts', JSON.stringify(counts));
  return counts;
};

// Save play count to database (async, for analytics)
const savePlayCountToDb = async (trackId: string) => {
  const visitorId = getVisitorId();
  try {
    const { getVisitorSupabaseClient } = await import('@/lib/visitorSupabaseClient');
    const client = getVisitorSupabaseClient(visitorId);
    const { error } = await client.from('music_play_counts').insert({
      track_id: trackId,
      visitor_id: visitorId
    });
    if (error) {
      console.error('Error saving play count:', error);
    }
  } catch (err) {
    console.error('Error saving play count:', err);
  }
};

const MusicPlayer = () => {
  const { setIsPlaying: setGlobalIsPlaying, setAnalyzerData: setGlobalAnalyzerData, setCurrentColor } = useMusicPlayer();
  const { isUIVisible } = useUIVisibility();
  const { activeVideoId } = useVideoPlayer();
  
  // Track data from database
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPlaying, setIsPlayingLocal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [savedVolume, setSavedVolume] = useState(0.7); // For ducking restore
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(32).fill(0));
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [displayedTrack, setDisplayedTrack] = useState(0);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(getPlayCounts);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [eqValues, setEqValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [eqPreset, setEqPreset] = useState<string>('flat');
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState<LyricLine[] | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [isDucking, setIsDucking] = useState(false); // TTS is playing
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Draggable position
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch tracks from database
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('music_tracks')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mappedTracks: Track[] = data.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            src: t.src,
            artwork: artworkMap[t.artwork || ''] || t.artwork || albumFreeToChange,
            color: t.color || '#3b82f6',
            lyrics: t.lyrics as unknown as LyricLine[] | null,
          }));
          setTracks(mappedTracks);
          const randomIndex = Math.floor(Math.random() * mappedTracks.length);
          setCurrentTrack(randomIndex);
          setDisplayedTrack(randomIndex);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
  }, []);

  // Update color when track changes
  useEffect(() => {
    if (tracks.length > 0 && tracks[currentTrack]) {
      setCurrentColor(tracks[currentTrack].color);
    }
  }, [currentTrack, tracks, setCurrentColor]);

  // Wrapper for setIsPlaying that also updates global state
  const setIsPlaying = (playing: boolean) => {
    setIsPlayingLocal(playing);
    setGlobalIsPlaying(playing);
  };
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const animationRef = useRef<number | null>(null);

  // Close expanded player when clicking outside
  useEffect(() => {
    if (!isExpanded) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (playerContainerRef.current && !playerContainerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 64;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    const filters = EQ_BANDS.map((band, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === EQ_BANDS.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = band.frequency;
      filter.gain.value = eqValues[index];
      filter.Q.value = 1;
      return filter;
    });
    
    source.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
    filters[filters.length - 1].connect(analyzer);
    analyzer.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyzerRef.current = analyzer;
    sourceRef.current = source;
    eqFiltersRef.current = filters;
  }, [eqValues]);

  const updateVisualizer = useCallback(() => {
    if (!analyzerRef.current) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    const normalizedData = Array.from(dataArray).slice(0, 32).map(value => value / 255);
    setAnalyzerData(normalizedData);
    setGlobalAnalyzerData(normalizedData);

    animationRef.current = requestAnimationFrame(updateVisualizer);
  }, [setGlobalAnalyzerData]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        initializeAudioContext();
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      animationRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, initializeAudioContext, updateVisualizer]);

  // Listen for TTS state changes for ducking
  useEffect(() => {
    const handleTTSStateChange = (event: CustomEvent<{ isPlaying: boolean }>) => {
      const ttsPlaying = event.detail.isPlaying;
      setIsDucking(ttsPlaying);
      
      if (audioRef.current) {
        if (ttsPlaying) {
          // Duck music volume to 20%
          setSavedVolume(volume);
          audioRef.current.volume = isMuted ? 0 : volume * 0.2;
        } else {
          // Restore volume
          audioRef.current.volume = isMuted ? 0 : savedVolume;
        }
      }
    };
    
    window.addEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    return () => {
      window.removeEventListener('ttsStateChange', handleTTSStateChange as EventListener);
    };
  }, [volume, isMuted, savedVolume]);

  useEffect(() => {
    if (audioRef.current) {
      const effectiveVolume = isDucking ? volume * 0.2 : volume;
      audioRef.current.volume = isMuted ? 0 : effectiveVolume;
    }
  }, [volume, isMuted, isDucking]);

  const getNextTrack = useCallback(() => {
    if (tracks.length === 0) return 0;
    if (isShuffle) {
      let newTrack = Math.floor(Math.random() * tracks.length);
      while (newTrack === currentTrack && tracks.length > 1) {
        newTrack = Math.floor(Math.random() * tracks.length);
      }
      return newTrack;
    }
    return currentTrack < tracks.length - 1 ? currentTrack + 1 : 0;
  }, [isShuffle, currentTrack, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || currentTrack < tracks.length - 1) {
        setCurrentTrack(getNextTrack());
      } else if (isShuffle) {
        setCurrentTrack(getNextTrack());
      } else {
        setCurrentTrack(0);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, repeatMode, isShuffle, getNextTrack, tracks.length]);

  // Listen for external toggle event
  useEffect(() => {
    const handleToggleMusic = () => {
      if (tracks.length === 0) return;
      if (!isPlaying) {
        const trackId = tracks[currentTrack].id;
        const newCounts = updateLocalPlayCount(trackId);
        setPlayCounts(newCounts);
        savePlayCountToDb(trackId);
      }
      setIsPlaying(!isPlaying);
      setIsExpanded(true);
      setIsVisible(true);
    };

    const handlePlaySpecificTrack = (event: CustomEvent<{ trackIndex: number }>) => {
      const { trackIndex } = event.detail;
      if (trackIndex >= 0 && trackIndex < tracks.length) {
        setCurrentTrack(trackIndex);
        setDisplayedTrack(trackIndex);
        const trackId = tracks[trackIndex].id;
        const newCounts = updateLocalPlayCount(trackId);
        setPlayCounts(newCounts);
        savePlayCountToDb(trackId);
        setIsPlaying(true);
        setIsExpanded(true);
        setIsVisible(true);
      }
    };

    const handlePlayTrackById = (event: CustomEvent<{ trackId: string }>) => {
      const { trackId } = event.detail;
      // Find track by matching src filename (e.g., "attention-please" matches "/audio/attention-please.mp3")
      const trackIndex = tracks.findIndex(t => t.src.includes(trackId));
      if (trackIndex >= 0) {
        setCurrentTrack(trackIndex);
        setDisplayedTrack(trackIndex);
        const foundTrackId = tracks[trackIndex].id;
        const newCounts = updateLocalPlayCount(foundTrackId);
        setPlayCounts(newCounts);
        savePlayCountToDb(foundTrackId);
        setIsPlaying(true);
        setIsExpanded(true);
        setIsVisible(true);
      }
    };

    window.addEventListener('toggleMusicPlayer', handleToggleMusic);
    window.addEventListener('playSpecificTrack', handlePlaySpecificTrack as EventListener);
    window.addEventListener('playTrackById', handlePlayTrackById as EventListener);
    return () => {
      window.removeEventListener('toggleMusicPlayer', handleToggleMusic);
      window.removeEventListener('playSpecificTrack', handlePlaySpecificTrack as EventListener);
      window.removeEventListener('playTrackById', handlePlayTrackById as EventListener);
    };
  }, [currentTrack, isPlaying, tracks]);

  useEffect(() => {
    if (audioRef.current && tracks.length > 0) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, tracks.length]);

  const togglePlay = () => {
    if (tracks.length === 0) return;
    if (!isPlaying) {
      const trackId = tracks[currentTrack].id;
      const newCounts = updateLocalPlayCount(trackId);
      setPlayCounts(newCounts);
      savePlayCountToDb(trackId);
    }
    setIsPlaying(!isPlaying);
  };

  const changeTrackWithAnimation = useCallback((newTrack: number) => {
    if (newTrack === currentTrack) return;
    setIsChangingTrack(true);
    setTimeout(() => {
      setCurrentTrack(newTrack);
      setDisplayedTrack(newTrack);
      setTimeout(() => {
        setIsChangingTrack(false);
      }, 300);
    }, 300);
  }, [currentTrack]);

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      const prevTrack = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
      changeTrackWithAnimation(prevTrack);
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    changeTrackWithAnimation(getNextTrack());
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const updateEqBand = (index: number, value: number) => {
    const newValues = [...eqValues];
    newValues[index] = value;
    setEqValues(newValues);
    setEqPreset('custom');
    
    if (eqFiltersRef.current[index]) {
      eqFiltersRef.current[index].gain.value = value;
    }
  };

  const applyEqPreset = (preset: string) => {
    setEqPreset(preset);
    const values = EQ_PRESETS[preset] || EQ_PRESETS.flat;
    setEqValues(values);
    
    eqFiltersRef.current.forEach((filter, index) => {
      if (filter) {
        filter.gain.value = values[index];
      }
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load lyrics from track or transcribe
  const loadOrTranscribeLyrics = async () => {
    if (tracks.length === 0) return;
    const track = tracks[currentTrack];
    const trackId = track.id;
    
    // First check if track has saved lyrics
    if (track.lyrics && track.lyrics.length > 0) {
      setCurrentLyrics(track.lyrics);
      setShowLyrics(true);
      return;
    }
    
    // Then check cache
    if (lyricsCache[trackId]) {
      setCurrentLyrics(lyricsCache[trackId]);
      setShowLyrics(true);
      return;
    }

    // Otherwise transcribe
    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      const audioResponse = await fetch(track.src);
      const audioBlob = await audioResponse.blob();
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `${track.title}.mp3`);
      formData.append('title', track.title);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-lyrics`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const errorMsg = (errorData?.error as string | undefined) || (errorData?.detail?.message as string | undefined) || 'Failed to transcribe';
        if (String(errorMsg).includes('missing_permissions') || String(errorMsg).includes('speech_to_text')) {
          throw new Error('歌詞抽出に必要なspeech_to_text権限がAPIキーにありません（ElevenLabsのコネクター設定で権限付きキーに更新してください）。');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Use AI-corrected lyrics if available, otherwise use raw transcription
      let lyrics: LyricLine[];
      
      if (data.correctedLyrics && data.correctedLyrics.length > 0) {
        // AI corrected lyrics are already grouped into lines
        lyrics = data.correctedLyrics;
        console.log('Using AI-corrected lyrics');
      } else {
        // Convert ElevenLabs response to LyricLine format
        lyrics = data.words?.map((word: { text: string; start: number; end: number }) => ({
          text: word.text,
          start: word.start,
          end: word.end,
        })) || [];
        
        // Group words into lines (by sentence or time gap)
        lyrics = groupWordsIntoLines(lyrics);
      }
      
      if (lyrics.length > 0) {
        lyricsCache[trackId] = lyrics;
        setCurrentLyrics(lyrics);
        setShowLyrics(true);
      } else {
        setTranscribeError('歌詞が検出されませんでした');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscribeError('歌詞の抽出に失敗しました');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Group words into lines based on time gaps
  const groupWordsIntoLines = (words: LyricLine[]): LyricLine[] => {
    if (words.length === 0) return [];
    
    const lines: LyricLine[] = [];
    let currentLine = { text: words[0].text, start: words[0].start, end: words[0].end };
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const gap = word.start - currentLine.end;
      
      // If gap is more than 1 second or text ends with punctuation, start new line
      if (gap > 1 || /[。、！？.!?,]$/.test(currentLine.text)) {
        lines.push(currentLine);
        currentLine = { text: word.text, start: word.start, end: word.end };
      } else {
        currentLine.text += ' ' + word.text;
        currentLine.end = word.end;
      }
    }
    lines.push(currentLine);
    
    return lines;
  };

  // Update current lyric index based on playback time
  useEffect(() => {
    if (!currentLyrics || currentLyrics.length === 0) {
      setCurrentLyricIndex(-1);
      return;
    }
    
    const index = currentLyrics.findIndex((line, i) => {
      const nextLine = currentLyrics[i + 1];
      return currentTime >= line.start && (nextLine ? currentTime < nextLine.start : currentTime <= line.end);
    });
    
    setCurrentLyricIndex(index);
  }, [currentTime, currentLyrics]);

  // Auto-scroll to current lyric
  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeElement = lyricsContainerRef.current.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  // Loading state
  if (isLoading || tracks.length === 0) {
    return null;
  }

  const track = tracks[currentTrack];

  const Visualizer = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-end justify-center gap-[1px] ${compact ? 'h-6' : 'h-10'}`}>
      {analyzerData.slice(0, 24).map((value, index) => (
        <motion.div
          key={index}
          className="w-0.5 rounded-full bg-gradient-to-t from-primary to-primary/50"
          animate={{
            height: `${Math.max(compact ? 6 : 3, value * (compact ? 24 : 40))}px`,
          }}
          transition={{ duration: 0.05 }}
        />
      ))}
    </div>
  );

  // Hide music player when video is playing
  if (activeVideoId) {
    return null;
  }

  if (!isVisible) {
    return (
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg glow-primary"
        onClick={() => setIsVisible(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Music className="h-6 w-6 text-primary-foreground" />
      </motion.button>
    );
  }

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="metadata" crossOrigin="anonymous" />
      
      <motion.div
        ref={playerContainerRef}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
        }}
        className="fixed bottom-6 right-6 z-50 touch-none"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: (!isUIVisible && !isExpanded) ? 150 : position.y, 
          x: position.x,
          opacity: (!isUIVisible && !isExpanded) ? 0 : 1 
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              className="rounded-[2rem] w-80 shadow-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden"
              style={{
                background: `linear-gradient(145deg, ${track.color}15 0%, hsl(var(--background)) 50%, ${track.color}10 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${track.color}30`,
                boxShadow: `0 25px 50px -12px ${track.color}40, 0 0 0 1px ${track.color}10`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            {/* Drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-1">
                <GripVertical className="h-4 w-4 text-muted-foreground/30" />
              </div>

              {/* Header with glassmorphism */}
              <div className="relative px-5 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: track.color }}
                      animate={isPlaying ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now Playing</span>
                  </div>
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Track Info (moved up) */}
              <div className="px-5 text-center mb-4">
                <motion.h3 
                  className="text-xl font-bold text-foreground truncate mb-1"
                  key={track.title}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {track.title}
                </motion.h3>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {track.artist}
                </motion.p>
              </div>

              {/* Waveform Visualizer */}
              {isPlaying && (
                <div className="px-5 mb-4">
                  <div className="flex items-center justify-center gap-[2px] h-8">
                    {analyzerData.slice(0, 32).map((value, index) => (
                      <motion.div
                        key={index}
                        className="w-1 rounded-full"
                        style={{
                          background: `linear-gradient(to top, ${track.color}, ${track.color}80)`,
                        }}
                        animate={{
                          height: `${Math.max(4, value * 32)}px`,
                        }}
                        transition={{ duration: 0.05 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="px-5 mb-4">
                <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${track.color}, ${track.color}cc)`,
                      width: `${(currentTime / (duration || 1)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="px-5 flex items-center justify-center gap-3 mb-5">
                <motion.button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2.5 rounded-full transition-all ${isShuffle ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  style={isShuffle ? { backgroundColor: `${track.color}30` } : {}}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Shuffle className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  onClick={handlePrevTrack}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="h-5 w-5 text-foreground" />
                </motion.button>
                
                <motion.button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${track.color}, ${track.color}cc)`,
                    boxShadow: `0 10px 30px -10px ${track.color}80`,
                  }}
                  whileHover={{ scale: 1.1, boxShadow: `0 15px 40px -10px ${track.color}` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={false}
                    animate={isPlaying ? { scale: [1, 1.5], opacity: [0.3, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  {isPlaying ? (
                    <Pause className="h-7 w-7 text-white relative z-10" />
                  ) : (
                    <Play className="h-7 w-7 text-white ml-1 relative z-10" />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleNextTrack}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="h-5 w-5 text-foreground" />
                </motion.button>

                <motion.button
                  onClick={toggleRepeat}
                  className={`p-2.5 rounded-full transition-all ${repeatMode !== 'off' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  style={repeatMode !== 'off' ? { backgroundColor: `${track.color}30` } : {}}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              {/* Volume & Controls Row */}
              <div className="px-5 flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <motion.button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </motion.button>
                  <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ 
                        backgroundColor: track.color,
                        width: `${(isMuted ? 0 : volume) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <motion.button
                    onClick={() => setShowEqualizer(!showEqualizer)}
                    className={`p-2 rounded-full transition-all ${showEqualizer ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}`}
                    style={showEqualizer ? { backgroundColor: `${track.color}30` } : {}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={loadOrTranscribeLyrics}
                    disabled={isTranscribing}
                    className={`p-2 rounded-full transition-all ${showLyrics ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}`}
                    style={showLyrics ? { backgroundColor: `${track.color}30` } : {}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isTranscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Lyrics Display with Timestamps */}
              <AnimatePresence>
                {showLyrics && currentLyrics && currentLyrics.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4 px-5"
                  >
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">歌詞</span>
                        <motion.button
                          onClick={() => setShowLyrics(false)}
                          className="p-1 rounded-full hover:bg-secondary"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </motion.button>
                      </div>
                      <div 
                        ref={lyricsContainerRef}
                        className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
                      >
                        <div className="space-y-1 py-2">
                          {currentLyrics.map((line, index) => (
                            <motion.div
                              key={index}
                              data-lyric-index={index}
                              className={`px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                                index === currentLyricIndex 
                                  ? 'bg-primary/20 scale-[1.02]' 
                                  : 'hover:bg-secondary/50'
                              }`}
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.currentTime = line.start;
                                }
                              }}
                              animate={{
                                opacity: index === currentLyricIndex ? 1 : 0.6,
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] text-muted-foreground font-mono min-w-[32px] pt-0.5">
                                  {formatTime(line.start)}
                                </span>
                                <p 
                                  className={`text-xs leading-relaxed flex-1 ${
                                    index === currentLyricIndex 
                                      ? 'text-foreground font-medium' 
                                      : 'text-muted-foreground'
                                  }`}
                                  style={index === currentLyricIndex ? { color: track.color } : {}}
                                >
                                  {line.text}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transcribe Error */}
              <AnimatePresence>
                {transcribeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-xs text-destructive">{transcribeError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Equalizer */}
              <AnimatePresence>
                {showEqualizer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-5 mb-4"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-foreground">Equalizer</span>
                        <select
                          value={eqPreset}
                          onChange={(e) => applyEqPreset(e.target.value)}
                          className="text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
                          style={{ backgroundColor: `${track.color}20` }}
                        >
                          <option value="flat">Flat</option>
                          <option value="bass">Bass Boost</option>
                          <option value="treble">Treble Boost</option>
                          <option value="vocal">Vocal</option>
                          <option value="rock">Rock</option>
                          <option value="electronic">Electronic</option>
                          {eqPreset === 'custom' && <option value="custom">Custom</option>}
                        </select>
                      </div>
                      <div className="flex items-end justify-between gap-1 h-20">
                        {EQ_BANDS.map((band, index) => (
                          <div key={band.frequency} className="flex flex-col items-center gap-1 flex-1">
                            <div className="relative h-14 w-full flex items-center justify-center">
                              <input
                                type="range"
                                min="-12"
                                max="12"
                                step="1"
                                value={eqValues[index]}
                                onChange={(e) => updateEqBand(index, Number(e.target.value))}
                                className="absolute h-12 w-1.5 appearance-none cursor-pointer bg-white/10 rounded-full [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                style={{ 
                                  '--tw-shadow-color': track.color,
                                } as React.CSSProperties}
                              />
                              <motion.div
                                className="absolute bottom-0 w-1.5 rounded-full pointer-events-none"
                                style={{ background: `linear-gradient(to top, ${track.color}, ${track.color}60)` }}
                                animate={{ height: `${((eqValues[index] + 12) / 24) * 44}px` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <span className="text-[8px] text-muted-foreground">{band.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Track List */}
              <div className="px-5">
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Playlist</p>
                  <div className="space-y-2">
                    {tracks.map((t, index) => (
                      <motion.button
                        key={t.id}
                        onClick={() => {
                          changeTrackWithAnimation(index);
                          const newCounts = updateLocalPlayCount(t.id);
                          setPlayCounts(newCounts);
                          savePlayCountToDb(t.id);
                          setIsPlaying(true);
                        }}
                        className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-3 ${
                          currentTrack === index
                            ? ''
                            : 'hover:bg-white/5'
                        }`}
                        style={currentTrack === index ? {
                          background: `linear-gradient(135deg, ${t.color}20 0%, transparent 100%)`,
                          border: `1px solid ${t.color}30`,
                        } : {}}
                        whileHover={{ x: 4 }}
                      >
                        <div className="relative">
                          <img 
                            src={t.artwork} 
                            alt={t.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          {currentTrack === index && isPlaying && (
                            <motion.div
                              className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/40"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="flex items-end gap-0.5 h-4">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-0.5 bg-white rounded-full"
                                    animate={{ height: ['40%', '100%', '40%'] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${currentTrack === index ? '' : 'text-foreground'}`}
                            style={currentTrack === index ? { color: t.color } : {}}
                          >
                            {t.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{t.artist}</p>
                        </div>
                        {playCounts[t.id] > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                            <Play className="h-2.5 w-2.5" />
                            {playCounts[t.id]}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Album Art at bottom */}
              <div className="px-5 py-4 pb-5">
                <div className="relative mx-auto w-32 h-32">
                  <motion.div
                    className="absolute inset-0 rounded-2xl blur-xl"
                    style={{ backgroundColor: track.color }}
                    animate={isPlaying ? { 
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.05, 1],
                    } : { opacity: 0.15 }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayedTrack}
                      className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        boxShadow: `0 15px 30px -10px ${track.color}50`,
                      }}
                    >
                      <img 
                        src={tracks[displayedTrack].artwork} 
                        alt={tracks[displayedTrack].title}
                        className="w-full h-full object-cover"
                      />
                      
                      {isPlaying && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="compact"
              className="rounded-2xl p-3 shadow-xl"
              style={{
                background: `linear-gradient(145deg, ${track.color}20 0%, hsl(var(--background)) 50%, ${track.color}10 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${track.color}30`,
                boxShadow: `0 15px 30px -10px ${track.color}40`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Main row - clickable to expand */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden relative shadow-lg"
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ boxShadow: `0 5px 20px -5px ${track.color}60` }}
                >
                  <img 
                    src={track.artwork} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 bg-black/30 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-end gap-0.5 h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-white rounded-full"
                            animate={{ height: ['30%', '100%', '30%'] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {track.artist}
                    {isDucking && <span className="ml-1 text-primary/70">(読み上げ中)</span>}
                  </p>
                </div>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${track.color}, ${track.color}cc)`,
                    boxShadow: `0 5px 15px -5px ${track.color}80`,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white ml-0.5" />
                  )}
                </motion.button>
              </div>
              
              {/* Controls row - volume only when playing, expand button always visible */}
              <div 
                className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Volume control - only show when playing */}
                {isPlaying && (
                  <>
                    <motion.button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {isMuted ? (
                        <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </motion.button>
                    <motion.div
                      className="flex-1"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                    >
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={([value]) => {
                          setVolume(value);
                          setIsMuted(false);
                        }}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </motion.div>
                    <motion.span 
                      className="text-[10px] text-muted-foreground min-w-[28px] text-right"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </motion.span>
                  </>
                )}
                
                {/* Expand button - always visible and prominent */}
                <motion.button
                  onClick={() => setIsExpanded(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isPlaying ? '' : 'flex-1 justify-center'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${track.color}30, ${track.color}10)`,
                    border: `1px solid ${track.color}40`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 5px 15px -5px ${track.color}40` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span className="text-foreground/80">
                    {isPlaying ? '' : 'プレイリストを開く'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default MusicPlayer;
