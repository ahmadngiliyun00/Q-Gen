import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, FileJson, Save, Edit3, CheckCircle2, AlertTriangle, Loader2, ExternalLink, FileText } from 'lucide-react';
import { cn, getExportFilename } from '../lib/utils';
import jsPDF from 'jspdf';

const validateAikenBlock = (block: string): string | null => {
  const lines = block.trim().split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return null; // Ignore completely empty blocks
  if (lines.length < 3) return "Soal minimal terdiri dari satu baris pertanyaan, pilihan jawaban, dan baris kunci jawaban (ANSWER).";
  
  const answerLine = lines[lines.length - 1];
  if (!/^ANSWER:\s+[A-Z]$/i.test(answerLine)) {
    return "Baris terakhir harus berupa kunci jawaban dengan format 'ANSWER: X' (X adalah huruf kapital).";
  }

  // Check choices (middle lines)
  for (let i = 1; i < lines.length - 1; i++) {
    const choice = lines[i];
    if (!/^[A-Z][\.\)]\s+/.test(choice)) {
      return `Pilihan jawaban "${choice.substring(0, 15)}..." harus diawali huruf kapital dan titik atau kurung tutup, diikuti spasi (contoh: 'A. ' atau 'A) ').`;
    }
  }

  return null; // format is valid
};

interface EditorProps {
  initialContent: string;
  onBack: () => void;
  format: 'AIKEN' | 'Esai';
  isGenerating?: boolean;
  questionCount: number;
  title?: string;
}

