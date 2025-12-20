import { useLocation, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RotateCcw, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Snake Game Component
const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_high_score');
    return saved ? parseInt(saved) : 0;
  });
  
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
  });

  const GRID_SIZE = 20;
  const CELL_SIZE = 15;

  const resetGame = useCallback(() => {
    gameRef.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
    };
    setScore(0);
    setGameState('playing');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;
    
    const { direction } = gameRef.current;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y !== 1) gameRef.current.nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y !== -1) gameRef.current.nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x !== 1) gameRef.current.nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x !== -1) gameRef.current.nextDirection = { x: 1, y: 0 };
        break;
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const { snake, food, nextDirection } = gameRef.current;
      
      // Update direction
      gameRef.current.direction = nextDirection;
      
      // Calculate new head position
      const newHead = {
        x: (snake[0].x + nextDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (snake[0].y + nextDirection.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snake_high_score', score.toString());
        }
        return;
      }

      // Add new head
      const newSnake = [newHead, ...snake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        // Generate new food
        let newFood;
        do {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
        } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        gameRef.current.food = newFood;
      } else {
        newSnake.pop();
      }

      gameRef.current.snake = newSnake;

      // Draw
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'hsl(var(--border) / 0.3)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw snake
      newSnake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          0,
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE
        );
        
        if (index === 0) {
          gradient.addColorStop(0, 'hsl(var(--primary))');
          gradient.addColorStop(1, 'hsl(var(--primary) / 0.7)');
        } else {
          const opacity = 1 - (index / newSnake.length) * 0.5;
          gradient.addColorStop(0, `hsl(var(--primary) / ${opacity})`);
          gradient.addColorStop(1, `hsl(var(--primary) / ${opacity * 0.7})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          3
        );
        ctx.fill();
      });

      // Draw food
      const foodGradient = ctx.createRadialGradient(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE
      );
      foodGradient.addColorStop(0, 'hsl(0 80% 60%)');
      foodGradient.addColorStop(1, 'hsl(0 80% 40%)');
      
      ctx.fillStyle = foodGradient;
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameState, score, highScore]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm font-medium">
        <span className="text-muted-foreground">Score: <span className="text-primary">{score}</span></span>
        <span className="text-muted-foreground">Best: <span className="text-primary">{highScore}</span></span>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-border rounded-lg bg-background shadow-lg"
        />
        
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg"
            >
              <Gamepad2 className="w-12 h-12 text-primary mb-4" />
              <p className="text-muted-foreground text-sm mb-4">Use arrow keys or WASD to play</p>
              <Button onClick={resetGame} variant="default" size="sm">
                Start Game
              </Button>
            </motion.div>
          )}
          
          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <p className="text-2xl font-bold text-primary mb-2">Game Over!</p>
              </motion.div>
              <p className="text-muted-foreground mb-4">Score: {score}</p>
              {score === highScore && score > 0 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-primary font-medium mb-4"
                >
                  🎉 New High Score!
                </motion.p>
              )}
              <Button onClick={resetGame} variant="default" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => {
            if (gameState === 'playing' && gameRef.current.direction.y !== 1) {
              gameRef.current.nextDirection = { x: 0, y: -1 };
            }
          }}
        >
          ↑
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => {
            if (gameState === 'playing' && gameRef.current.direction.x !== 1) {
              gameRef.current.nextDirection = { x: -1, y: 0 };
            }
          }}
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => {
            if (gameState === 'playing' && gameRef.current.direction.y !== -1) {
              gameRef.current.nextDirection = { x: 0, y: 1 };
            }
          }}
        >
          ↓
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => {
            if (gameState === 'playing' && gameRef.current.direction.x !== -1) {
              gameRef.current.nextDirection = { x: 1, y: 0 };
            }
          }}
        >
          →
        </Button>
      </div>
    </div>
  );
};

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  const texts = {
    en: {
      title: "404",
      subtitle: "Oops! This page got lost in the void",
      description: "But hey, since you're here... why not play a game?",
      home: "Back to Home",
    },
    ja: {
      title: "404",
      subtitle: "おっと！このページは迷子になりました",
      description: "せっかくなので、ゲームでも遊んでいきませんか？",
      home: "ホームに戻る",
    },
  };

  const t = texts[language];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10"
      >
        {/* Glitchy 404 title */}
        <motion.h1
          className="text-[8rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/70 to-primary relative"
          style={{ 
            textShadow: '0 0 40px hsl(var(--primary) / 0.3)',
            WebkitTextStroke: '2px hsl(var(--primary) / 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 40px hsl(var(--primary) / 0.3)',
              '0 0 60px hsl(var(--primary) / 0.5)',
              '0 0 40px hsl(var(--primary) / 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-foreground font-medium mb-2"
        >
          {t.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          {t.description}
        </motion.p>
      </motion.div>

      {/* Game */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="z-10 mb-8"
      >
        <SnakeGame />
      </motion.div>

      {/* Home button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link to="/">
          <Button variant="outline" size="lg" className="gap-2 group">
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t.home}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
