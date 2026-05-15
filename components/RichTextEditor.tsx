'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { uploadMedia } from '@/utils/adminApi';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = 'Start typing...', folder = 'lessons' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const { url } = await uploadMedia(file, folder);
          if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image');
        }
      }
    };
    input.click();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? styles.active : ''}
          type="button"
        >
          List
        </button>
        <button onClick={addImage} type="button">
          Image
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          type="button"
        >
          Insert Table
        </button>

        {editor.isActive('table') && (
          <div className={styles.tableControls}>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()} type="button" title="Add Column After">Col+</button>
            <button onClick={() => editor.chain().focus().addRowAfter().run()} type="button" title="Add Row After">Row+</button>
            <button onClick={() => editor.chain().focus().deleteColumn().run()} type="button" title="Delete Column">Col-</button>
            <button onClick={() => editor.chain().focus().deleteRow().run()} type="button" title="Delete Row">Row-</button>
            <button onClick={() => editor.chain().focus().deleteTable().run()} type="button" title="Delete Table" className={styles.dangerBtn}>Del Table</button>
          </div>
        )}
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
};

export default RichTextEditor;
