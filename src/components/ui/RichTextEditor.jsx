
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, className = '' }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'code-block'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor .ql-container {
            min-height: 200px;
            font-family: inherit;
          }
          .rich-text-editor .ql-editor {
            min-height: 200px;
          }
          .rich-text-editor .ql-toolbar {
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
          }
          .rich-text-editor .ql-container {
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
          }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;
