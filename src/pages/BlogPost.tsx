import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, Tag, RefreshCw, Twitter, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import BlogViewStats from '@/components/BlogViewStats';
import SEO from '@/components/SEO';
import ShareButtons from '@/components/ShareButtons';
import { BlogComments } from '@/components/BlogComments';
import BlogSuggestedQuestions from '@/components/BlogSuggestedQuestions';
import BlogSummary from '@/components/BlogSummary';
import OptimizedImage from '@/components/OptimizedImage';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';
import ShareCounts from '@/components/ShareCounts';
import TableOfContents from '@/components/TableOfContents';
import BlogPostSkeleton from '@/components/BlogPostSkeleton';
import { useAuth } from '@/hooks/useAuth';
import jiuflowHero from '@/assets/jiuflow-hero.png';
import jiuflowLesson from '@/assets/jiuflow-lesson.png';
import yukiProfile from '@/assets/yuki-profile.jpg';
import ElioSignupForm from '@/components/ElioSignupForm';
import { AnimatePresence } from 'framer-motion';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme support
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#3b82f6',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    background: '#0f172a',
    mainBkg: '#1e293b',
    nodeBorder: '#3b82f6',
    clusterBkg: '#1e293b',
    titleColor: '#f8fafc',
    edgeLabelBackground: '#1e293b',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
  securityLevel: 'loose',
});

const blogImages: Record<string, string> = {
  'jiuflow-hero': jiuflowHero,
  'jiuflow-lesson': jiuflowLesson,
  'cost-collapse-timeline': '/images/blog-cost-collapse-timeline.jpg',
  'bjj-medal': '/images/blog-bjj-medal.jpg',
  'bjj-match': '/images/blog-bjj-match.jpg',
  'bjj-group1': '/images/blog-bjj-group1.jpg',
  'bjj-victory': '/images/blog-bjj-victory.jpg',
  'sinic-diagram': '/images/sinic-theory-diagram.svg',
  'ai-jobs-transition': '/images/blog-ai-jobs-transition.jpg',
  'ai-jobs-bjj': '/images/blog-ai-jobs-bjj.jpg',
  'ai-jobs-crossroads': '/images/blog-ai-jobs-crossroads.jpg',
  'newt-chat-dm1': '/images/blog-newt-chat-dm1.png',
  'newt-chat-dm2': '/images/blog-newt-chat-dm2.png',
  'newt-chat-yuki': '/images/blog-newt-chat-yuki.png',
  'newt-chat-newt': '/images/blog-newt-chat-newt.png',
  'newt-chat-logo': '/images/newt-chat-logo.png',
};

