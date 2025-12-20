-- Create blog_posts table for storing blog content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  featured BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  -- Japanese content
  title_ja TEXT NOT NULL,
  excerpt_ja TEXT NOT NULL,
  content_ja TEXT NOT NULL,
  date_ja TEXT NOT NULL,
  category_ja TEXT NOT NULL,
  -- English content
  title_en TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  content_en TEXT NOT NULL,
  date_en TEXT NOT NULL,
  category_en TEXT NOT NULL,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read blog posts
CREATE POLICY "Anyone can view blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (true);

-- Only admins can insert blog posts
CREATE POLICY "Admins can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update blog posts
CREATE POLICY "Admins can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete blog posts
CREATE POLICY "Admins can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster slug lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured);