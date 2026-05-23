import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, FileJson, Save, Edit3, CheckCircle2, AlertTriangle, Loader2, ExternalLink, FileText, Sun, Moon, Check, Maximize, Columns, ChevronDown } from 'lucide-react';
import { cn, getExportFilename } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
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
  onSaveContent?: (content: string) => void;
  isSavedToDrive?: boolean;
  onSaveToDrive?: () => void;
  isGuest?: boolean;
}

export default function Editor({ initialContent, onBack, format, isGenerating, questionCount, title, onSaveContent, isSavedToDrive, onSaveToDrive, isGuest }: EditorProps) {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const [content, setContent] = useState(initialContent);
  const [currentFormat, setCurrentFormat] = useState<'AIKEN' | 'Esai'>(format);
  const [isEditing, setIsEditing] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(isSavedToDrive ? 'saved' : 'idle');
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeQuestionNumbers, setIncludeQuestionNumbers] = useState(true);
  const pdfOptionsRef = useRef<HTMLDivElement>(null);
  
  const editorScrollRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSaveContent && content !== initialContent) {
          onSaveContent(content);
          addToast('Sukses', 'Perubahan berhasil disimpan!', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSaveContent, content, initialContent, addToast]);

  const handleEditorScroll = () => {
    if (isSyncingLeftScroll.current) {
      isSyncingLeftScroll.current = false;
      return;
    }
    if (!editorScrollRef.current || !previewScrollRef.current) return;
    
    isSyncingRightScroll.current = true;
    const { scrollTop, scrollHeight, clientHeight } = editorScrollRef.current;
    const percentage = scrollTop / (scrollHeight - clientHeight);
    previewScrollRef.current.scrollTop = percentage * (previewScrollRef.current.scrollHeight - previewScrollRef.current.clientHeight);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    if (isGuest) {
      const maxLines = currentFormat === 'AIKEN' ? 40 : 15;
      const oldLines = content.split('\n').length;
      const newLines = newVal.split('\n').length;
      if (newLines > maxLines && newLines > oldLines) {
        addToast('Batas Tercapai', `User Tamu maksimal ${maxLines} baris untuk format ${currentFormat}.`, 'error');
        return;
      }
    }
    setContent(newVal);
  };

  const handlePreviewScroll = () => {
    if (isSyncingRightScroll.current) {
      isSyncingRightScroll.current = false;
      return;
    }
    if (!editorScrollRef.current || !previewScrollRef.current) return;
    
    isSyncingLeftScroll.current = true;
    const { scrollTop, scrollHeight, clientHeight } = previewScrollRef.current;
    const percentage = scrollTop / (scrollHeight - clientHeight);
    editorScrollRef.current.scrollTop = percentage * (editorScrollRef.current.scrollHeight - editorScrollRef.current.clientHeight);
  };

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
    const extension = currentFormat === 'AIKEN' ? 'txt' : 'doc';
    link.download = getExportFilename(currentFormat, extension);
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
    if (currentFormat === 'AIKEN') {
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
    
    doc.save(getExportFilename(currentFormat, 'pdf'));
    
    setExportProgress(100);
    setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 300);
  };

  const handleSaveToDrive = () => {
    // Simulated Drive Save
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      if (onSaveToDrive) {
        onSaveToDrive();
      }
    }, 1500);
  };

  const currentTitle = title || `${questionCount} Soal ${currentFormat}`;

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden text-text-primary">
      {/* Editor Header */}
      <header className="h-16 bg-primary text-white flex items-center justify-between px-4 md:px-8 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 text-blue-100 hover:text-white transition-colors shrink-0"
            title="Kembali ke Pembuat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
             <div className="w-7 h-7 md:w-8 md:h-8 bg-surface rounded flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate max-w-[150px] md:max-w-xs">{currentTitle}</h1>
            <button
              onClick={() => setCurrentFormat(f => f === 'AIKEN' ? 'Esai' : 'AIKEN')}
              title="Ubah Format"
              className="ml-1 md:ml-2 flex items-center gap-1 bg-blue-800 hover:bg-blue-700 text-blue-100 border border-blue-400/30 hover:border-blue-300 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded font-medium shrink-0 transition-colors"
            >
              {currentFormat}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 relative shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-white/10 text-blue-100 hover:text-white transition-colors hidden md:block"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-6 bg-blue-700/50 mx-0.5 md:mx-1 hidden md:block"></div>

          {onSaveContent && content !== initialContent && (
            <button
              onClick={() => onSaveContent(content)}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 rounded text-xs md:text-sm font-medium transition-colors text-white"
              title="Simpan Perubahan"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Simpan</span>
            </button>
          )}
          
          {isSavedToDrive || saveStatus === 'saved' ? null : (
            <button
              onClick={handleSaveToDrive}
              disabled={saveStatus !== 'idle' || isExporting}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-blue-800 border border-blue-700 hover:bg-blue-700 rounded text-xs md:text-sm font-medium transition-colors disabled:opacity-50 text-blue-50"
              title="Simpan ke Drive"
            >
              {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin text-blue-200 shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
              <span className="hidden md:inline">{saveStatus === 'saving' ? 'Menyimpan...' : 'Drive'}</span>
            </button>
          )}
          
          <div className="w-px h-6 bg-blue-700 mx-0.5 md:mx-1"></div>

          <button
            onClick={handleExportAiken}
            disabled={isExporting}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-surface text-primary hover:bg-background border border-border rounded text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
            title={`Ekspor ke ${currentFormat === 'AIKEN' ? 'AIKEN' : 'DOC'}`}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" /> : (currentFormat === 'AIKEN' ? <FileJson className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />)}
            <span className="hidden md:inline">{currentFormat === 'AIKEN' ? 'AIKEN' : 'DOC'}</span>
          </button>
          
          <div className="relative" ref={pdfOptionsRef}>
            <button
              onClick={() => setShowPdfOptions(!showPdfOptions)}
              disabled={isExporting}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-accent text-white hover:bg-accent-hover rounded text-xs md:text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
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
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 min-h-0">
        {/* Editor Pane */}
        <div className={cn(
          "flex flex-col bg-surface border border-border rounded-xl shadow-inner overflow-hidden transition-all duration-300 flex-1 min-w-0 min-h-0"
        )}>
          <div className="border-b border-border px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-between bg-background">
            <span className="font-bold border-b-2 border-primary text-xs lg:text-sm py-1 px-1">Konten Mentah</span>
            <div className="flex items-center gap-2">
              {onSaveContent && (
                <button
                  onClick={() => {
                     onSaveContent(content);
                     addToast('Sukses', 'Perubahan berhasil disimpan!', 'success');
                  }}
                  disabled={content === initialContent}
                  title={`Simpan (${isMac ? 'Cmd' : 'Ctrl'} + S)`}
                  className={cn(
                    "p-1 md:p-1.5 rounded transition-colors",
                    content !== initialContent 
                      ? "bg-primary text-primary-content hover:bg-primary/90"
                      : "bg-background border border-border text-text-muted cursor-not-allowed opacity-50"
                  )}
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
              <button 
                 onClick={() => setIsEditing(!isEditing)}
                 title={isEditing ? 'Tampilan Penuh' : 'Tampilan Belah'}
                 className="p-1 md:p-1.5 text-text-muted hover:text-primary hover:bg-background rounded transition-colors border border-transparent hover:border-border"
              >
                {isEditing ? <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Columns className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </button>
            </div>
          </div>
          <textarea
            ref={editorScrollRef}
            onScroll={handleEditorScroll}
            className="flex-1 p-4 lg:p-6 text-text-primary font-mono text-sm leading-relaxed outline-none resize-none bg-transparent min-h-0"
            value={content}
            onChange={handleContentChange}
            spellCheck="false"
            placeholder="Tulis konten mentah di sini, atau tempel soal untuk diulas..."
          />
        </div>

        {/* Preview Pane - Only shows in Split View */}
        {isEditing && (
          <div className="flex-[1.5] md:flex-1 flex flex-col bg-surface border border-border rounded-xl shadow-inner overflow-hidden min-w-0 min-h-0">
            <div className="border-b border-border px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-between bg-background">
              <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                <span className="font-bold border-b-2 border-primary py-1 px-1">Pratinjau Langsung</span>
              </div>
              {isGenerating && (
                 <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest hidden sm:block">Menerima Input...</span>
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-accent animate-pulse"></div>
                </div>
              )}
            </div>
            <div 
              ref={previewScrollRef}
              onScroll={handlePreviewScroll}
              className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 bg-background min-h-0"
            >
               {content ? content.split(/\\n\\n|\n\n/).filter(b => b.trim() !== '').map((block, i) => {
                  const aikenError = currentFormat === 'AIKEN' && !isGenerating ? validateAikenBlock(block) : null;
                  return (
                    <div key={i} className={cn("p-4 md:p-6 border rounded-lg shadow-sm bg-surface relative group ml-2 md:ml-0", aikenError ? "border-red-300 ring-1 ring-red-100" : "border-border")}>
                      <div className={cn("absolute -left-3 md:-left-3 top-4 md:top-6 w-5 h-5 md:w-6 md:h-6 text-white text-[9px] md:text-[10px] flex items-center justify-center rounded font-bold transition-colors shadow-sm", aikenError ? "bg-red-500" : "bg-primary")}>
                         {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-text-primary text-sm md:text-base">
                        {block.split('\n').map((line, j) => {
                          if (line.trim().startsWith('ANSWER:')) {
                            return <span key={j} className="text-green-500 dark:text-green-400 font-semibold">{line}<br/></span>;
                          }
                          return <span key={j}>{line}<br/></span>;
                        })}
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
