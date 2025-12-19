import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X, ChevronUp, Shuffle, Repeat, Repeat1, SlidersHorizontal } from 'lucide-react';

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
  },
  {
    id: 2,
    title: 'HELLO 2150',
    artist: 'Yuki Hamada',
    src: '/audio/hello-2150.mp3',
    artwork: albumHello2150,
  },
  {
    id: 3,
    title: 'Everybody say BJJ',
    artist: 'Yuki Hamada',
    src: '/audio/everybody-say-bjj.mp3',
    artwork: albumBjj,
  },
  {
    id: 4,
    title: 'I Love You',
    artist: 'Yuki Hamada',
    src: '/audio/i-love-you.mp3',
    artwork: albumILoveYou,
  },
  {
    id: 5,
    title: 'I Need Your Attention',
    artist: 'Yuki Hamada',
    src: '/audio/i-need-your-attention.mp3',
    artwork: albumAttention,
  },
  {
    id: 6,
    title: 'それ恋じゃなく柔術でした',
    artist: 'Yuki Hamada',
    src: '/audio/sore-koi-janaku-jujutsu.mp3',
    artwork: albumKoiJujutsu,
  },
  {
    id: 7,
    title: '塩とピクセル',
    artist: 'Yuki Hamada',
    src: '/audio/shio-to-pixel.mp3',
    artwork: albumShioPixel,
  },
  {
    id: 8,
    title: '結び直す朝',
    artist: 'Yuki Hamada',
    src: '/audio/musubinaosu-asa.mp3',
    artwork: albumMusubinaosu,
  },
];

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
  const [isPlaying, setIsPlaying] = useState(false);
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

    animationRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

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

  const track = tracks[currentTrack];

  const Visualizer = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-end justify-center gap-[2px] ${compact ? 'h-8' : 'h-16'}`}>
      {analyzerData.map((value, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-primary/50"
          animate={{
            height: `${Math.max(compact ? 8 : 4, value * (compact ? 32 : 64))}px`,
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
              className="glass rounded-3xl p-6 w-80 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Music Player</span>
                <div className="flex gap-1">
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
                  </motion.button>
                  <motion.button
                    onClick={() => setIsVisible(false)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Turntable with Vinyl Record */}
              <div className="text-center mb-4">
                <div className="relative w-56 h-56 mx-auto mb-4">
                  {/* Turntable base */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-2xl border border-zinc-700/30" />
                  
                  {/* Platter */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-inner" />
                  
                  {/* Vinyl record with swap animation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayedTrack}
                      className="absolute inset-4 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
                      initial={{ y: -100, opacity: 0, scale: 0.8 }}
                      animate={{ 
                        y: 0, 
                        opacity: 1, 
                        scale: 1,
                        rotate: isPlaying && !isChangingTrack ? 360 : 0 
                      }}
                      exit={{ y: 100, opacity: 0, scale: 0.8 }}
                      transition={
                        isPlaying && !isChangingTrack 
                          ? { rotate: { duration: 3, repeat: Infinity, ease: "linear" }, default: { duration: 0.3 } }
                          : { duration: 0.3 }
                      }
                      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                    >
                      {/* Vinyl grooves */}
                      <div className="absolute inset-2 rounded-full border border-zinc-700/50" />
                      <div className="absolute inset-4 rounded-full border border-zinc-700/30" />
                      <div className="absolute inset-6 rounded-full border border-zinc-700/50" />
                      <div className="absolute inset-8 rounded-full border border-zinc-700/30" />
                      <div className="absolute inset-10 rounded-full border border-zinc-700/50" />
                      
                      {/* Center label with album art */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-zinc-700 shadow-inner">
                          <img 
                            src={tracks[displayedTrack].artwork} 
                            alt={tracks[displayedTrack].title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Center hole */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-600" />
                      </div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Tonearm */}
                  <motion.div
                    className="absolute top-2 right-2 origin-top-right"
                    animate={{ rotate: isPlaying ? 25 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {/* Tonearm base */}
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 shadow-lg border border-zinc-400/30" />
                    
                    {/* Tonearm arm */}
                    <div className="absolute top-3 right-3 w-1.5 h-28 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full origin-top transform -rotate-12 shadow-md" />
                    
                    {/* Headshell */}
                    <motion.div 
                      className="absolute top-[7rem] right-1 transform -rotate-12"
                      animate={isPlaying ? { y: [0, 0.5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <div className="w-3 h-5 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-sm shadow-md" />
                      {/* Stylus */}
                      <div className="w-0.5 h-1.5 bg-zinc-300 mx-auto mt-0.5" />
                    </motion.div>
                  </motion.div>
                  
                  {/* Glow effect when playing */}
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-4 rounded-full pointer-events-none"
                      animate={{
                        boxShadow: [
                          "0 0 20px hsl(var(--primary) / 0.3)",
                          "0 0 40px hsl(var(--primary) / 0.5)",
                          "0 0 20px hsl(var(--primary) / 0.3)",
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Visualizer below vinyl */}
                {isPlaying && (
                  <div className="mb-3">
                    <Visualizer />
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-foreground truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full transition-colors ${isShuffle ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Shuffle className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  onClick={handlePrevTrack}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="h-5 w-5 text-foreground" />
                </motion.button>
                
                <motion.button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleNextTrack}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="h-5 w-5 text-foreground" />
                </motion.button>

                <motion.button
                  onClick={toggleRepeat}
                  className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              {/* Volume & EQ Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </motion.button>
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
                  className="flex-1 h-1 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <motion.button
                  onClick={() => setShowEqualizer(!showEqualizer)}
                  className={`p-1.5 rounded-full transition-colors ${showEqualizer ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Equalizer */}
              <AnimatePresence>
                {showEqualizer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-foreground">Equalizer</span>
                        <select
                          value={eqPreset}
                          onChange={(e) => applyEqPreset(e.target.value)}
                          className="text-xs bg-background/50 border border-border rounded-md px-2 py-1 text-foreground"
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
                      <div className="flex items-end justify-between gap-1 h-24">
                        {EQ_BANDS.map((band, index) => (
                          <div key={band.frequency} className="flex flex-col items-center gap-1 flex-1">
                            <div className="relative h-16 w-full flex items-center justify-center">
                              <input
                                type="range"
                                min="-12"
                                max="12"
                                step="1"
                                value={eqValues[index]}
                                onChange={(e) => updateEqBand(index, Number(e.target.value))}
                                className="absolute h-12 w-1.5 appearance-none cursor-pointer bg-secondary/50 rounded-full [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
                              />
                              <motion.div
                                className="absolute bottom-0 w-1.5 bg-gradient-to-t from-primary/80 to-primary/40 rounded-full pointer-events-none"
                                animate={{ height: `${((eqValues[index] + 12) / 24) * 48}px` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground">{band.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                        <span>+12dB</span>
                        <span>0dB</span>
                        <span>-12dB</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Track List */}
              <div className="pt-4 border-t border-border max-h-40 overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-2">プレイリスト</p>
                <div className="space-y-1">
                  {tracks.map((t, index) => (
                    <motion.button
                      key={t.id}
                      onClick={() => {
                        changeTrackWithAnimation(index);
                        const newCounts = savePlayCount(t.id);
                        setPlayCounts(newCounts);
                        setIsPlaying(true);
                      }}
                      className={`w-full p-2 rounded-lg text-left transition-colors flex items-center gap-3 ${
                        currentTrack === index
                          ? 'bg-primary/20'
                          : 'hover:bg-secondary'
                      }`}
                      whileHover={{ x: 3 }}
                    >
                      <img 
                        src={t.artwork} 
                        alt={t.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${currentTrack === index ? 'text-primary' : 'text-foreground'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.artist}</p>
                      </div>
                      {playCounts[t.id] > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                          <Play className="h-3 w-3" />
                          {playCounts[t.id]}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="compact"
              className="glass rounded-2xl p-3 flex items-center gap-3 shadow-xl cursor-pointer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Mini Vinyl Record */}
              <motion.div
                className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                style={{ boxShadow: isPlaying ? "0 0 15px hsl(var(--primary) / 0.4)" : "0 2px 8px rgba(0,0,0,0.3)" }}
              >
                {/* Mini grooves */}
                <div className="absolute inset-1 rounded-full border border-zinc-700/30" />
                <div className="absolute inset-2 rounded-full border border-zinc-700/50" />
                
                {/* Mini center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-600">
                    <img 
                      src={track.artwork} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Mini center hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-zinc-900" />
                </div>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.3)" }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-primary" />
                ) : (
                  <Play className="h-5 w-5 text-primary ml-0.5" />
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