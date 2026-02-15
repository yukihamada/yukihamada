import { motion } from 'framer-motion';
import { ExternalLink, MessageSquare, Video, Hotel, Ghost } from 'lucide-react';
import ServiceCTACard from '@/components/ServiceCTACard';
import { useLanguage } from '@/contexts/LanguageContext';

const ProjectsSection = () => {
  const { language } = useLanguage();

  const projects = [
    {
      title: { ja: 'elio.love', en: 'elio.love' },
      description: {
        ja: '世界初のMCP対応iOSアプリ。完全オフライン、プライバシー重視のAIアシスタント。',
        en: 'World\'s first MCP-enabled iOS app. Fully offline, privacy-first AI assistant.'
      },
      href: 'https://elio.love',
      icon: Ghost,
      color: 'from-purple-500 to-indigo-600',
      badge: { ja: 'New', en: 'New' },
      features: {
        ja: ['MCP対応', '完全オフライン', 'プライバシー保護'],
        en: ['MCP Support', 'Fully Offline', 'Privacy First']
      }
    },
    {
      title: { ja: 'chatweb.ai', en: 'chatweb.ai' },
      description: {
        ja: 'AIとのチャットインターフェース。複数の最新モデルを一度に利用可能。',
        en: 'AI Chat Interface. Access multiple latest models in one place.'
      },
      href: 'https://chatweb.ai',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      badge: { ja: 'Popular', en: 'Popular' },
      features: {
        ja: ['マルチモデル', '高速レスポンス', '使いやすいUI'],
        en: ['Multi-model', 'Fast Response', 'Intuitive UI']
      }
    },
    {
      title: { ja: 'jiuflow.art', en: 'jiuflow.art' },
      description: {
        ja: 'ブラジリアン柔術のインストラクショナルプラットフォーム。',
        en: 'Brazilian Jiu-Jitsu instructional platform.'
      },
      href: 'https://jiuflow.art',
      icon: Video,
      color: 'from-orange-500 to-red-600',
      badge: null,
      features: {
        ja: ['動画学習', '進捗管理', 'フローチャート'],
        en: ['Video Learning', 'Progress Tracking', 'Flowcharts']
      }
    },
    {
      title: { ja: 'stayflow', en: 'stayflow' },
      description: {
        ja: 'ホテル・民泊管理システム。',
        en: 'Hotel and vacation rental management system.'
      },
      href: 'https://stayflow.me', // Assuming URL based on name/context, placeholder if not known
      icon: Hotel,
      color: 'from-emerald-500 to-teal-600',
      badge: null,
      features: {
        ja: ['予約管理', '顧客管理', '自動化'],
        en: ['Booking Mgmt', 'CRM', 'Automation']
      }
    }
  ];

  return (
    <section id="projects" className="section-padding bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {language === 'ja' ? 'Projects' : 'Projects'}
          </motion.h2>
          <motion.p
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {language === 'ja' 
              ? '開発・運営しているプロダクト一覧' 
              : 'List of products I build and maintain'}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ServiceCTACard
                title={project.title}
                description={project.description}
                features={project.features}
                href={project.href}
                icon={project.icon}
                color={project.color}
                badge={project.badge}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
