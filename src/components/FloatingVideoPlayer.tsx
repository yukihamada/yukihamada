import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
import { Button } from '@/components/ui/button';

const FloatingVideoPlayer = () => {
  const { activeVideoId, isFloating, isExpanded, setIsExpanded, closeVideo } = useVideoPlayer();
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = useCallback(() => {
    closeVideo();
  }, [closeVideo]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  if (!activeVideoId || !isFloating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          width: isExpanded ? '90vw' : '360px',
          height: isExpanded ? '80vh' : '203px',
          right: isExpanded ? '5vw' : '16px',
          bottom: isExpanded ? '10vh' : '16px',
        }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag={!isExpanded}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        className={`fixed z-[9999] rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 ${
          isExpanded ? 'max-w-4xl' : ''
        }`}
        style={{
          right: isExpanded ? '5vw' : 16,
          bottom: isExpanded ? '10vh' : 16,
          width: isExpanded ? '90vw' : 360,
          maxWidth: isExpanded ? '896px' : '360px',
        }}
      >
        {/* Control bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end gap-1 p-2 bg-gradient-to-b from-black/80 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag handle indicator */}
        {!isExpanded && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-8 h-1 rounded-full bg-white/30" />
          </div>
        )}

        {/* YouTube iframe */}
        <div className="w-full h-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingVideoPlayer;
