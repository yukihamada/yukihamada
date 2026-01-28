import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ImageGalleryLightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const ImageGalleryLightbox = ({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose,
  onIndexChange 
}: ImageGalleryLightboxProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: currentIndex,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  // Update embla when currentIndex changes
  useEffect(() => {
    if (emblaApi && isOpen) {
      emblaApi.scrollTo(currentIndex, true);
      setSelectedIndex(currentIndex);
    }
  }, [emblaApi, currentIndex, isOpen]);

  // Handle slide change
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      onIndexChange?.(index);
    };
    
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onIndexChange]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      scrollNext();
    }
  }, [onClose, scrollPrev, scrollNext]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (images.length === 0) return null;

  const currentImage = images[selectedIndex] || images[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Header with close button and counter */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
            <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Carousel */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden px-16 py-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="embla w-full max-w-[90vw] max-h-[80vh]" ref={emblaRef}>
              <div className="embla__container flex">
                {images.map((image, index) => (
                  <div 
                    key={`${image.src}-${index}`}
                    className="embla__slide flex-[0_0_100%] min-w-0 flex items-center justify-center"
                  >
                    <motion.img
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      src={image.src}
                      alt={image.alt}
                      className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Caption */}
          {currentImage.alt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-2xl px-6"
            >
              <p className="text-white text-center text-sm md:text-base font-medium bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                {currentImage.alt}
              </p>
            </motion.div>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollTo(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageGalleryLightbox;