const trackMapping: Record<string, { titleJa: string; titleEn: string; artwork: string }> = {
  'free-to-change': { titleJa: 'Free to Change', titleEn: 'Free to Change', artwork: 'album-free-to-change.jpg' },
  'hello-2150': { titleJa: 'Hello 2150', titleEn: 'Hello 2150', artwork: 'album-hello-2150.jpg' },
  'everybody-say-bjj': { titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ', artwork: 'album-everybody-bjj.jpg' },
  'everybody-bjj': { titleJa: 'Everybody say 柔術', titleEn: 'Everybody say BJJ', artwork: 'album-everybody-bjj.jpg' },
  'i-love-you': { titleJa: 'I Love You', titleEn: 'I Love You', artwork: 'album-i-love-you.jpg' },
  'attention': { titleJa: 'I need your attention', titleEn: 'I need your attention', artwork: 'album-attention.jpg' },
  'koi-jujutsu': { titleJa: 'それ恋じゃなくて柔術', titleEn: "That's not love, it's Jiu-Jitsu", artwork: 'album-koi-jujutsu.jpg' },
  'shio-to-pixel': { titleJa: '塩とピクセル', titleEn: 'Salt and Pixels', artwork: 'album-shio-pixel.jpg' },
  'musubinaosu': { titleJa: '結び直す朝', titleEn: 'Morning to Reconnect', artwork: 'album-musubinaosu.jpg' },
  'attention-please': { titleJa: 'アテンションください', titleEn: 'Attention Please', artwork: 'album-attention-please.jpg' },
};

const playTrackById = (trackId: string) => {
  window.dispatchEvent(new CustomEvent('playTrackById', { detail: { trackId } }));
};

// Helper to generate anchor link HTML
const generateAnchorLink = (id: string) => {
  return `<a href="#${id}" class="blog-heading-anchor" aria-label="Link to this section" data-copy-anchor="${id}"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></a>`;
};

// Memoized content processing function
const processContent = (rawContent: string, lang: string): string => {
  // First, process code blocks to protect them from other regex replacements
  const codeBlocks: string[] = [];
  const mermaidBlocks: string[] = [];
  let mermaidIndex = 0;
  
  let processed = rawContent
    // Process mermaid code blocks first (supports both ```mermaid and [mermaid] formats)
    .replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
      const placeholder = `__MERMAID_BLOCK_${mermaidIndex}__`;
      mermaidBlocks.push(code.trim());
      mermaidIndex++;
      return placeholder;
    })
    .replace(/\[mermaid\]\n?([\s\S]*?)\[\/mermaid\]/g, (_, code) => {
      const placeholder = `__MERMAID_BLOCK_${mermaidIndex}__`;
      mermaidBlocks.push(code.trim());
      mermaidIndex++;
      return placeholder;
    })
    // Process other fenced code blocks (```language ... ```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang || 'code';
      const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<div class="my-6 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/10">
        <div class="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-white/5">
          <span class="text-xs text-zinc-400 font-mono">${langLabel}</span>
        </div>
        <pre class="p-4 overflow-x-auto text-sm"><code class="text-zinc-100 font-mono leading-relaxed">${escapedCode}</code></pre>
      </div>`);
      return placeholder;
    })
    // Process inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-sm">$1</code>')
    // Process details/summary tags
    .replace(/<details>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/g, (_, summary, content) => {
      return `<details class="my-6 rounded-xl border border-border/50 bg-muted/20 overflow-hidden group">
        <summary class="px-5 py-4 cursor-pointer font-medium text-foreground hover:bg-muted/40 transition-colors flex items-center gap-3">
          <svg class="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          ${summary}
        </summary>
        <div class="px-5 py-4 border-t border-border/30 bg-background/50 prose prose-sm max-w-none">
          ${content}
        </div>
      </details>`;
    });
  
  // Continue with other replacements
  processed = processed
    .replace(/<h2([^>]*)>([^<]+)<\/h2>/g, (_, attrs, text) => {
      const hasId = attrs.includes('id=');
      const id = text.trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      const idAttr = hasId ? '' : ` id="${id}"`;
      return `<h2${attrs}${idAttr} class="blog-heading blog-heading-h2 group">${text}${generateAnchorLink(id)}</h2>`;
    })
    .replace(/<h3([^>]*)>([^<]+)<\/h3>/g, (_, attrs, text) => {
      const hasId = attrs.includes('id=');
      const id = text.trim().toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      const idAttr = hasId ? '' : ` id="${id}"`;
      return `<h3${attrs}${idAttr} class="blog-heading blog-heading-h3 group">${text}${generateAnchorLink(id)}</h3>`;
    })
    .replace(/^## (.+)$/gm, (_, heading) => {
      const cleanHeading = heading.replace(/\*\*/g, '').trim();
      const id = cleanHeading.toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      return `<h2 id="${id}" class="blog-heading blog-heading-h2 group">${heading}${generateAnchorLink(id)}</h2>`;
    })
    .replace(/^### (.+)$/gm, (_, heading) => {
      const cleanHeading = heading.replace(/\*\*/g, '').trim();
      const id = cleanHeading.toLowerCase().replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').replace(/\s+/g, '-').slice(0, 50);
      return `<h3 id="${id}" class="blog-heading blog-heading-h3 group">${heading}${generateAnchorLink(id)}</h3>`;
    });
  
  // Process markdown tables properly (handle multiline)
  processed = processed.replace(/(?:^\|.+\|$\n?)+/gm, (tableBlock) => {
    const lines = tableBlock.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return tableBlock;
    
    // Find separator line (|---|---|)
    const separatorIndex = lines.findIndex(line => 
      line.split('|').filter(c => c.trim()).every(c => c.trim().match(/^[-:]+$/))
    );
    
    if (separatorIndex === -1) return tableBlock;
    
    const headerLines = lines.slice(0, separatorIndex);
    const bodyLines = lines.slice(separatorIndex + 1);
    
    // Process header
    const headerHtml = headerLines.map(line => {
      const cells = line.split('|').filter(c => c.trim());
      const cellsHtml = cells.map(c => `<th class="blog-table-th">${c.trim()}</th>`).join('');
      return `<tr class="blog-table-header">${cellsHtml}</tr>`;
    }).join('');
    
    // Process body
    const bodyHtml = bodyLines.map(line => {
      const cells = line.split('|').filter(c => c.trim());
      const cellsHtml = cells.map((c, i) => {
        const value = c.trim();
        const isNumber = /^[¥$€]?[\d,]+(?:\.\d+)?%?$/.test(value);
        const isCheck = value === '✓' || value === '✔' || value === '○';
        const isCross = value === '✗' || value === '×' || value === '-';
        
        let cellClass = 'blog-table-td';
        if (i === 0) cellClass += ' blog-table-td-first';
        if (isNumber) cellClass += ' blog-table-td-number';
        if (isCheck) cellClass += ' blog-table-td-check';
        if (isCross) cellClass += ' blog-table-td-cross';
        
        return `<td class="${cellClass}">${value}</td>`;
      }).join('');
      return `<tr class="blog-table-row">${cellsHtml}</tr>`;
    }).join('');
    
    return `<div class="blog-table-wrapper"><table class="blog-table"><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table></div>`;
  });
  
  processed = processed
    .replace(/<blockquote>([^<]+)<\/blockquote>/g, '<div class="blog-quote"><p>$1</p></div>')
    .replace(/^> (.+)$/gm, '<div class="blog-quote"><p>$1</p></div>')
    .replace(/^---$/gm, '<hr class="my-12 border-t border-border/30" />')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center mt-0.5">$1</span><span class="text-muted-foreground leading-relaxed">$2</span></li>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2.5"></span><span class="text-muted-foreground leading-relaxed">$1</span></li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-all font-medium">$1</a>')
    .replace(/^(⚠️|👉|🎉) (.+)$/gm, (_, emoji, text) => {
      const bgColor = emoji === '⚠️' ? 'bg-amber-500/10 border-amber-500/30' : emoji === '🎉' ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/10 border-primary/30';
      return `<div class="flex items-start gap-3 p-4 my-4 rounded-xl ${bgColor} border"><span class="text-2xl">${emoji}</span><span class="text-foreground leading-relaxed">${text}</span></div>`;
    })
    // YouTube links with thumbnail - convert [youtube:ID] to clickable link cards
    // Use a placeholder to prevent double processing
    .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, (_, videoId) => {
      return `__YOUTUBE_EMBED_${videoId}__`;
    })
    .replace(/\[image:([^\]]+)\]/g, (_, imageInfo) => {
      if (imageInfo.startsWith('/')) {
        const parts = imageInfo.split(':');
        const imagePath = parts[0];
        const caption = parts.slice(1).join(':') || '';
        return `<figure class="my-8"><img src="${imagePath}" alt="${caption}" loading="lazy" decoding="async" class="w-full rounded-xl shadow-lg ring-1 ring-border/20" />${caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-3">${caption}</figcaption>` : ''}</figure>`;
      } else {
        const imageSrc = blogImages[imageInfo];
        return imageSrc ? `<div class="my-8 flex justify-center"><img src="${imageSrc}" alt="${imageInfo}" loading="lazy" decoding="async" class="w-full md:w-1/2 lg:w-2/5 rounded-xl shadow-lg ring-1 ring-border/20" /></div>` : '';
      }
    })
    // Transform Amazon affiliate links into product cards
    .replace(/<a\s+href="(https?:\/\/(?:www\.)?amazon\.co\.jp\/dp\/([A-Z0-9]+)[^"]*)"[^>]*>([^<]+)<\/a>/gi, (_, url, asin, linkText) => {
      const cleanText = linkText.replace(/^👉\s*/, '').trim();
      const productImageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block my-6 group">
        <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
          <div class="flex-shrink-0 w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-md">
            <img src="${productImageUrl}" alt="${cleanText}" class="w-14 h-14 object-contain" onerror="this.parentElement.innerHTML='<svg class=\\'w-8 h-8 text-amber-500\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M21.6 9.4c-.1-.1-.3-.2-.5-.2h-6.1l-1.6-5.6c-.1-.3-.4-.6-.8-.6s-.7.2-.8.6l-1.6 5.6h-6.1c-.2 0-.4.1-.5.2-.2.1-.2.3-.2.5s.1.3.2.5l4.9 3.6-1.9 5.9c-.1.2 0 .4.1.6.1.2.3.3.5.3s.4-.1.5-.2l4.9-3.6 4.9 3.6c.1.1.3.2.5.2s.4-.1.5-.3c.1-.2.2-.4.1-.6l-1.9-5.9 4.9-3.6c.2-.1.3-.3.3-.5s-.1-.4-.3-.5z\\'/></svg>'"/>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 9.4c-.1-.1-.3-.2-.5-.2h-6.1l-1.6-5.6c-.1-.3-.4-.6-.8-.6s-.7.2-.8.6l-1.6 5.6h-6.1c-.2 0-.4.1-.5.2-.2.1-.2.3-.2.5s.1.3.2.5l4.9 3.6-1.9 5.9c-.1.2 0 .4.1.6.1.2.3.3.5.3s.4-.1.5-.2l4.9-3.6 4.9 3.6c.1.1.3.2.5.2s.4-.1.5-.3c.1-.2.2-.4.1-.6l-1.9-5.9 4.9-3.6c.2-.1.3-.3.3-.5s-.1-.4-.3-.5z"/></svg>
              <span class="text-xs font-medium text-amber-500 uppercase tracking-wide">${lang === 'ja' ? 'Amazon で購入' : 'Buy on Amazon'}</span>
            </div>
            <p class="font-semibold text-foreground group-hover:text-amber-500 transition-colors truncate">${cleanText}</p>
          </div>
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>
        </div>
      </a>`;
    })
    // Also handle Amazon links with simpler href patterns
    .replace(/<a\s+href="(https?:\/\/(?:www\.)?amazon\.(?:co\.jp|com)\/[^"]+)"[^>]*>([^<]*(?:Amazon|amazon)[^<]*)<\/a>/gi, (_, url, linkText) => {
      const cleanText = linkText.replace(/^👉\s*/, '').trim();
      // Try to extract ASIN from URL
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/product\/([A-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1] : null;
      const productImageUrl = asin ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg` : null;
      
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block my-6 group">
        <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
          ${productImageUrl ? `<div class="flex-shrink-0 w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-md">
            <img src="${productImageUrl}" alt="${cleanText}" class="w-14 h-14 object-contain" onerror="this.parentElement.innerHTML='<svg class=\\'w-8 h-8 text-amber-500\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M21.6 9.4c-.1-.1-.3-.2-.5-.2h-6.1l-1.6-5.6c-.1-.3-.4-.6-.8-.6s-.7.2-.8.6l-1.6 5.6h-6.1c-.2 0-.4.1-.5.2-.2.1-.2.3-.2.5s.1.3.2.5l4.9 3.6-1.9 5.9c-.1.2 0 .4.1.6.1.2.3.3.5.3s.4-.1.5-.2l4.9-3.6 4.9 3.6c.1.1.3.2.5.2s.4-.1.5-.3c.1-.2.2-.4.1-.6l-1.9-5.9 4.9-3.6c.2-.1.3-.3.3-.5s-.1-.4-.3-.5z\\'/></svg>'"/>
          </div>` : `<div class="flex-shrink-0 w-16 h-16 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 9.4c-.1-.1-.3-.2-.5-.2h-6.1l-1.6-5.6c-.1-.3-.4-.6-.8-.6s-.7.2-.8.6l-1.6 5.6h-6.1c-.2 0-.4.1-.5.2-.2.1-.2.3-.2.5s.1.3.2.5l4.9 3.6-1.9 5.9c-.1.2 0 .4.1.6.1.2.3.3.5.3s.4-.1.5-.2l4.9-3.6 4.9 3.6c.1.1.3.2.5.2s.4-.1.5-.3c.1-.2.2-.4.1-.6l-1.9-5.9 4.9-3.6c.2-.1.3-.3.3-.5s-.1-.4-.3-.5z"/></svg>
          </div>`}
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 9.4c-.1-.1-.3-.2-.5-.2h-6.1l-1.6-5.6c-.1-.3-.4-.6-.8-.6s-.7.2-.8.6l-1.6 5.6h-6.1c-.2 0-.4.1-.5.2-.2.1-.2.3-.2.5s.1.3.2.5l4.9 3.6-1.9 5.9c-.1.2 0 .4.1.6.1.2.3.3.5.3s.4-.1.5-.2l4.9-3.6 4.9 3.6c.1.1.3.2.5.2s.4-.1.5-.3c.1-.2.2-.4.1-.6l-1.9-5.9 4.9-3.6c.2-.1.3-.3.3-.5s-.1-.4-.3-.5z"/></svg>
              <span class="text-xs font-medium text-amber-500 uppercase tracking-wide">${lang === 'ja' ? 'Amazon で購入' : 'Buy on Amazon'}</span>
            </div>
            <p class="font-semibold text-foreground group-hover:text-amber-500 transition-colors truncate">${cleanText}</p>
          </div>
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>
        </div>
      </a>`;
    })
    // Handle Oura Ring link with special styling
    .replace(/<a\s+href="(https?:\/\/ouraring\.com[^"]*)"[^>]*>([^<]+)<\/a>/gi, (_, url, linkText) => {
      const cleanText = linkText.replace(/^👉\s*/, '').trim();
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block my-6 group">
        <div class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10">
          <div class="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke-width="2"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium text-sky-500 uppercase tracking-wide">${lang === 'ja' ? '公式サイト' : 'Official Site'}</span>
            </div>
            <p class="font-semibold text-foreground group-hover:text-sky-500 transition-colors">${cleanText}</p>
          </div>
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-sky-500/20 group-hover:bg-sky-500/30 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </div>
        </div>
      </a>`;
    })
    .replace(/\[play:([a-zA-Z0-9_-]+)\]/g, (_, trackId) => {
      const track = trackMapping[trackId];
      const trackTitle = lang === 'ja' ? track?.titleJa : track?.titleEn;
      const artworkFile = track?.artwork || `album-${trackId}.jpg`;
      const artworkPath = `/images/${artworkFile}`;
      return `<div class="my-8 flex justify-center"><button data-play-track-id="${trackId}" class="group relative inline-flex items-center gap-5 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 hover:from-primary/30 hover:via-primary/20 hover:to-primary/30 border border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] cursor-pointer"><span class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span><img src="${artworkPath}" alt="${trackTitle}" class="w-16 h-16 rounded-xl object-cover shadow-lg ring-1 ring-white/10 group-hover:ring-primary/30 transition-all" /><div class="text-left"><span class="block text-xs text-muted-foreground mb-0.5">${lang === 'ja' ? '🎵 曲を再生' : '🎵 Play Track'}</span><span class="block text-lg font-semibold text-foreground group-hover:text-primary transition-colors">${trackTitle || 'Unknown Track'}</span></div><div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors ml-2"><svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></button></div>`;
    });

  // Restore mermaid blocks as placeholder divs for client-side rendering
  mermaidBlocks.forEach((code, i) => {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    processed = processed.replace(
      `__MERMAID_BLOCK_${i}__`,
      `<div class="mermaid-container my-8 flex justify-center"><div class="mermaid-diagram w-full max-w-4xl rounded-xl bg-slate-900/50 p-6 ring-1 ring-white/10 overflow-x-auto" data-mermaid-code="${encodeURIComponent(code)}"><pre class="text-xs text-muted-foreground">${escapedCode}</pre></div></div>`
    );
  });
  
  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    processed = processed.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // Restore YouTube embeds from placeholders (clickable to open modal)
  processed = processed.replace(/__YOUTUBE_EMBED_([a-zA-Z0-9_-]+)__/g, (_, videoId) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return `<button data-youtube-video-id="${videoId}" class="block my-6 group max-w-lg mx-auto w-full cursor-pointer bg-transparent border-0 p-0">
      <div class="relative aspect-video rounded-xl overflow-hidden shadow-lg ring-1 ring-border/20 hover:ring-red-500/50 transition-all duration-300">
        <img src="${thumbnailUrl}" alt="YouTube video thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />
        <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div class="relative group-hover:scale-110 transition-transform duration-300">
            <svg class="w-16 h-12 md:w-20 md:h-14 drop-shadow-lg" viewBox="0 0 68 48">
              <path class="fill-red-600 group-hover:fill-red-500 transition-colors" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"/>
              <path class="fill-white" d="M45,24L27,14v20L45,24z"/>
            </svg>
          </div>
        </div>
        <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          ${lang === 'ja' ? 'クリックで再生' : 'Click to play'}
        </div>
      </div>
    </button>`;
  });

  return DOMPurify.sanitize(processed, {
    ADD_TAGS: ['figure', 'figcaption', 'iframe', 'details', 'summary', 'pre', 'code', 'button'],
    ADD_ATTR: ['data-play-track-id', 'data-youtube-video-id', 'style', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'decoding', 'open'],
    // Allow same-origin relative URLs like /images/... in addition to https:// and data:
    ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|\/)/i,
  });
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, isScheduled, loadingProgress } = useBlogPost(slug, true);
  const { isAdmin } = useBlogPosts(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { setPageContext, setCurrentBlogTitle } = useChat();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setPageContext('blog-post');
    if (post) {
      setCurrentBlogTitle(post[language].title);
    }
    return () => {
      setPageContext('home');
      setCurrentBlogTitle(undefined);
    };
  }, [post, language, setPageContext, setCurrentBlogTitle]);

  const [signupFormContainer, setSignupFormContainer] = useState<HTMLElement | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const playButtons = contentRef.current.querySelectorAll('[data-play-track-id]');
    const handlers: Array<{ button: Element; handler: (e: Event) => void }> = [];
    
    playButtons.forEach((button) => {
      const trackId = button.getAttribute('data-play-track-id') || '';
      const handleClick = () => playTrackById(trackId);
      button.addEventListener('click', handleClick);
      handlers.push({ button, handler: handleClick });
    });

    // Add YouTube video button handlers
    const youtubeButtons = contentRef.current.querySelectorAll('[data-youtube-video-id]');
    youtubeButtons.forEach((button) => {
      const videoId = button.getAttribute('data-youtube-video-id') || '';
      const handleClick = (e: Event) => {
        e.preventDefault();
        setYoutubeVideoId(videoId);
      };
      button.addEventListener('click', handleClick);
      handlers.push({ button, handler: handleClick });
    });

    // Add anchor link click handlers for copying URL
    const anchorLinks = contentRef.current.querySelectorAll('[data-copy-anchor]');
    anchorLinks.forEach((anchor) => {
      const anchorId = anchor.getAttribute('data-copy-anchor') || '';
      const handleAnchorClick = () => {
        const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
        navigator.clipboard.writeText(url).then(() => {
          // Add copied class for visual feedback
          anchor.classList.add('copied');
          setTimeout(() => {
            anchor.classList.remove('copied');
          }, 1000);
          // Also scroll to the section
          const targetElement = document.getElementById(anchorId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            // Update URL hash without page jump
            window.history.pushState(null, '', `#${anchorId}`);
          }
        });
      };
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        handleAnchorClick();
      });
      handlers.push({ button: anchor, handler: handleAnchorClick });
    });

    // Find elio signup form placeholder
    const signupPlaceholder = contentRef.current.querySelector('[data-component="elio-signup-form"]');
    if (signupPlaceholder) {
      setSignupFormContainer(signupPlaceholder as HTMLElement);
    }

    // Render mermaid diagrams
    const mermaidDiagrams = contentRef.current.querySelectorAll('[data-mermaid-code]');
    mermaidDiagrams.forEach(async (container, index) => {
      const code = decodeURIComponent(container.getAttribute('data-mermaid-code') || '');
      if (code) {
        try {
          const { svg } = await mermaid.render(`mermaid-${slug}-${index}`, code);
          container.innerHTML = svg;
          // Add styling to the generated SVG
          const svgElement = container.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
        }
      }
    });

    return () => {
      handlers.forEach(({ button, handler }) => {
        button.removeEventListener('click', handler);
      });
    };
  }, [post, language, slug]);

  // Memoize processed content to avoid recalculation on every render
  const processedContent = useMemo(() => {
    if (!post) return '';
    let content = post[language].content;
    
    // Hide members-only content for non-authenticated users
    if (!isAuthenticated) {
      content = content.replace(
        /<div class="members-only-content"[^>]*>[\s\S]*?<\/div>/g,
        `<div class="members-only-placeholder glass rounded-2xl p-8 my-8 text-center border-2 border-dashed border-primary/30">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-foreground">${language === 'ja' ? '🎁 会員限定コンテンツ' : '🎁 Members Only Content'}</h3>
            <p class="text-muted-foreground max-w-md">${language === 'ja' ? 'この続きは会員登録すると閲覧できます。無料で登録して、特別なコンテンツにアクセスしましょう！' : 'Register for free to unlock this exclusive content and access special features!'}</p>
            <a href="/auth" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              ${language === 'ja' ? '無料で会員登録' : 'Register for Free'}
            </a>
          </div>
        </div>`
      );
    }
    
    return processContent(content, language);
  }, [post, language, isAuthenticated]);

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <BlogPostSkeleton key="skeleton" progress={loadingProgress} />
      </AnimatePresence>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'ja' ? '記事が見つかりません' : 'Article Not Found'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'ja' 
              ? 'お探しのブログ記事は存在しないか、削除された可能性があります。' 
              : 'The blog post you are looking for does not exist or may have been deleted.'}
          </p>
          <Button asChild>
            <Link to="/#blog">{language === 'ja' ? 'ブログ一覧に戻る' : 'Back to Blog'}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const content = post[language];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={content.title}
        description={content.excerpt}
        image={post.image}
        url={`https://yukihamada.jp/blog/${post.slug}`}
        type="article"
        publishedTime={content.date}
        category={content.category}
      />
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl lg:mr-80">
            {/* Main content */}
            <article className="w-full">
              <div>
                <Button variant="ghost" asChild className="mb-8 text-muted-foreground hover:text-foreground">
                  <Link to="/#blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'ja' ? 'ブログに戻る' : 'Back to Blog'}
                  </Link>
                </Button>
              </div>

              <header className="mb-12">
                {/* Category and Date */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {isScheduled && isAdmin && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-sm font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {language === 'ja' ? '予約投稿（管理者プレビュー）' : 'Scheduled (Admin Preview)'}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    {content.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    {content.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    {formatReadingTime(calculateReadingTime(content.content, language), language)}
                  </span>
                  <BlogViewStats postSlug={post.slug} />
                  <ShareCounts postSlug={post.slug} />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                  {content.title}
                </h1>

                {/* Excerpt */}
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                  {content.excerpt}
                </p>

                {/* Author and Actions */}
                <div className="flex items-center justify-between gap-3 p-4 glass rounded-2xl mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <OptimizedImage
                      src={yukiProfile}
                      alt="Yuki Hamada"
                      width={48}
                      height={48}
                      loading="eager"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">Yuki Hamada</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {language === 'ja' ? '株式会社イネブラ' : 'Enebular Inc.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://x.com/yukihamada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium flex-shrink-0 whitespace-nowrap"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    <span>{language === 'ja' ? 'フォロー' : 'Follow'}</span>
                  </a>
                </div>

                {/* Share Buttons */}
                <div className="mb-6">
                  <ShareButtons title={content.title} url={window.location.href} />
                </div>

                {/* AI Summary and Read Aloud */}
                <BlogSummary 
                  postSlug={post.slug}
                  title={content.title}
                  category={content.category}
                  content={content.content}
                />

                {/* Table of Contents - Mobile (inline) */}
                <div className="lg:hidden">
                  <TableOfContents content={content.content} />
                </div>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="glass rounded-3xl p-4 md:p-8 lg:p-12">
                  <div 
                    ref={contentRef}
                    className="blog-content prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                  {/* Render ElioSignupForm via portal */}
                  {signupFormContainer && createPortal(
                    <ElioSignupForm lang={language} />,
                    signupFormContainer
                  )}
                </div>
              </div>

              {/* Bottom Share Buttons */}
              <div className="mt-12 pt-8 border-t border-border/30">
                <p className="text-center text-muted-foreground mb-4">
                  {language === 'ja' ? 'この記事をシェアする' : 'Share this article'}
                </p>
                <ShareButtons title={content.title} url={window.location.href} />
              </div>

              {/* Like Button */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <LikeButton postSlug={post.slug} />
              </div>

              {/* AI Suggested Questions */}
              <BlogSuggestedQuestions 
                postSlug={post.slug}
                blogTitle={content.title}
                blogCategory={content.category}
                content={content.content}
              />

              {/* Comments Section */}
              <BlogComments blogSlug={post.slug} />

              {/* Back to Blog */}
              <div className="mt-12 text-center">
                <Button variant="outline" asChild>
                  <Link to="/#blog">
                    {language === 'ja' ? 'すべての記事を見る' : 'View All Posts'}
                  </Link>
                </Button>
              </div>
            </article>
            </div>

            {/* Sticky Sidebar TOC - Desktop only */}
            <aside className="hidden lg:block fixed right-8 xl:right-16 top-28 w-72">
              <TableOfContents content={content.content} sticky />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* YouTube Video Modal */}
      <Dialog 
        open={!!youtubeVideoId} 
        onOpenChange={(open) => {
          if (!open) {
            setYoutubeVideoId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-none overflow-hidden">
          <div className="relative aspect-video w-full">
            {youtubeVideoId && (
              <iframe
                key={youtubeVideoId}
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1`}
                title="YouTube video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPost;
