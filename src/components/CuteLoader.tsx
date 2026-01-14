import { useLanguage } from '@/contexts/LanguageContext';

const loadingMessages = {
  ja: [
    "コーヒー淹れてます ☕",
    "ビションフリーゼと遊んでます 🐕",
    "柔術の技を研究中 🥋",
    "AIと会話中... 🤖",
    "データをこねこね中 ✨",
    "宇宙の真理を探索中 🌌",
    "クリエイティブモード発動！ 🎨",
  ],
  en: [
    "Brewing coffee ☕",
    "Playing with Bichon Frise 🐕",
    "Studying BJJ techniques 🥋",
    "Chatting with AI... 🤖",
    "Kneading data ✨",
    "Exploring cosmic truths 🌌",
    "Creative mode activated! 🎨",
  ]
};

const CuteLoader = () => {
  const { language } = useLanguage();
  const messages = loadingMessages[language === 'ja' ? 'ja' : 'en'];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      {/* Cute animated character */}
      <div className="relative">
        {/* Bouncing circles - like a cute loading animation */}
        <div className="flex items-end gap-2">
          <div 
            className="w-4 h-4 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <div 
            className="w-6 h-6 rounded-full bg-primary/80 animate-bounce"
            style={{ animationDelay: '100ms', animationDuration: '600ms' }}
          />
          <div 
            className="w-8 h-8 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '600ms' }}
          />
          <div 
            className="w-6 h-6 rounded-full bg-primary/80 animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
          <div 
            className="w-4 h-4 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: '400ms', animationDuration: '600ms' }}
          />
        </div>
        
        {/* Cute face overlay */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-pulse">
            {/* Eyes */}
            <div className="absolute top-6 left-4 w-2 h-3 bg-foreground rounded-full animate-blink" />
            <div className="absolute top-6 right-4 w-2 h-3 bg-foreground rounded-full animate-blink" />
            {/* Blush */}
            <div className="absolute top-9 left-2 w-3 h-2 rounded-full bg-pink-300/50" />
            <div className="absolute top-9 right-2 w-3 h-2 rounded-full bg-pink-300/50" />
            {/* Mouth */}
            <div className="absolute bottom-5 w-4 h-2 border-b-2 border-foreground/70 rounded-b-full" />
          </div>
        </div>
      </div>

      {/* Loading message */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <p className="text-lg font-medium text-foreground animate-fade-in">
          {randomMessage}
        </p>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Floating particles for extra cuteness */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30 animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CuteLoader;
