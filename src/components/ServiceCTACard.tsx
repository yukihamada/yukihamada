import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceCTACardProps {
  title: {
    ja: string;
    en: string;
  };
  description: {
    ja: string;
    en: string;
  };
  features: {
    ja: string[];
    en: string[];
  };
  href: string;
  icon: LucideIcon;
  color: string;
  badge?: {
    ja: string;
    en: string;
  };
}

const ServiceCTACard = ({
  title,
  description,
  features,
  href,
  icon: Icon,
  color,
  badge,
}: ServiceCTACardProps) => {
  const { language } = useLanguage();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-premium rounded-2xl p-6 block hover:border-primary/50 transition-all hover-3d"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {badge && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            {badge[language]}
          </span>
        </div>
      )}

      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="h-7 w-7 text-white" />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title[language]}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {description[language]}
      </p>

      <ul className="space-y-2 mb-6">
        {features[language].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
        {language === 'ja' ? '詳しく見る' : 'Learn More'}
        <ArrowRight className="h-4 w-4" />
      </div>
    </motion.a>
  );
};

export default ServiceCTACard;