export default function Editor({ initialContent, onBack, format, isGenerating, questionCount, title }: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeQuestionNumbers, setIncludeQuestionNumbers] = useState(true);
  const pdfOptionsRef = useRef<HTMLDivElement>(null);

  // Sync content while generating
  React.useEffect(() => {
    if (isGenerating) {
      setContent(initialContent);
    }
  }, [initialContent, isGenerating]);

  // Click outside to close PDF options
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pdfOptionsRef.current && !pdfOptionsRef.current.contains(event.target as Node)) {
        setShowPdfOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportAiken = async () => {
    setIsExporting(true);
    setExportProgress(30);
    await new Promise(r => setTimeout(r, 400));
    setExportProgress(80);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = format === 'AIKEN' ? 'txt' : 'doc';
    link.download = getExportFilename(format, extension);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportProgress(100);
    setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 400);
  };


  const handleExportPDF = async () => {
    setShowPdfOptions(false);
    setIsExporting(true);
    setExportProgress(15);
    
    await new Promise(r => setTimeout(r, 300));
    setExportProgress(45);
    
    let processedContent = content;
    
    if (!includeAnswerKey) {
      processedContent = processedContent
         .replace(/^ANSWER:\s+.*$/gm, '') 
         .replace(/--- HALAMAN KUNCI JAWABAN ---[\s\S]*$/g, ''); 
    }
    
    if (!includeQuestionNumbers) {
      processedContent = processedContent.replace(/^(?:\d+\.\s)/gm, '');
    }
    
    // Add introductory text for AIKEN format in PDF as requested
    if (format === 'AIKEN') {
      processedContent = `Berikut adalah pertanyaan AIKEN:\n\n${processedContent}`;
    }
    
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n').trim();

    await new Promise(r => setTimeout(r, 300));
    setExportProgress(75);

    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(processedContent, 180);
    
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 15, y);
      y += 6; // line height
    }
    
    doc.save(getExportFilename(format, 'pdf'));
    
    setExportProgress(100);
    setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 300);
  };

  const handleSaveToDrive = () => {
    // Simulated Drive Save
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
    }, 1500);
  };

  const currentTitle = title || `${questionCount} Soal ${format}`;

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden text-text-primary">
      {/* Editor Header */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-8 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
            title="Kembali ke Pembuat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-surface rounded flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{currentTitle}</h1>
            <span className="ml-2 bg-blue-800 text-blue-100 border border-blue-400/30 text-xs px-2 py-0.5 rounded font-medium">
              {format}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {saveStatus === 'saved' ? (
            <button
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700/20 border border-emerald-500/30 hover:bg-emerald-700/30 rounded text-sm font-medium transition-colors text-emerald-400"
            >
              <ExternalLink className="w-4 h-4" />
              Buka di Drive
            </button>
          ) : (
            <button
              onClick={handleSaveToDrive}
              disabled={saveStatus !== 'idle' || isExporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 border border-blue-700 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 text-blue-50"
            >
              {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin text-blue-200" /> : <Save className="w-4 h-4" />}
              {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan ke Drive'}
            </button>
          )}
          
          <div className="w-px h-6 bg-blue-700 mx-1"></div>

          <button
            onClick={handleExportAiken}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface text-primary hover:bg-background border border-border rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : (format === 'AIKEN' ? <FileJson className="w-4 h-4" /> : <FileText className="w-4 h-4" />)}
            {format === 'AIKEN' ? 'AIKEN' : 'DOC'}
          </button>
          
          <div className="relative" ref={pdfOptionsRef}>
            <button
              onClick={() => setShowPdfOptions(!showPdfOptions)}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white hover:bg-accent-hover rounded text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
            </button>
            {showPdfOptions && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden text-text-primary">
                <div className="p-3 border-b border-border bg-background text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Kustomisasi PDF
                </div>
                <div className="p-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeAnswerKey} 
                      onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    Sertakan Kunci Jawaban
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeQuestionNumbers} 
                      onChange={(e) => setIncludeQuestionNumbers(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    Sertakan Nomor Soal
                  </label>
                </div>
                <div className="p-2 border-t border-border bg-background">
                  <button 
                    onClick={handleExportPDF}
                    className="w-full py-1.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-hover transition-colors"
                  >
                    Generate PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {isExporting && (
        <div className="h-1 bg-border w-full z-10">
          <div 
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Editor Pane */}
        <div className={cn(
          "flex flex-col bg-surface border border-border rounded-xl shadow-inner overflow-hidden transition-all duration-300",
          isEditing ? "w-1/2" : "w-full"
        )}>
          <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-background">
            <span className="font-bold border-b-2 border-primary text-sm py-1 px-1">Konten Mentah</span>
            <button 
               onClick={() => setIsEditing(!isEditing)}
               className="text-xs text-primary hover:underline font-medium"
            >
              {isEditing ? 'Perluas' : 'Tampilan Belah'}
            </button>
          </div>
          <textarea
            className="flex-1 p-6 text-text-primary font-mono text-sm leading-relaxed outline-none resize-none bg-transparent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Preview Pane - Only shows in Split View */}
        {isEditing && (
          <div className="w-1/2 flex flex-col bg-surface border border-border rounded-xl shadow-inner overflow-hidden">
            <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-background">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold border-b-2 border-primary py-1 px-1">Pratinjau Langsung</span>
              </div>
              {isGenerating && (
                 <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Menerima Input...</span>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-background">
               {content ? content.split(/\\n\\n|\n\n/).filter(b => b.trim() !== '').map((block, i) => {
                  const aikenError = format === 'AIKEN' && !isGenerating ? validateAikenBlock(block) : null;
                  return (
                    <div key={i} className={cn("p-6 border rounded-lg shadow-sm bg-surface relative group", aikenError ? "border-red-300 ring-1 ring-red-100" : "border-border")}>
                      <div className={cn("absolute -left-3 top-6 w-6 h-6 text-white text-[10px] flex items-center justify-center rounded font-bold transition-colors", aikenError ? "bg-red-500" : "bg-primary")}>
                         {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-text-primary text-sm md:text-base">
                        {block}
                      </div>
                      {aikenError && (
                        <div className="mt-4 text-xs text-red-600 flex items-start gap-2 bg-red-50 border border-red-100 p-2.5 rounded-md">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p><strong>Format AIKEN Tidak Valid:</strong> {aikenError}</p>
                        </div>
                      )}
                    </div>
                  );
                }) : (
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
