import DOMPurify from 'dompurify';

interface MarkdownPreviewProps {
  content: string;
  title?: string;
  excerpt?: string;
}

const MarkdownPreview = ({ content, title, excerpt }: MarkdownPreviewProps) => {
  const renderMarkdown = (text: string) => {
    return DOMPurify.sanitize(
      text
        .replace(/^## (.+)$/gm, '<h2 class="text-xl md:text-2xl font-bold mt-8 mb-4 text-foreground border-l-4 border-primary pl-4">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-lg md:text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
        .replace(/\|(.+)\|/g, (match, _, offset, fullStr) => {
          const cells = match.split('|').filter(c => c.trim());
          if (cells.every(c => c.trim().match(/^[-:]+$/))) return '';
          const beforeThis = fullStr.substring(0, offset);
          const tableStarted = beforeThis.match(/\|[^|]+\|[^|]*$/);
          const isHeader = !tableStarted || beforeThis.endsWith('\n\n') || beforeThis.endsWith('---\n');
          
          if (isHeader && !beforeThis.includes('<th')) {
            const headerCells = cells.map(c => `<th class="blog-table-th">${c.trim()}</th>`).join('');
            return `<tr class="blog-table-header">${headerCells}</tr>`;
          }
          const cellsHtml = cells.map((c, i) => {
            const value = c.trim();
            const isNumber = /^[¥$€]?[\d,]+(?:\.\d+)?%?$/.test(value);
            let cellClass = 'blog-table-td';
            if (i === 0) cellClass += ' blog-table-td-first';
            if (isNumber) cellClass += ' blog-table-td-number';
            return `<td class="${cellClass}">${value}</td>`;
          }).join('');
          return `<tr class="blog-table-row">${cellsHtml}</tr>`;
        })
        .replace(/(<tr class="blog-table-(?:header|row)".*?<\/tr>\s*)+/g, (match) => {
          return `<div class="blog-table-wrapper"><table class="blog-table"><tbody>${match}</tbody></table></div>`;
        })
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-3 my-6 bg-primary/5 rounded-r-lg italic text-muted-foreground">$1</blockquote>')
        .replace(/^---$/gm, '<hr class="my-8 border-t border-border/30" />')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">$1</span><span class="text-muted-foreground leading-relaxed text-sm">$2</span></li>')
        .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span><span class="text-muted-foreground leading-relaxed text-sm">$1</span></li>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50">$1</a>')
        // YouTube embed support
        .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, (_, videoId) => {
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          return `<a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="block my-6">
            <div class="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img src="${thumbnailUrl}" alt="YouTube" class="w-full h-full object-cover" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'" />
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div class="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                  <svg class="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          </a>`;
        })
        // Amazon link cards
        .replace(/<a\s+href="(https?:\/\/(?:www\.)?amazon\.co\.jp\/dp\/([A-Z0-9]+)[^"]*)"[^>]*>([^<]+)<\/a>/gi, (_, url, asin, linkText) => {
          const cleanText = linkText.replace(/^👉\s*/, '').trim();
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block my-4">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div class="flex-shrink-0 w-10 h-10 rounded bg-amber-500/20 flex items-center justify-center">
                <span class="text-amber-500 text-lg">📦</span>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs text-amber-500 font-medium">Amazon</span>
                <p class="text-sm font-medium text-foreground truncate">${cleanText}</p>
              </div>
            </div>
          </a>`;
        })
        .replace(/^(⚠️|👉|🎉) (.+)$/gm, (_, emoji, text) => {
          const bgColor = emoji === '⚠️' ? 'bg-amber-500/10 border-amber-500/30' : emoji === '🎉' ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/10 border-primary/30';
          return `<div class="flex items-start gap-2 p-3 my-3 rounded-lg ${bgColor} border text-sm"><span class="text-lg">${emoji}</span><span class="text-foreground leading-relaxed">${text}</span></div>`;
        })
        .replace(/\[image:([^\]]+)\]/g, (_, imageInfo) => {
          if (imageInfo.startsWith('/')) {
            const parts = imageInfo.split(':');
            const imagePath = parts[0];
            const caption = parts.slice(1).join(':') || '';
            return `<figure class="my-6"><img src="${imagePath}" alt="${caption}" class="w-full rounded-lg" />${caption ? `<figcaption class="text-center text-xs text-muted-foreground mt-2">${caption}</figcaption>` : ''}</figure>`;
          }
          return `<div class="my-6 p-4 rounded-lg bg-muted/50 border border-dashed border-border text-center text-muted-foreground text-sm">[Image: ${imageInfo}]</div>`;
        })
        .replace(/\[play:([a-zA-Z0-9_-]+)\]/g, '<div class="my-6 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center text-primary text-sm">[Music Player: $1]</div>')
        .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed text-sm">'),
      { ADD_ATTR: ['target', 'rel'] }
    );
  };

  return (
    <div className="bg-background rounded-lg border border-border p-6 h-full overflow-y-auto">
      {title && (
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
      )}
      {excerpt && (
        <p className="text-muted-foreground mb-6 pb-4 border-b border-border">{excerpt}</p>
      )}
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '') }}
      />
    </div>
  );
};

export default MarkdownPreview;
