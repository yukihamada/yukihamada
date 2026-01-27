import { motion } from 'framer-motion';
import { Sparkles, SparkleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/contexts/ReducedMotionContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ReducedMotionToggle = () => {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleReducedMotion}
          className="relative w-9 h-9 rounded-full"
          aria-label={reducedMotion ? 'アニメーションを有効にする' : 'アニメーションを減らす'}
        >
          <motion.div
            initial={false}
            animate={{ 
              scale: reducedMotion ? 0.9 : 1,
              opacity: reducedMotion ? 0.6 : 1 
            }}
            transition={{ duration: 0.2 }}
          >
            {reducedMotion ? (
              <SparkleIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </motion.div>
          
          {/* Status indicator */}
          <span 
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background ${
              reducedMotion ? 'bg-muted-foreground' : 'bg-primary'
            }`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {reducedMotion ? 'アニメーション: OFF' : 'アニメーション: ON'}
      </TooltipContent>
    </Tooltip>
  );
};

export default ReducedMotionToggle;
