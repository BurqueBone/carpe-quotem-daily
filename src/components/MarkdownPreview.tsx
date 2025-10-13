import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-light.css';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target={props.href?.startsWith('http') ? '_blank' : undefined}
              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
