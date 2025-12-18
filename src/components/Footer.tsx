import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/yukihamada' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/yukihamada' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yukihamada' },
  { name: 'Email', icon: Mail, href: 'mailto:yuki@yukihamada.jp' },
];

const quickLinks = [
  { name: 'イネブラ', href: '#enabler' },
  { name: 'キャリア', href: '#career' },
  { name: '投資先', href: '#investments' },
  { name: 'ブログ', href: '#blog' },
  { name: '趣味', href: '#hobbies' },
];

const Footer = () => {
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
              className="text-2xl font-bold mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-foreground">濱田</span>{' '}
              <span className="gradient-text">優貴</span>
            </motion.h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              株式会社イネブラ 代表取締役CEO。人生を「本質」だけで満たすEnablerとして、
              ライフスタイル・フィンテック・エデュテックの3つの事業を展開しています。
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
            <h4 className="font-semibold text-foreground mb-4">クイックリンク</h4>
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
            <h4 className="font-semibold text-foreground mb-4">お問い合わせ</h4>
            <p className="text-muted-foreground mb-4">
              プロジェクトの相談や投資のお問い合わせはお気軽にどうぞ。
            </p>
            <MagneticButton>
              <Button
                className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
                asChild
              >
                <a href="mailto:yuki@yukihamada.jp">
                  <Mail className="mr-2 h-4 w-4" />
                  連絡する
                </a>
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
