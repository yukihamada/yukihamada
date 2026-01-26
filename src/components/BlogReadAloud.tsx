import PodcastPlayer from '@/components/PodcastPlayer';

interface BlogReadAloudProps {
  content: string;
  title: string;
  postSlug: string;
  coverImage?: string;
}

const BlogReadAloud = ({ content, title, postSlug, coverImage }: BlogReadAloudProps) => {
  return (
    <PodcastPlayer
      content={content}
      title={title}
      postSlug={postSlug}
      coverImage={coverImage}
    />
  );
};

export default BlogReadAloud;
