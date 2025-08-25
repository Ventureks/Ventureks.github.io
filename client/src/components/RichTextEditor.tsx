import { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SimpleImageUploader } from './SimpleImageUploader';

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
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link'],
        ['clean']
      ],
      handlers: {
        // Custom image handler removed since we'll use external button
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'link', 'image'
  ];

  return (
    <div className={className}>
      <div className="mb-2">
        <SimpleImageUploader onImageUploaded={handleImageUploaded} />
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          height: '200px',
          marginBottom: '50px'
        }}
      />
    </div>
  );
}