import { useState } from 'react';
import { Dumbbell, Spade, Guitar } from 'lucide-react';

const hobbies = [
  {
    name: '柔術',
    icon: Dumbbell,
    description: '心身を鍛え、集中力を高める格闘技。定期的にトレーニング中。',
    detail: 'ブラジリアン柔術を通じて、技術と戦略の両方を学んでいます。',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'ポーカー',
    icon: Spade,
    description: '確率と心理戦。ビジネスにも通じる意思決定スキルを磨く。',
    detail: 'テキサスホールデムを中心に、戦略的思考を楽しんでいます。',
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'ギター',
    icon: Guitar,
    description: '音楽で創造性を表現。リラックスとインスピレーションの源。',
    detail: 'アコースティックからエレキまで。弾き語りも好きです。',
    color: 'from-purple-500 to-pink-500',
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

                  <p className="text-muted-foreground leading-relaxed">
                    {isActive ? hobby.detail : hobby.description}
                  </p>

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
