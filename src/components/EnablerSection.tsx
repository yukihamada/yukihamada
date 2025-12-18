import { Globe, Users, Rocket, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
              <span className="gradient-text">株式会社イネブラ</span>
              <br />
              <span className="text-foreground text-2xl md:text-3xl">代表取締役CEO</span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              人生を「本質」だけで満たすための<span className="text-primary font-semibold">Enabler</span>として、
              ライフスタイル・フィンテック・エデュテックの3つの事業を展開。
            </p>

            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                ビジョン
              </h3>
              <p>
                世界中に<span className="text-primary font-semibold">3000カ所</span>、
                そして<span className="text-primary font-semibold">宇宙にまで</span>拡がる宿泊施設と楽しめる拠点を創造すること。
              </p>
            </div>

            <div className="space-y-3 text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground">ミッション</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  コミュニティを軸とした、新しい形の宿泊体験の提供
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  テクノロジーと人間性の融合による、未来志向の生活空間の創造
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  地球上の多様な文化と自然を結びつける、グローバルネットワークの構築
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  宇宙旅行や宇宙居住の実現に向けた、先駆的な取り組みの推進
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                asChild
              >
                <a href="https://www.patreon.com/paradisecreator/" target="_blank" rel="noopener noreferrer">
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
                <a href="https://enablerhq.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-5 w-5" />
                  enablerhq.com
                </a>
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative glass rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-foreground">
                その他のプロジェクト
              </h3>
              <div className="space-y-4">
                <a
                  href="https://retty.me/area/PRE13/ARE14/SUB1402/100001732246/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all hover-lift"
                >
                  <p className="font-semibold text-foreground">焼肉古今</p>
                  <p className="text-sm text-muted-foreground">オーナー</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2024年2月オープン。西麻布の高級焼肉店。全席完全個室。
                  </p>
                </a>
                <a
                  href="https://notahotel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all hover-lift"
                >
                  <p className="font-semibold text-foreground">NOT A HOTEL</p>
                  <p className="text-sm text-muted-foreground">共同創業者・元取締役・現株主</p>
                </a>
                <a
                  href="https://newt.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all hover-lift"
                >
                  <p className="font-semibold text-foreground">令和トラベル（NEWT）</p>
                  <p className="text-sm text-muted-foreground">社外取締役・株主</p>
                </a>
                <a
                  href="https://giftmall.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all hover-lift"
                >
                  <p className="font-semibold text-foreground">ギフトモール</p>
                  <p className="text-sm text-muted-foreground">元社外取締役</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnablerSection;
