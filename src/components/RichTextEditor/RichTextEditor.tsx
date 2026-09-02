import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaMinus,
  FaLink,
  FaEraser,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Keep content synchronized if updated externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return <div className="rich-editor-loading">Loading editor...</div>;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty URL -> remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  return (
    <div className={`rich-editor-container ${disabled ? 'disabled' : ''}`}>
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Editor toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          aria-label="Bold"
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          aria-label="Italic"
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
          aria-label="Strikethrough"
          title="Strikethrough"
          disabled={disabled}
        >
          <FaStrikethrough />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
          aria-label="Inline Code"
          title="Code"
          disabled={disabled}
        >
          <FaCode />
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          aria-label="Heading 2"
          title="Heading 2"
          disabled={disabled}
        >
          <FaHeading /> <span>2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          aria-label="Heading 3"
          title="Heading 3"
          disabled={disabled}
        >
          <FaHeading /> <span>3</span>
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          aria-label="Bullet List"
          title="Bullet List (* or -)"
          disabled={disabled}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          aria-label="Numbered List"
          title="Numbered List (1.)"
          disabled={disabled}
        >
          <FaListOl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          aria-label="Blockquote"
          title="Quote (>)"
          disabled={disabled}
        >
          <FaQuoteLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-btn"
          aria-label="Horizontal Rule"
          title="Divider (---)"
          disabled={disabled}
        >
          <FaMinus />
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          onClick={setLink}
          className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
          aria-label="Insert Link"
          title="Link"
          disabled={disabled}
        >
          <FaLink />
        </button>
        <button
          type="button"
          onClick={clearFormatting}
          className="toolbar-btn"
          aria-label="Clear Formatting"
          title="Clear Formatting"
          disabled={disabled}
        >
          <FaEraser />
        </button>

        <span className="toolbar-divider" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="toolbar-btn"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
          disabled={disabled || !editor.can().undo()}
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="toolbar-btn"
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
          disabled={disabled || !editor.can().redo()}
        >
          <FaRedo />
        </button>
      </div>

      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  );
};

export default RichTextEditor;
