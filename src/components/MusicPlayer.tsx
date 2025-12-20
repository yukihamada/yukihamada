import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X, ChevronUp, Shuffle, Repeat, Repeat1, SlidersHorizontal, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

import albumFreeToChange from '@/assets/album-free-to-change.jpg';
import albumHello2150 from '@/assets/album-hello-2150.jpg';
import albumBjj from '@/assets/album-everybody-bjj.jpg';
import albumILoveYou from '@/assets/album-i-love-you.jpg';
import albumAttention from '@/assets/album-attention.jpg';
import albumKoiJujutsu from '@/assets/album-koi-jujutsu.jpg';
import albumShioPixel from '@/assets/album-shio-pixel.jpg';
import albumMusubinaosu from '@/assets/album-musubinaosu.jpg';

const tracks = [
  {
    id: 1,
    title: 'Free to Change',
    artist: 'Yuki Hamada',
    src: '/audio/free-to-change.mp3',
    artwork: albumFreeToChange,
    lyrics: null as string | null,
    color: '#3b82f6', // Blue
  },
  {
    id: 2,
    title: 'HELLO 2150',
    artist: 'Yuki Hamada',
    src: '/audio/hello-2150.mp3',
    artwork: albumHello2150,
    lyrics: null as string | null,
    color: '#8b5cf6', // Purple
  },
  {
    id: 3,
    title: 'Everybody say BJJ',
    artist: 'Yuki Hamada',
    src: '/audio/everybody-say-bjj.mp3',
    artwork: albumBjj,
    lyrics: null as string | null,
    color: '#ef4444', // Red
  },
  {
    id: 4,
    title: 'I Love You',
    artist: 'Yuki Hamada',
    src: '/audio/i-love-you.mp3',
    artwork: albumILoveYou,
    lyrics: null as string | null,
    color: '#ec4899', // Pink
  },
  {
    id: 5,
    title: 'I Need Your Attention',
    artist: 'Yuki Hamada',
    src: '/audio/i-need-your-attention.mp3',
    artwork: albumAttention,
    lyrics: null as string | null,
    color: '#f59e0b', // Amber
  },
  {
    id: 6,
    title: 'それ恋じゃなく柔術でした',
    artist: 'Yuki Hamada',
    src: '/audio/sore-koi-janaku-jujutsu.mp3',
    artwork: albumKoiJujutsu,
    lyrics: null as string | null,
    color: '#10b981', // Emerald
  },
  {
    id: 7,
    title: '塩とピクセル',
    artist: 'Yuki Hamada',
    src: '/audio/shio-to-pixel.mp3',
    artwork: albumShioPixel,
    lyrics: null as string | null,
    color: '#06b6d4', // Cyan
  },
  {
    id: 8,
    title: '結び直す朝',
    artist: 'Yuki Hamada',
    src: '/audio/musubinaosu-asa.mp3',
    artwork: albumMusubinaosu,
    lyrics: null as string | null,
    color: '#f97316', // Orange
  },
];

