// Calculate reading time based on content
// Average reading speed: Japanese ~400 chars/min, English ~200 words/min

export const calculateReadingTime = (content: string, language: 'ja' | 'en'): number => {
  if (!content) return 1;
  
  // Remove HTML tags and markdown syntax
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[youtube:[^\]]+\]/g, '')
    .replace(/\[image:[^\]]+\]/g, '')
    .replace(/\[play:[^\]]+\]/g, '');
  
  if (language === 'ja') {
    // Japanese: count characters (excluding spaces and newlines)
    const charCount = cleanContent.replace(/[\s\n]/g, '').length;
    const wordsPerMinute = 400;
    return Math.max(1, Math.ceil(charCount / wordsPerMinute));
  } else {
    // English: count words
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
};

export const formatReadingTime = (minutes: number, language: 'ja' | 'en'): string => {
  if (language === 'ja') {
    return `${minutes}分で読める`;
  }
  return `${minutes} min read`;
};
