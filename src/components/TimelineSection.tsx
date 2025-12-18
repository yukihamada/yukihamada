import { useEffect, useRef, useState } from 'react';
import { Building2, Rocket, Home, Briefcase } from 'lucide-react';

const timelineItems = [
  {
    year: '2024〜',
    title: 'イネブラ',
    role: '創業者',
    description: '世界中のクリエイターが活動できるコミュニティスペースを構築。3000カ所、そして宇宙を目指す。',
    icon: Rocket,
    highlight: true,
  },
  {
    year: '2020〜2024',
    title: 'NOT A HOTEL',
    role: 'エンジニア',
    description: '「自宅を持たない暮らし」を実現するNOT A HOTELのプロダクト開発に従事。',
    icon: Home,
    highlight: false,
  },
  {
    year: '2016〜2020',
    title: 'メルカリ',
    role: 'ソフトウェアエンジニア',
    description: 'フリマアプリ「メルカリ」の開発チームでバックエンド・フロントエンド開発を担当。',
    icon: Building2,
    highlight: false,
  },
  {
    year: '〜2016',
    title: 'キャリア初期',
    role: '複数のスタートアップ',
    description: '様々なスタートアップでエンジニアとして経験を積み、プロダクト開発のスキルを磨く。',
    icon: Briefcase,
    highlight: false,
  },
];

const TimelineSection = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            setActiveIndex((prev) => Math.max(prev, index));
          }
        });
      },
      { threshold: 0.5 }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="career" className="section-padding bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
            Career Journey
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            キャリア<span className="gradient-text">タイムライン</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div
            className="absolute left-8 md:left-1/2 top-0 w-px bg-gradient-to-b from-primary to-accent transition-all duration-1000"
            style={{
              height: `${((activeIndex + 1) / timelineItems.length) * 100}%`,
            }}
          />

          {timelineItems.map((item, index) => {
            const Icon = item.icon;
            const isVisible = index <= activeIndex;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={item.title}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`relative flex items-center mb-16 last:mb-0 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div
                  className={`ml-20 md:ml-0 md:w-1/2 ${
                    isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                  } transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`inline-block glass rounded-2xl p-6 card-hover ${
                      item.highlight ? 'border-primary/50' : ''
                    }`}
                  >
                    <span className="text-sm text-primary font-medium">{item.year}</span>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.role}</p>
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div
                  className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isVisible
                      ? item.highlight
                        ? 'gradient-bg glow-primary'
                        : 'bg-card border-2 border-primary'
                      : 'bg-card border border-border'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isVisible ? 'text-primary-foreground' : 'text-muted-foreground'
                    } ${item.highlight && isVisible ? 'text-primary-foreground' : ''}`}
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

export default TimelineSection;
