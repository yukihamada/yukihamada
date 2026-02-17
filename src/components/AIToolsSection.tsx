import { motion } from 'framer-motion';
import { Bot, Sparkles, Smartphone } from 'lucide-react';
import ServiceCTACard from '@/components/ServiceCTACard';
import { useLanguage } from '@/contexts/LanguageContext';

const AIToolsSection = () => {
  const { t, language } = useLanguage();

  return (
    <section id="ai-tools" className="section-padding bg-background relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.6
          }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      ))}

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="text-primary text-sm font-medium tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t.cta.aiToolsSection.subtitle}
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {language === 'ja' ? 'AI' : 'AI'}<span className="gradient-text">{t.cta.aiToolsSection.title}</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t.cta.aiToolsSection.description}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ServiceCTACard
            title={{ ja: t.cta.chatweb.title, en: t.cta.chatweb.title }}
            description={{ ja: t.cta.chatweb.description, en: t.cta.chatweb.description }}
            features={{ ja: t.cta.chatweb.features, en: t.cta.chatweb.features }}
            href="https://chatweb.ai"
            logoSrc="/images/chatweb-icon.svg"
            color="from-blue-500 to-cyan-600"
            badge={{ ja: t.cta.chatweb.badge, en: t.cta.chatweb.badge }}
          />

          <ServiceCTACard
            title={{ ja: t.cta.elio.title, en: t.cta.elio.title }}
            description={{ ja: t.cta.elio.description, en: t.cta.elio.description }}
            features={{ ja: t.cta.elio.features, en: t.cta.elio.features }}
            href="https://elio.love"
            logoSrc="/images/elio-app-icon.png"
            color="from-purple-500 to-pink-600"
            badge={{ ja: t.cta.elio.badge, en: t.cta.elio.badge }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AIToolsSection;
