import { useState } from 'react';
import { Dumbbell, Spade, Guitar, ExternalLink } from 'lucide-react';

const hobbies = [
  {
    name: '柔術',
    icon: Dumbbell,
    description: '2024年から開始。SJJJFの大会に参加中。',
    detail: '来年はマスターズのラスベガス大会への参加を予定。心身を鍛え、集中力を高める格闘技。',
    color: 'from-blue-500 to-cyan-500',
    links: [],
  },
  {
    name: 'ポーカー',
    icon: Spade,
    description: '15年以上の経験。WSOP、EPT、APTで入賞経験あり。',
    detail: '確率と心理戦。ビジネスにも通じる意思決定スキルを磨く。',
    color: 'from-red-500 to-orange-500',
    links: [
      { name: 'Global Poker Index', url: 'https://www.globalpokerindex.com/poker-players/yuki-hamata-1483674/' },
      { name: 'The Hendon Mob', url: 'https://pokerdb.thehendonmob.com/player.php?a=r&n=1137313' },
    ],
  },
  {
    name: 'ギター',
    icon: Guitar,
    description: '主にアコースティックギター。',
    detail: 'メルカリで購入したMartin D-45（2002年製）を愛用。音楽で創造性を表現。',
    color: 'from-purple-500 to-pink-500',
    links: [],
  },
];

const HobbiesSection = () => {
  const [activeHobby, setActiveHobby] = useState<number | null>(null);

  return (
    <section id="hobbies" className="section-padding bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
            Personal Life
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            趣味<span className="gradient-text">& ライフスタイル</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            仕事以外の時間も大切に。心身のバランスを保つための活動。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {hobbies.map((hobby, index) => {
            const Icon = hobby.icon;
            const isActive = activeHobby === index;

            return (
              <div
                key={hobby.name}
                className="group relative"
                onMouseEnter={() => setActiveHobby(index)}
                onMouseLeave={() => setActiveHobby(null)}
              >
                <div
                  className={`glass rounded-3xl p-8 text-center transition-all duration-500 cursor-pointer ${
                    isActive ? 'scale-105' : ''
                  }`}
                  style={{
                    boxShadow: isActive
                      ? '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
                      : undefined,
                  }}
                >
                  {/* Icon container */}
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 bg-gradient-to-br ${hobby.color} ${
                      isActive ? 'scale-110 rotate-3' : ''
                    }`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {hobby.name}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {isActive ? hobby.detail : hobby.description}
                  </p>

                  {/* Links */}
                  {hobby.links.length > 0 && isActive && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {hobby.links.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {link.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Hover indicator */}
                  <div
                    className={`mt-6 h-1 rounded-full bg-gradient-to-r ${hobby.color} transition-all duration-500 ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
