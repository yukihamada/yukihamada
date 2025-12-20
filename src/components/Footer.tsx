import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/yukihamada' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/yukihamada' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yukihamada' },
  { name: 'Email', icon: Mail, href: 'mailto:yuki@yukihamada.jp' },
];

const Footer = () => {
  const { t } = useLanguage();
  const { openChat } = useChat();

  const quickLinks = [
    { name: t.nav.enabler, href: '#enabler' },
    { name: t.nav.career, href: '#career' },
    { name: t.nav.investments, href: '#investments' },
    { name: t.nav.blog, href: '#blog' },
    { name: t.nav.hobbies, href: '#hobbies' },
  ];

  return (
    <motion.footer 
      className="bg-card border-t border-border relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Gradient accent */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <motion.h3 
              className="text-2xl font-bold mb-1"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-foreground">Yuki</span>{' '}
              <span className="gradient-text">Hamada</span>
            </motion.h3>
            <p className="text-xs text-muted-foreground mb-4">濱田優貴</p>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t.footer.description}
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <MagneticButton key={link.name}>
                    <motion.a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                      aria-label={link.name}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  </MagneticButton>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-foreground mb-4">{t.footer.contact}</h4>
            <p className="text-muted-foreground mb-4">
              {t.footer.contactDesc}
            </p>
            <MagneticButton>
              <Button
                className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                onClick={openChat}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t.footer.contactBtn}
              </Button>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div 
          className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Yuki Hamada. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <motion.a
              href="https://enablerhq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              enablerhq.com
              <ExternalLink className="h-3 w-3" />
            </motion.a>
            <motion.a
              href="https://www.patreon.com/paradisecreator/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Patreon
              <ExternalLink className="h-3 w-3" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
