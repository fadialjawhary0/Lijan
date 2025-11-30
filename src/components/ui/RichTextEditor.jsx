import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import UnderlineExtension from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Start typing...', disabled = false, className = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className={`border border-border rounded-lg bg-surface ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface-elevated">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${editor.isActive('bold') ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${editor.isActive('italic') ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled || !editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${editor.isActive('underline') ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-brand/10 text-brand' : 'text-text-muted'
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-brand/10 text-brand' : 'text-text-muted'
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-brand/10 text-brand' : 'text-text-muted'
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${editor.isActive('bulletList') ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-surface-hover transition-colors ${editor.isActive('orderedList') ? 'bg-brand/10 text-brand' : 'text-text-muted'}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Links & Media */}
        <button type="button" onClick={addLink} className="p-2 rounded hover:bg-surface-hover transition-colors text-text-muted" title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={addImage} className="p-2 rounded hover:bg-surface-hover transition-colors text-text-muted" title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={addTable} className="p-2 rounded hover:bg-surface-hover transition-colors text-text-muted" title="Insert Table">
          <TableIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="relative p-4 min-h-[300px] max-h-[600px] overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[250px] [&_.ProseMirror]:text-text [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_table_td]:border [&_.ProseMirror_table_td]:border-border [&_.ProseMirror_table_td]:p-2 [&_.ProseMirror_table_th]:border [&_.ProseMirror_table_th]:border-border [&_.ProseMirror_table_th]:p-2 [&_.ProseMirror_table_th]:bg-surface-elevated"
        />
        {!editor.getText() && <div className="absolute top-4 left-4 text-text-muted pointer-events-none">{placeholder}</div>}
      </div>
    </div>
  );
};

export default RichTextEditor;