// Store lyrics in memory
const lyricsCache: Record<number, string> = {};

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
const getPlayCounts = (): Record<number, number> => {
  try {
    const stored = localStorage.getItem('musicPlayCounts');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const savePlayCount = (trackId: number) => {
  const counts = getPlayCounts();
  counts[trackId] = (counts[trackId] || 0) + 1;
  localStorage.setItem('musicPlayCounts', JSON.stringify(counts));
  return counts;
};

const MusicPlayer = () => {
  const { setIsPlaying: setGlobalIsPlaying, setAnalyzerData: setGlobalAnalyzerData, setCurrentColor } = useMusicPlayer();
  const [isPlaying, setIsPlayingLocal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(() => Math.floor(Math.random() * tracks.length));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true); // Default to shuffle ON
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all'); // Default to repeat all
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(32).fill(0));
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [displayedTrack, setDisplayedTrack] = useState(() => Math.floor(Math.random() * tracks.length));
  const [playCounts, setPlayCounts] = useState<Record<number, number>>(getPlayCounts);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [eqValues, setEqValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [eqPreset, setEqPreset] = useState<string>('flat');
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  // Update color when track changes
  useEffect(() => {
    setCurrentColor(tracks[currentTrack].color);
  }, [currentTrack, setCurrentColor]);

  // Wrapper for setIsPlaying that also updates global state
  const setIsPlaying = (playing: boolean) => {
    setIsPlayingLocal(playing);
    setGlobalIsPlaying(playing);
  };
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const animationRef = useRef<number | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 64;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    // Create EQ filters
    const filters = EQ_BANDS.map((band, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === EQ_BANDS.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = band.frequency;
      filter.gain.value = eqValues[index];
      filter.Q.value = 1;
      return filter;
    });
    
    // Chain filters: source -> filter1 -> filter2 -> ... -> analyzer -> destination
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const getNextTrack = useCallback(() => {
    if (isShuffle) {
      let newTrack = Math.floor(Math.random() * tracks.length);
      while (newTrack === currentTrack && tracks.length > 1) {
        newTrack = Math.floor(Math.random() * tracks.length);
      }
      return newTrack;
    }
    return currentTrack < tracks.length - 1 ? currentTrack + 1 : 0;
  }, [isShuffle, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
  }, [currentTrack, repeatMode, isShuffle, getNextTrack]);

  // Listen for external toggle event
  useEffect(() => {
    const handleToggleMusic = () => {
      if (!isPlaying) {
        const trackId = tracks[currentTrack].id;
        const newCounts = savePlayCount(trackId);
        setPlayCounts(newCounts);
      }
      setIsPlaying(!isPlaying);
      setIsExpanded(true);
      setIsVisible(true);
    };

    // Listen for specific track play request
    const handlePlaySpecificTrack = (event: CustomEvent<{ trackIndex: number }>) => {
      const { trackIndex } = event.detail;
      if (trackIndex >= 0 && trackIndex < tracks.length) {
        setCurrentTrack(trackIndex);
        setDisplayedTrack(trackIndex);
        const trackId = tracks[trackIndex].id;
        const newCounts = savePlayCount(trackId);
        setPlayCounts(newCounts);
        setIsPlaying(true);
        setIsExpanded(true);
        setIsVisible(true);
      }
    };

    window.addEventListener('toggleMusicPlayer', handleToggleMusic);
    window.addEventListener('playSpecificTrack', handlePlaySpecificTrack as EventListener);
    return () => {
      window.removeEventListener('toggleMusicPlayer', handleToggleMusic);
      window.removeEventListener('playSpecificTrack', handlePlaySpecificTrack as EventListener);
    };
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    if (!isPlaying) {
      // Record play count when starting to play
      const trackId = tracks[currentTrack].id;
      const newCounts = savePlayCount(trackId);
      setPlayCounts(newCounts);
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
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      const prevTrack = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
      changeTrackWithAnimation(prevTrack);
    }
  };

  const handleNextTrack = () => {
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

  // Transcribe lyrics using ElevenLabs
  const transcribeLyrics = async () => {
    const trackId = tracks[currentTrack].id;
    
    // Check cache first
    if (lyricsCache[trackId]) {
      setCurrentLyrics(lyricsCache[trackId]);
      setShowLyrics(true);
      return;
    }

    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      // Fetch the audio file
      const audioResponse = await fetch(tracks[currentTrack].src);
      const audioBlob = await audioResponse.blob();
      
      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, `${tracks[currentTrack].title}.mp3`);

      // Call the transcription edge function
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
        throw new Error('Failed to transcribe');
      }

      const data = await response.json();
      const lyrics = data.text || 'No lyrics detected';
      
      // Cache the lyrics
      lyricsCache[trackId] = lyrics;
      setCurrentLyrics(lyrics);
      setShowLyrics(true);
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscribeError('歌詞の抽出に失敗しました');
    } finally {
      setIsTranscribing(false);
    }
  };

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
        className="fixed bottom-6 right-6 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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

              {/* Album Art with Glow */}
              <div className="px-5 py-4">
                <div className="relative mx-auto w-48 h-48">
                  {/* Glow background */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl blur-2xl"
                    style={{ backgroundColor: track.color }}
                    animate={isPlaying ? { 
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.1, 1],
                    } : { opacity: 0.2 }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Album art container */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayedTrack}
                      className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        boxShadow: `0 20px 40px -15px ${track.color}60`,
                      }}
                    >
                      <img 
                        src={tracks[displayedTrack].artwork} 
                        alt={tracks[displayedTrack].title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Vinyl overlay when playing */}
                      {isPlaying && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Spinning vinyl peek */}
                  {isPlaying && (
                    <motion.div
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-12 h-24 overflow-hidden"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="absolute inset-2 rounded-full border border-zinc-700/30" />
                        <div className="absolute inset-4 rounded-full border border-zinc-700/50" />
                        <div className="absolute inset-6 rounded-full border border-zinc-700/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-zinc-700" />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Track Info */}
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

              {/* Progress Bar - Modern Style */}
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

              {/* Controls - Modern circular layout */}
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

              {/* Volume & Controls Row - Minimal style */}
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
                    onClick={transcribeLyrics}
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

              {/* Lyrics Display */}
              <AnimatePresence>
                {showLyrics && currentLyrics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 max-h-32 overflow-y-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">歌詞 (AI自動抽出)</span>
                        <motion.button
                          onClick={() => setShowLyrics(false)}
                          className="p-1 rounded-full hover:bg-secondary"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </motion.button>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {currentLyrics}
                      </p>
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

              {/* Equalizer - Modern style */}
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

              {/* Track List - Modern cards */}
              <div className="px-5 pb-5">
                <div className="pt-4 border-t border-white/10 max-h-36 overflow-y-auto scrollbar-thin">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Playlist</p>
                  <div className="space-y-2">
                    {tracks.map((t, index) => (
                      <motion.button
                        key={t.id}
                        onClick={() => {
                          changeTrackWithAnimation(index);
                          const newCounts = savePlayCount(t.id);
                          setPlayCounts(newCounts);
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
            </motion.div>
          ) : (
            <motion.div
              key="compact"
              className="rounded-2xl p-3 flex items-center gap-3 shadow-xl cursor-pointer"
              style={{
                background: `linear-gradient(145deg, ${track.color}20 0%, hsl(var(--background)) 50%, ${track.color}10 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${track.color}30`,
                boxShadow: `0 15px 30px -10px ${track.color}40`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.03, boxShadow: `0 20px 40px -10px ${track.color}50` }}
            >
              {/* Album art thumbnail */}
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
                <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default MusicPlayer;