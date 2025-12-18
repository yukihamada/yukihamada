import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-foreground">Yuki</span>{' '}
              <span className="gradient-text">Hamada</span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              世界中のクリエイターを支援し、新しい価値を生み出すコミュニティを構築しています。
              イネブラを通じて、どこでも活動できる環境を提供。
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                    aria-label={link.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">クイックリンク</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">お問い合わせ</h4>
            <p className="text-muted-foreground mb-4">
              プロジェクトの相談や投資のお問い合わせはお気軽にどうぞ。
            </p>
            <Button
              className="gradient-bg text-primary-foreground hover:opacity-90 glow-primary"
              asChild
            >
              <a href="mailto:yuki@yukihamada.jp">
                <Mail className="mr-2 h-4 w-4" />
                連絡する
              </a>
            </Button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Yuki Hamada. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://enabler.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
            >
              Enabler.fun
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.patreon.com/yukihamada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
            >
              Patreon
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
