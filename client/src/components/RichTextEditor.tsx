import { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SimpleImageUploader } from './SimpleImageUploader';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const handleImageUploaded = (imageUrl: string) => {
    // Insert image into editor
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      quill.insertEmbed(range?.index || 0, 'image', imageUrl);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'blockquote', 'code-block'
  ];

  return (
    <div className={cn("relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900", className)}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid rgb(229 231 235) !important;
          background: rgb(249 250 251) !important;
          padding: 10px 12px !important;
        }
        .dark .ql-toolbar {
          background: rgb(31 41 55) !important;
          border-bottom-color: rgb(75 85 99) !important;
        }
        .ql-container {
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .ql-editor {
          padding: 16px !important;
          min-height: 150px !important;
          line-height: 1.6 !important;
          background: white !important;
        }
        .dark .ql-editor {
          background: rgb(17 24 39) !important;
          color: rgb(243 244 246) !important;
        }
        .ql-editor.ql-blank::before {
          color: rgb(156 163 175) !important;
          font-style: normal !important;
          left: 16px !important;
        }
        .dark .ql-editor.ql-blank::before {
          color: rgb(107 114 128) !important;
        }
        .ql-snow .ql-tooltip {
          background: white !important;
          border: 1px solid rgb(229 231 235) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 8px 12px !important;
        }
        .dark .ql-snow .ql-tooltip {
          background: rgb(31 41 55) !important;
          border-color: rgb(75 85 99) !important;
          color: rgb(243 244 246) !important;
        }
        .ql-snow .ql-stroke {
          stroke: rgb(107 114 128) !important;
        }
        .ql-snow .ql-fill {
          fill: rgb(107 114 128) !important;
        }
        .dark .ql-snow .ql-stroke {
          stroke: rgb(156 163 175) !important;
        }
        .dark .ql-snow .ql-fill {
          fill: rgb(156 163 175) !important;
        }
        .ql-snow .ql-picker-label {
          color: rgb(107 114 128) !important;
        }
        .dark .ql-snow .ql-picker-label {
          color: rgb(156 163 175) !important;
        }
        .ql-snow .ql-picker-options {
          background: white !important;
          border: 1px solid rgb(229 231 235) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 4px !important;
        }
        .dark .ql-snow .ql-picker-options {
          background: rgb(31 41 55) !important;
          border-color: rgb(75 85 99) !important;
        }
        .ql-snow .ql-picker-item {
          color: rgb(55 65 81) !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
        }
        .dark .ql-snow .ql-picker-item {
          color: rgb(243 244 246) !important;
        }
        .ql-snow .ql-picker-item:hover {
          background: rgb(243 244 246) !important;
        }
        .dark .ql-snow .ql-picker-item:hover {
          background: rgb(55 65 81) !important;
        }
        .ql-toolbar .ql-formats {
          margin-right: 12px !important;
        }
        .ql-toolbar button {
          padding: 4px !important;
          border-radius: 4px !important;
        }
        .ql-toolbar button:hover {
          background: rgb(243 244 246) !important;
        }
        .dark .ql-toolbar button:hover {
          background: rgb(55 65 81) !important;
        }
        .ql-toolbar button.ql-active {
          background: rgb(59 130 246) !important;
          color: white !important;
        }
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: white !important;
        }
        .ql-toolbar button.ql-active .ql-fill {
          fill: white !important;
        }
        `
      }} />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
        <SimpleImageUploader onImageUploaded={handleImageUploaded} />
      </div>
    </div>
  );
}