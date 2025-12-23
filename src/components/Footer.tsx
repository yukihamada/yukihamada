import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, MessageCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';

const socialLinks = [
  { name: 'X', icon: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ), href: 'https://x.com/yukihamada' },
  { name: 'Facebook', icon: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ), href: 'https://facebook.com/yukihamada' },
  { name: 'Instagram', icon: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ), href: 'https://instagram.com/yukihamada' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/yukihamada' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yukihamada' },
  { name: 'Email', icon: Mail, href: 'mailto:mail@yukihamada.jp' },
];

const Footer = () => {
  const { t, language } = useLanguage();
  const { openChat } = useChat();
  const { isAuthenticated, isAdmin } = useAuth();

  const quickLinks = [
    { name: t.nav.enabler, href: '#enabler' },
    { name: t.nav.career, href: '#career' },
    { name: t.nav.investments, href: '#investments' },
    { name: t.nav.blog, href: '/blog', isRoute: true },
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
                  {'isRoute' in link && link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      <motion.span whileHover={{ x: 5 }} className="inline-block">
                        {link.name}
                      </motion.span>
                    </Link>
                  ) : (
                    <motion.a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  )}
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
            {isAdmin && (
              <motion.div
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  {language === 'ja' ? '管理画面' : 'Admin'}
                </Link>
              </motion.div>
            )}
            {isAuthenticated && (
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
            )}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
