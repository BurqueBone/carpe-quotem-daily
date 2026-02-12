import { useRef, useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { ImageUploadModal } from './ImageUploadModal';
import '@/styles/markdown-editor.css';

// Lazy-load SimpleMDE to avoid SSR issues with codemirror/navigator
const SimpleMDE = lazy(() => import('react-simplemde-editor').then(mod => {
  // Dynamically import the CSS too
  import('easymde/dist/easymde.min.css');
  return { default: mod.default };
}));

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const editorRef = useRef<any>(null);

  const handleImageInsert = (markdown: string) => {
    if (editorRef.current) {
      const cm = editorRef.current.codemirror;
      const doc = cm.getDoc();
      const cursor = doc.getCursor();
      doc.replaceRange(markdown, cursor);
    }
  };

  const options = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your blog post content in Markdown...',
    status: ['lines', 'words', 'cursor'] as any,
    toolbar: [
      'bold',
      'italic',
      'strikethrough',
      '|',
      'heading-1',
      'heading-2',
      'heading-3',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      {
        name: 'image',
        action: () => setImageModalOpen(true),
        className: 'fa fa-picture-o',
        title: 'Insert Image',
      } as any,
      '|',
      'code',
      'horizontal-rule',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ] as any,
    shortcuts: {
      togglePreview: 'Cmd-P',
      toggleSideBySide: null,
      toggleFullScreen: 'F11',
    },
  }), []);

  return (
    <div className="markdown-editor-wrapper">
      <Suspense fallback={<div className="p-4 text-muted-foreground border rounded-lg min-h-[400px] flex items-center justify-center">Loading editor...</div>}>
        <SimpleMDE
          value={value}
          onChange={onChange}
          options={options}
          getMdeInstance={(instance) => {
            editorRef.current = instance;
          }}
        />
      </Suspense>
      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
