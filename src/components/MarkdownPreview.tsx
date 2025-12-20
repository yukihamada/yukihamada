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
        .replace(/\|(.+)\|/g, (match) => {
          const cells = match.split('|').filter(c => c.trim());
          if (cells.every(c => c.trim().match(/^[-:]+$/))) {
            return '';
          }
          const cellsHtml = cells.map(c => `<td class="px-3 py-2 border border-border/30 text-sm">${c.trim()}</td>`).join('');
          return `<tr class="even:bg-muted/30">${cellsHtml}</tr>`;
        })
        .replace(/(<tr.*?<\/tr>\s*)+/g, (match) => {
          return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse rounded-lg overflow-hidden shadow ring-1 ring-border/20 text-sm"><tbody>${match}</tbody></table></div>`;
        })
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-3 my-6 bg-primary/5 rounded-r-lg italic text-muted-foreground">$1</blockquote>')
        .replace(/^---$/gm, '<hr class="my-8 border-t border-border/30" />')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">$1</span><span class="text-muted-foreground leading-relaxed text-sm">$2</span></li>')
        .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span><span class="text-muted-foreground leading-relaxed text-sm">$1</span></li>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50">$1</a>')
        .replace(/^(⚠️|👉|🎉) (.+)$/gm, (_, emoji, text) => {
          const bgColor = emoji === '⚠️' ? 'bg-amber-500/10 border-amber-500/30' : emoji === '🎉' ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/10 border-primary/30';
          return `<div class="flex items-start gap-2 p-3 my-3 rounded-lg ${bgColor} border text-sm"><span class="text-lg">${emoji}</span><span class="text-foreground leading-relaxed">${text}</span></div>`;
        })
        .replace(/\[youtube:([a-zA-Z0-9_-]+)\]/g, '<div class="my-6 aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-sm">[YouTube: $1]</div>')
        .replace(/\[image:([a-zA-Z0-9_-]+)\]/g, '<div class="my-6 p-4 rounded-lg bg-muted/50 border border-dashed border-border text-center text-muted-foreground text-sm">[Image: $1]</div>')
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
