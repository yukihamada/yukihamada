import { useState, useMemo, useCallback } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  // Memoize TOC items parsing
  const tocItems = useMemo(() => {
    const items: TocItem[] = [];
    
    // Try parsing HTML headings first (h2, h3 with id attributes)
    const htmlHeadingRegex = /<h([23])[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/gi;
    let htmlMatch;
    
    while ((htmlMatch = htmlHeadingRegex.exec(content)) !== null) {
      const level = parseInt(htmlMatch[1]);
      const id = htmlMatch[2];
      const text = htmlMatch[3].replace(/<[^>]*>/g, '').trim();
      items.push({ id, text, level });
    }
    
    // If no HTML headings found, try markdown format
    if (items.length === 0) {
      const markdownRegex = /^(#{2,3})\s+(.+)$/gm;
      let mdMatch;
      
      while ((mdMatch = markdownRegex.exec(content)) !== null) {
        const level = mdMatch[1].length;
        const text = mdMatch[2].replace(/\*\*/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50);
        
        items.push({ id, text, level });
      }
    }

    return items;
  }, [content]);

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  if (tocItems.length < 2) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground text-sm">
            {language === 'ja' ? '目次' : 'Table of Contents'}
          </span>
          <span className="text-xs text-muted-foreground">
            ({tocItems.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <nav className="mt-3 border-l-2 border-border/50">
          <ul className="space-y-1">
            {tocItems.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                style={{ paddingLeft: `${(item.level - 2) * 12 + 12}px` }}
              >
                <button
                  onClick={() => handleClick(item.id)}
                  className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;
