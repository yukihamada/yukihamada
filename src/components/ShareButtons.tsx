import { useState } from 'react';
import { Check, Link2, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  const shortenUrl = async (longUrl: string): Promise<string> => {
    try {
      const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
      const data = await response.json();
      if (data.shorturl) {
        return data.shorturl;
      }
      return longUrl;
    } catch {
      return longUrl;
    }
  };

  const handleCopyLink = async () => {
    try {
      setIsShortening(true);
      const shortUrl = await shortenUrl(url);
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('短縮リンクをコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('コピーに失敗しました');
    } finally {
      setIsShortening(false);
    }
  };

  const primaryLinks = [
    {
      name: 'X',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'はてブ',
      url: `https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.47 0H3.53A3.53 3.53 0 0 0 0 3.53v16.94A3.53 3.53 0 0 0 3.53 24h16.94A3.53 3.53 0 0 0 24 20.47V3.53A3.53 3.53 0 0 0 20.47 0zm-3.705 18.08c0 1.2-.98 2.17-2.185 2.17H5.19V3.75h8.885c1.2 0 2.185.97 2.185 2.17 0 .9-.54 1.67-1.31 2.01.96.34 1.65 1.26 1.65 2.35 0 1.2-.98 2.17-2.185 2.17h-5.68v3.46h5.68c1.205 0 2.185.97 2.185 2.17zm-7.075-8.39h4.035c.65 0 1.17-.53 1.17-1.17 0-.65-.52-1.17-1.17-1.17H9.69v2.34zm4.035 2.42H9.69v2.34h4.035c.65 0 1.17-.52 1.17-1.17 0-.64-.52-1.17-1.17-1.17z"/>
        </svg>
      ),
    },
    {
      name: 'LINE',
      url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ];

  const moreLinks = [
    {
      name: 'Bluesky',
      url: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 600 530" fill="currentColor">
          <path d="M135.72 44.03C202.216 93.951 273.74 195.401 300 249.49c26.262-54.089 97.782-155.539 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.017-2.936-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.256 82.697-152.22-67.108 11.421-142.55-7.449-163.25-81.433C20.15 217.615 10 86.537 10 68.825c0-88.687 77.742-60.816 125.72-24.795z" />
        </svg>
      ),
    },
    {
      name: 'Threads',
      url: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.132-1.13 3.628-1.154 1.075-.017 2.073.078 2.991.283-.034-.78-.177-1.396-.426-1.846-.357-.642-.983-.976-1.86-1.007-1.018-.035-1.86.272-2.274.56l-.428.323-1.19-1.727.373-.291c.727-.566 1.966-.963 3.494-.912 1.463.053 2.628.56 3.37 1.466.66.805 1.012 1.905 1.044 3.268.016.737-.012 1.388-.085 1.954a8.925 8.925 0 0 1 1.562.93c.964.69 1.681 1.57 2.132 2.602.775 1.78.772 4.58-1.533 6.838-1.913 1.874-4.334 2.753-7.621 2.772Zm-.35-9.088c-1.726.027-2.79.627-2.754 1.54.023.564.525 1.2 1.603 1.2.043 0 .087-.001.131-.004.972-.052 1.69-.428 2.134-1.118.343-.533.552-1.217.622-2.03a9.832 9.832 0 0 0-1.736.412Z" />
        </svg>
      ),
    },
    {
      name: 'Mastodon',
      url: `https://toot.kytta.dev/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.43 7.35c-.33-2.43-2.44-4.35-5.07-4.65C15.28 2.56 13.7 2.5 12 2.5s-3.28.06-4.36.2c-2.63.3-4.74 2.22-5.07 4.65-.12.9-.18 1.92-.18 3.03 0 3.57 1.26 6.37 3.94 7.32 1.12.4 2.07.48 2.83.33.83-.17 1.43-.55 1.78-1.03l.38-.55h.1c.02.19.05.39.1.6.2.86.7 1.53 1.55 1.98.8.42 1.86.55 3.07.4 1.94-.25 3.32-1.03 4.1-2.4.64-1.12.84-2.64.84-4.67 0-1.11-.06-2.13-.18-3.03Zm-4.24 6.77h-1.8v-4.4c0-.93-.39-1.4-1.17-1.4-.86 0-1.29.56-1.29 1.67v2.41h-1.78V9.99c0-1.11-.43-1.67-1.29-1.67-.78 0-1.17.47-1.17 1.4v4.4H6.9V9.6c0-.93.24-1.67.72-2.22.5-.56 1.15-.85 1.95-.85.93 0 1.63.36 2.1 1.08l.33.56.33-.56c.47-.72 1.17-1.08 2.1-1.08.8 0 1.45.29 1.95.85.48.55.72 1.29.72 2.22v4.52Z" />
        </svg>
      ),
    },
    {
      name: 'Misskey',
      url: `https://misskey-hub.net/share/?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8h-6V7h6v2z" />
        </svg>
      ),
    },
    {
      name: 'Friendica',
      url: `https://friendica.me/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <span className="text-sm text-muted-foreground hidden sm:block">シェア:</span>
      {primaryLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5"
          aria-label={`${link.name}でシェア`}
        >
          {link.icon}
        </a>
      ))}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground"
            aria-label="その他の共有オプション"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border border-border z-50">
          {moreLinks.map((link) => (
            <DropdownMenuItem key={link.name} asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={handleCopyLink}
        disabled={isShortening}
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground disabled:opacity-50"
        aria-label="リンクをコピー"
      >
        {isShortening ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>
    </div>
  );
};

export default ShareButtons;
