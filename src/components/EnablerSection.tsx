import { Globe, Users, Rocket, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const locations = [
  { name: '東京', country: '日本', active: true },
  { name: 'サンフランシスコ', country: 'アメリカ', active: true },
  { name: 'バンコク', country: 'タイ', active: true },
  { name: 'リスボン', country: 'ポルトガル', active: false },
  { name: 'ベルリン', country: 'ドイツ', active: false },
  { name: 'シンガポール', country: 'シンガポール', active: false },
];

const EnablerSection = () => {
  return (
    <section id="enabler" className="section-padding bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Rocket className="h-4 w-4" />
              現在のメインプロジェクト
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="gradient-text">イネブラ</span>
              <br />
              <span className="text-foreground">Enabler</span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              クリエイターが世界中どこでも活動できる環境を提供。
              <span className="text-primary font-semibold">3000カ所</span>の拠点を目指し、
              いつか<span className="text-primary font-semibold">宇宙にまで</span>。
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold gradient-text">3+</p>
                <p className="text-sm text-muted-foreground">稼働拠点</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold gradient-text">100+</p>
                <p className="text-sm text-muted-foreground">メンバー</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold gradient-text">3000</p>
                <p className="text-sm text-muted-foreground">目標拠点数</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                asChild
              >
                <a href="https://www.patreon.com/yukihamada" target="_blank" rel="noopener noreferrer">
                  <Users className="mr-2 h-5 w-5" />
                  Patreonで参加
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
                asChild
              >
                <a href="https://enabler.fun" target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-5 w-5" />
                  Enabler.fun
                </a>
              </Button>
            </div>
          </div>

          {/* Locations Grid */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative glass rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                グローバル拠点
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {locations.map((location) => (
                  <div
                    key={location.name}
                    className={`p-4 rounded-xl border transition-all duration-300 hover-lift ${
                      location.active
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card border-border opacity-60'
                    }`}
                  >
                    <p className="font-semibold text-foreground">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.country}</p>
                    {location.active && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        稼働中
                      </span>
                    )}
                    {!location.active && (
                      <span className="text-xs text-muted-foreground mt-2 block">
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnablerSection;
