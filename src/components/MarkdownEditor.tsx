import { useRef, useState, useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { ImageUploadModal } from './ImageUploadModal';
import '@/styles/markdown-editor.css';

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
      <SimpleMDE
        value={value}
        onChange={onChange}
        options={options}
        getMdeInstance={(instance) => {
          editorRef.current = instance;
        }}
      />
      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
