import { useEffect, useRef, useState } from 'react';
import { Building2, Rocket, Home, Briefcase, ShoppingBag, Plane, Gift, Users } from 'lucide-react';

const timelineItems = [
  {
    year: '2024〜',
    title: 'イネブラ株式会社',
    role: '代表取締役CEO',
    description: '世界中に美しい場所を作り、その場所を共有し合うことを通じて、特別なコミュニティを構築するプロジェクト。',
    icon: Rocket,
    highlight: true,
  },
  {
    year: '2024〜',
    title: '令和トラベル',
    role: '社外取締役・株主',
    description: 'AIを活用したデジタルトラベルエージェンシー「NEWT」を運営。',
    icon: Plane,
    highlight: false,
  },
  {
    year: '現在',
    title: 'ギフトモール',
    role: '社外取締役',
    description: 'プレゼントに特化したオンラインショッピングモール。',
    icon: Gift,
    highlight: false,
  },
  {
    year: '2018〜',
    title: 'NOT A HOTEL',
    role: '共同創業者・元取締役・現株主',
    description: '「自宅を持たない暮らし」を実現する会員制ホテル兼不動産サービス。',
    icon: Home,
    highlight: false,
  },
  {
    year: '〜2023',
    title: 'キャスター',
    role: '元社外取締役',
    description: '日本初のフルリモートワーク企業。2023年に東証グロース市場に上場。',
    icon: Users,
    highlight: false,
  },
  {
    year: '2014〜2021',
    title: 'メルカリ',
    role: '取締役・CPO・CINO',
    description: '日本最大のフリマアプリを運営するグローバル企業。取締役としてプロダクト責任者を務め成長を牽引。',
    icon: ShoppingBag,
    highlight: false,
  },
  {
    year: '2003〜2013',
    title: 'サイブリッジ',
    role: '共同創業者',
    description: '塾講師ナビ、オールクーポンなどのウェブサービスを開発・運営。',
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
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            千葉県立大高校 → 東京理科大学（中退）→ 起業家・経営者として活動
          </p>
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
                key={item.title + item.year}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`relative flex items-center mb-12 last:mb-0 ${
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
                    <h3 className="text-xl font-bold text-foreground mt-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.role}</p>
                    <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
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
                    } ${item.highlight && isVisible ? 'text-primary-foreground' : ''} ${
                      isVisible && !item.highlight ? 'text-primary' : ''
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

export default TimelineSection;
