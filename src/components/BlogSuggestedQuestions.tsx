import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/contexts/ChatContext';

interface BlogSuggestedQuestionsProps {
  blogTitle: string;
  blogCategory: string;
}

const BlogSuggestedQuestions = ({ blogTitle, blogCategory }: BlogSuggestedQuestionsProps) => {
  const { language } = useLanguage();
  const { openChat, setPendingMessage } = useChat();

  // Generate contextual questions based on category
  const getQuestions = () => {
    const baseQuestions = language === 'ja' ? [
      `この記事の内容をもっと詳しく教えて`,
      `${blogTitle}について質問があります`,
      `関連するおすすめの記事はありますか？`,
    ] : [
      `Can you explain more about this article?`,
      `I have a question about "${blogTitle}"`,
      `Are there any related articles you recommend?`,
    ];

    // Add category-specific questions
    const categoryQuestions: Record<string, { ja: string[]; en: string[] }> = {
      'AI': {
        ja: ['AIの今後の発展についてどう思いますか？', 'この技術を実際に活用する方法は？'],
        en: ['What do you think about the future of AI?', 'How can I apply this technology practically?'],
      },
      '柔術': {
        ja: ['柔術を始めるにはどうすればいい？', '初心者へのアドバイスは？'],
        en: ['How can I start learning BJJ?', 'Any advice for beginners?'],
      },
      'BJJ': {
        ja: ['柔術を始めるにはどうすればいい？', '初心者へのアドバイスは？'],
        en: ['How can I start learning BJJ?', 'Any advice for beginners?'],
      },
      '音楽': {
        ja: ['この曲の制作背景を教えて', '音楽制作のプロセスについて聞きたい'],
        en: ['Tell me about the background of this song', 'I want to know about your music production process'],
      },
      'Music': {
        ja: ['この曲の制作背景を教えて', '音楽制作のプロセスについて聞きたい'],
        en: ['Tell me about the background of this song', 'I want to know about your music production process'],
      },
      'テクノロジー': {
        ja: ['この技術のビジネス応用について教えて', '今後のトレンドはどうなると思う？'],
        en: ['Tell me about business applications of this technology', 'What do you think future trends will be?'],
      },
      'Technology': {
        ja: ['この技術のビジネス応用について教えて', '今後のトレンドはどうなると思う？'],
        en: ['Tell me about business applications of this technology', 'What do you think future trends will be?'],
      },
    };

    const extraQuestions = categoryQuestions[blogCategory]?.[language === 'ja' ? 'ja' : 'en'] || [];
    return [...baseQuestions, ...extraQuestions].slice(0, 4);
  };

  const questions = getQuestions();

  const handleQuestionClick = (question: string) => {
    setPendingMessage(question);
    openChat();
  };

  return (
    <motion.div
      className="w-full mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          {language === 'ja' ? 'AIに質問する' : 'Ask AI'}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          {language === 'ja' 
            ? 'この記事について質問がありますか？' 
            : 'Have questions about this article?'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {language === 'ja' 
            ? '以下の質問をクリックするか、自由に質問してください' 
            : 'Click a question below or ask anything'}
        </p>
      </div>

      <div className="grid gap-3 mb-6">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            onClick={() => handleQuestionClick(question)}
            className="w-full text-left p-4 rounded-xl bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 transition-all group"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">
                {question}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={openChat}
          size="lg"
          className="gradient-bg text-primary-foreground hover:opacity-90"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          {language === 'ja' ? '自由に質問する' : 'Ask Anything'}
        </Button>
      </div>
    </motion.div>
  );
};

export default BlogSuggestedQuestions;
