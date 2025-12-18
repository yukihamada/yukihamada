import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface Translations {
  nav: {
    enabler: string;
    career: string;
    investments: string;
    blog: string;
    hobbies: string;
  };
  hero: {
    headline: string;
    subheadline: string;
  };
  enabler: {
    mainTitle: string;
    mainSubtitle: string;
    philosophy: string;
    philosophyDesc: string;
    earnFast: string;
    earnFastDesc: string;
    resetDeep: string;
    resetDeepDesc: string;
    growStrong: string;
    growStrongDesc: string;
    servicesTitle: string;
    servicesDesc: string;
    visionTitle: string;
    visionDesc: string;
    otherProjects: string;
    viewService: string;
  };
  services: {
    enablerFun: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
    banto: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
    jiuflow: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
  };
  footer: {
    description: string;
    quickLinks: string;
    contact: string;
    contactDesc: string;
    contactBtn: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      enabler: 'Enabler',
      career: 'Career',
      investments: 'Investments',
      blog: 'Blog',
      hobbies: 'Hobbies',
    },
    hero: {
      headline: 'Cut the noise. Sprint to passion.',
      subheadline: 'Let technology handle life\'s chores. Three infrastructures to put you back as the protagonist of your life.',
    },
    enabler: {
      mainTitle: 'Cut the noise.',
      mainSubtitle: 'Sprint to passion.',
      philosophy: 'Life is short. No detours.',
      philosophyDesc: 'Financial anxiety, urban claustrophobia, self-taught stagnation. We eliminate the friction (noise) that erodes your potential to zero.',
      earnFast: 'Earn Fast',
      earnFastDesc: 'Get paid instantly for your work. Construction fintech protecting craftsmen\'s tomorrow.',
      resetDeep: 'Reset Deep',
      resetDeepDesc: 'Refresh your senses in an instant. Premium vacation rentals that liberate your mind.',
      growStrong: 'Grow Strong',
      growStrongDesc: 'Install lifelong strength at maximum speed. Jiu-jitsu edutech delivering world-class wisdom.',
      servicesTitle: 'Three Business Domains',
      servicesDesc: 'We provide services that enrich people\'s lives across lifestyle, fintech, and edutech sectors.',
      visionTitle: 'More freedom. More authenticity.',
      visionDesc: 'Enabler is the stage apparatus that fills your life with only what\'s essential.',
      otherProjects: 'Other Projects',
      viewService: 'View Service',
    },
    services: {
      enablerFun: {
        title: 'enabler.fun',
        subtitle: 'Luxury Vacation Rentals',
        description: 'Creating spaces that inspire your senses in locations that move your heart.',
        features: ['Popular domestic areas like Atami & Kamakura', 'Completely private spaces', 'Airbnb integration'],
      },
      banto: {
        title: 'banto.work',
        subtitle: 'Invoice & Instant Payment App for Construction',
        description: 'The moment the job is done, money arrives tomorrow. An instant payment app for craftsmen.',
        features: ['Payment in 60 min to next day', 'Fees from 3%', 'Voice input supported'],
      },
      jiuflow: {
        title: 'jiuflow.art',
        subtitle: 'Brazilian Jiu-Jitsu Online Learning',
        description: '"Safe, long-lasting, and strong" — lifelong jiu-jitsu for you.',
        features: ['Supervised by World Champions', '4K filming from above', 'Systematic curriculum'],
      },
    },
    footer: {
      description: 'CEO of Enabler Inc. As an Enabler filling life with only what\'s essential, operating three businesses in lifestyle, fintech, and edutech.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      contactDesc: 'Feel free to reach out for project consultations or investment inquiries.',
      contactBtn: 'Get in Touch',
    },
  },
  ja: {
    nav: {
      enabler: 'イネブラ',
      career: 'キャリア',
      investments: '投資先',
      blog: 'ブログ',
      hobbies: '趣味',
    },
    hero: {
      headline: 'ノイズを消せ。最短距離で、熱狂せよ。',
      subheadline: '生きるための「雑務」は、テクノロジーに任せればいい。あなたが人生の主役に戻るための、3つのインフラストラクチャー。',
    },
    enabler: {
      mainTitle: 'ノイズを消せ。',
      mainSubtitle: '最短距離で、熱狂せよ。',
      philosophy: '人生は短い。だから、遠回りはさせない。',
      philosophyDesc: 'お金の不安、都市の閉塞感、自己流の停滞。あなたのポテンシャルを蝕む「摩擦（ノイズ）」を、私たちが極限までゼロにする。',
      earnFast: 'Earn Fast',
      earnFastDesc: '働いた対価は、即座に手元へ。職人の明日を守る、建設フィンテック。',
      resetDeep: 'Reset Deep',
      resetDeepDesc: '枯れた感性を、一瞬で潤す。心を解放する、極上のバケーションレンタル。',
      growStrong: 'Grow Strong',
      growStrongDesc: '一生モノの強さを、最速でインストールする。世界基準の知恵を届ける、柔術エデュテック。',
      servicesTitle: '3つの事業領域',
      servicesDesc: 'ライフスタイル・フィンテック・エデュテックの各領域で、人々の生活を豊かにするサービスを提供しています。',
      visionTitle: 'もっと自由に、もっと素直に。',
      visionDesc: 'イネブラは、あなたの人生を「本質」だけで満たすための舞台装置（Enabler）です。',
      otherProjects: 'その他のプロジェクト',
      viewService: 'サービスを見る',
    },
    services: {
      enablerFun: {
        title: 'enabler.fun',
        subtitle: '高級バケーションレンタル',
        description: '心が動かされるロケーションに、感性を刺激する空間を創ります。',
        features: ['熱海・鎌倉など国内人気エリア', '完全プライベート空間', 'Airbnb連携'],
      },
      banto: {
        title: 'banto.work',
        subtitle: '建設業向け請求書・即払いアプリ',
        description: '現場が終わった瞬間、明日には金が入る。職人のための即払いアプリ。',
        features: ['最短60分〜翌日入金', '手数料3%〜', '音声入力対応'],
      },
      jiuflow: {
        title: 'jiuflow.art',
        subtitle: 'ブラジリアン柔術オンライン学習',
        description: '「安全で、長く、そして強い」一生モノの柔術を、あなたに。',
        features: ['世界チャンピオン監修', '上面からの4K撮影', '体系的なカリキュラム'],
      },
    },
    footer: {
      description: '株式会社イネブラ 代表取締役CEO。人生を「本質」だけで満たすEnablerとして、ライフスタイル・フィンテック・エデュテックの3つの事業を展開しています。',
      quickLinks: 'クイックリンク',
      contact: 'お問い合わせ',
      contactDesc: 'プロジェクトの相談や投資のお問い合わせはお気軽にどうぞ。',
      contactBtn: '連絡する',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ja');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
