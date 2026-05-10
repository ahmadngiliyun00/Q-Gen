import React, { useState } from 'react';
import { ArrowLeft, Download, FileJson, Save, Edit3, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';

interface EditorProps {
  initialContent: string;
  onBack: () => void;
  format: 'AIKEN' | 'PDF' | 'Esai';
  isGenerating?: boolean;
}

export default function Editor({ initialContent, onBack, format, isGenerating }: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync content while generating
  React.useEffect(() => {
    if (isGenerating) {
      setContent(initialContent);
    }
  }, [initialContent, isGenerating]);

  const handleExportAiken = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qgen-export.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save('qgen-export.pdf');
  };

  const handleSaveToDrive = () => {
    // Simulated Drive Save
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden text-gray-900">
      {/* Editor Header */}
      <header className="h-16 bg-[#0056b3] text-white flex items-center justify-between px-8 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
            title="Kembali ke Pembuat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="text-[#0056b3] font-black text-xl">Q</div>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Q-Gen <span className="font-light text-blue-100">| Editor</span></h1>
            <span className="ml-2 bg-blue-800 text-blue-100 border border-blue-400/30 text-xs px-2 py-0.5 rounded font-medium">
              {format}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveToDrive}
            disabled={saveStatus !== 'idle'}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 border border-blue-700 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 text-blue-50"
          >
            {saveStatus === 'saved' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan' : 'Simpan ke Drive'}
          </button>
          
          <div className="w-px h-6 bg-blue-700 mx-1"></div>

          <button
            onClick={handleExportAiken}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#0056b3] hover:bg-gray-100 border border-transparent rounded text-sm font-medium transition-colors"
          >
            <FileJson className="w-4 h-4" />
            AIKEN
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#ff8c00] text-white hover:bg-[#e67e00] rounded text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Editor Pane */}
        <div className={cn(
          "flex flex-col bg-white border border-gray-200 rounded-xl shadow-inner overflow-hidden transition-all duration-300",
          isEditing ? "w-1/2" : "w-full"
        )}>
          <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
            <span className="font-bold border-b-2 border-[#0056b3] text-sm py-1 px-1">Konten Mentah</span>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-[#0056b3] hover:underline font-medium"
            >
              {isEditing ? 'Perluas' : 'Tampilan Belah'}
            </button>
          </div>
          <textarea
            className="flex-1 p-6 text-gray-800 font-mono text-sm leading-relaxed outline-none resize-none bg-transparent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Preview Pane - Only shows in Split View */}
        {isEditing && (
          <div className="w-1/2 flex flex-col bg-white border border-gray-200 rounded-xl shadow-inner overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold border-b-2 border-[#0056b3] py-1 px-1">Pratinjau Langsung</span>
              </div>
              {isGenerating && (
                 <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Menerima Input...</span>
                  <div className="w-2 h-2 rounded-full bg-[#ff8c00] animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50">
               {content ? content.split('\\n\\n').map((block, i) => (
                  <div key={i} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white relative group">
                    <div className="absolute -left-3 top-6 w-6 h-6 bg-[#0056b3] text-white text-[10px] flex items-center justify-center rounded font-bold">
                       {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-gray-800 text-sm md:text-base">
                      {block}
                    </div>
                  </div>
                )) : (
                  <div className="p-6 border border-blue-400 border-dashed rounded-lg bg-blue-50 opacity-60 animate-pulse">
                    <div className="h-4 bg-blue-200 rounded w-3/4 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-blue-100 rounded"></div>
                      <div className="h-10 bg-blue-100 rounded"></div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
