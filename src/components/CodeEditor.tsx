import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] font-bold">python_script.py</span>
          <button 
            onClick={() => onChange('')}
            className="text-[10px] font-bold uppercase text-zinc-600 hover:text-indigo-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="p-6 font-mono text-sm h-[calc(100%-56px)] overflow-auto custom-scrollbar">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages.python, 'python')}
          padding={10}
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 14,
            minHeight: '100%',
          }}
          className="outline-none"
        />
      </div>
    </div>
  );
};
