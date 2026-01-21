import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const BlogPostSkeleton = () => {
  const { language } = useLanguage();
  
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation skeleton */}
      <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="relative pt-12 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Title */}
          <div className="space-y-3 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          
          {/* Author info */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          
          {/* Featured image skeleton */}
          <motion.div 
            className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-10"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={shimmer.animate}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Summary box skeleton */}
            <motion.div 
              className="p-6 rounded-2xl border border-border/50 bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </motion.div>
            
            {/* Article content skeleton */}
            {[1, 2, 3].map((section, i) => (
              <motion.div 
                key={section}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                {/* Section heading */}
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-1 h-8 bg-primary/30 rounded-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
                
                {/* Paragraphs */}
                <div className="space-y-3 pl-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-10/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-9/12" />
                </div>
                
                {/* Code block or table skeleton */}
                {i === 1 && (
                  <motion.div 
                    className="my-6 rounded-xl overflow-hidden border border-border/50"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={shimmer.animate}
                  >
                    <div className="px-4 py-2 border-b border-border/30">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </motion.div>
                )}
                
                {/* Image skeleton */}
                {i === 0 && (
                  <motion.div 
                    className="my-6 aspect-[16/10] rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={shimmer.animate}
                  />
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Sidebar skeleton (TOC) - hidden on mobile */}
          <motion.div 
            className="hidden lg:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-24 p-4 rounded-xl border border-border/50 bg-card/50">
              <Skeleton className="h-5 w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton 
                    key={item} 
                    className="h-4" 
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Loading indicator */}
      <motion.div 
        className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border/50 shadow-lg z-50"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-muted-foreground font-medium">
          {language === 'ja' ? '記事を読み込み中...' : 'Loading article...'}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default BlogPostSkeleton;
