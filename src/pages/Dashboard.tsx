import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Wand2, Settings, Plus, X, UploadCloud, Library, Loader2, ArrowRight, Folder, Sparkles, AlertCircle, Globe, Lock, Sun, Moon, Info, Keyboard, Download, Presentation, File, LogOut, Edit3, Clipboard, BookmarkPlus, Trash2, Check, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getExportFilename } from '../lib/utils';
import Editor from './Editor';
import { GenerationProgress } from '../components/GenerationProgress';

interface LinkItem {
  id: string;
  url: string;
  name: string;
  isPublic?: boolean;
  mimeType?: string;
}

interface QuizHistoryItem {
  id: string;
  date: string;
  content: string;
  format: string;
  questionCount: number;
  title?: string;
  excerpt?: string;
  isSavedToDrive?: boolean;
}

function cleanDriveLink(url: string) {
  try {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/open?id=${match[1]}`;
    }

    const parsed = new URL(url);
    parsed.search = '';
    return parsed.href.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}

export default function Dashboard() {
  const { user, isGuest, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [renamingItem, setRenamingItem] = useState<QuizHistoryItem | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [savedLinks, setSavedLinks] = useState<LinkItem[]>([]);
  const [currentLink, setCurrentLink] = useState('');

  useEffect(() => {
    try {
      const email = user?.email || 'guest';
      const saved = localStorage.getItem(`qgen_history_${email}`);
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory([]);
      }
      const savedMateri = localStorage.getItem(`qgen_saved_materi_${email}`);
      if (savedMateri) {
        setSavedLinks(JSON.parse(savedMateri));
      } else {
        setSavedLinks([]);
      }
      const savedLinksCurrent = localStorage.getItem(`qgen_current_links_${email}`);
      if (savedLinksCurrent) {
        setLinks(JSON.parse(savedLinksCurrent));
      } else {
        setLinks([]);
      }
      const savedSelected = localStorage.getItem(`qgen_selected_links_${email}`);
      if (savedSelected) {
        setSelectedLinks(new Set(JSON.parse(savedSelected)));
      } else {
        setSelectedLinks(new Set());
      }
      const savedInstructions = localStorage.getItem(`qgen_additional_instructions_${email}`);
      if (savedInstructions) {
        setAdditionalInstructions(savedInstructions);
      } else {
        setAdditionalInstructions('');
      }
      const savedCount = localStorage.getItem(`qgen_question_count_${email}`);
      if (savedCount) {
        setQuestionCount(JSON.parse(savedCount));
      } else {
        setQuestionCount(isGuest ? 5 : 10);
      }
      const savedFormat = localStorage.getItem(`qgen_format_${email}`);
      if (savedFormat) {
        setFormat(savedFormat as any);
      } else {
        setFormat('AIKEN');
      }
    } catch (e) {}
  }, [user?.email, isGuest]);

  
  const [debouncedLink, setDebouncedLink] = useState('');
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewIsPublic, setPreviewIsPublic] = useState<boolean | undefined>(undefined);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLink(currentLink);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentLink]);

  React.useEffect(() => {
    const url = debouncedLink.trim();
    if (!url || !url.includes('drive.google.com')) {
      setPreviewTitle(null);
      setPreviewIsPublic(undefined);
      setPreviewMimeType(null);
      setIsFetchingTitle(false);
      return;
    }
    
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : '';
    
    if (id && user?.accessToken) {
      setIsFetchingTitle(true);
      fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name,permissions,mimeType`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.name) setPreviewTitle(data.name);
          if (data.mimeType) setPreviewMimeType(data.mimeType);
          if (data.permissions) {
            setPreviewIsPublic(data.permissions.some((p: any) => p.type === 'anyone' || p.id === 'anyoneWithLink'));
          } else {
            setPreviewIsPublic(false); // If no permissions returned and it's successful, it's restricted
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsFetchingTitle(false));
    } else {
      setPreviewTitle(null);
      setPreviewIsPublic(undefined);
      setPreviewMimeType(null);
      setIsFetchingTitle(false);
    }
  }, [debouncedLink, user?.accessToken]);
  
  const [questionCount, setQuestionCount] = useState<number>(isGuest ? 5 : 10);
  const [format, setFormat] = useState<'AIKEN' | 'Esai'>('AIKEN');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  useEffect(() => {
    localStorage.setItem(`qgen_current_links_${user?.email || 'guest'}`, JSON.stringify(links));
  }, [links, user?.email]);

  useEffect(() => {
    localStorage.setItem(`qgen_selected_links_${user?.email || 'guest'}`, JSON.stringify(Array.from(selectedLinks)));
  }, [selectedLinks, user?.email]);

  useEffect(() => {
    localStorage.setItem(`qgen_additional_instructions_${user?.email || 'guest'}`, additionalInstructions);
  }, [additionalInstructions, user?.email]);

  useEffect(() => {
    localStorage.setItem(`qgen_question_count_${user?.email || 'guest'}`, JSON.stringify(questionCount));
  }, [questionCount, user?.email]);

  useEffect(() => {
    localStorage.setItem(`qgen_format_${user?.email || 'guest'}`, format);
  }, [format, user?.email]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn && !generateBtn.hasAttribute('disabled')) {
          generateBtn.click();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const addLinkBtn = document.getElementById('add-link-btn');
        if (addLinkBtn && !addLinkBtn.hasAttribute('disabled')) {
          addLinkBtn.click();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSaveToMateri = () => {
    const url = cleanDriveLink(currentLink.trim());
    if (url && !savedLinks.find(l => l.url === url)) {
      const maxSaved = isGuest ? 5 : 25;
      
      let name = previewTitle || url;
      let isPublic = previewIsPublic;
      let mimeType = previewMimeType;
      
      if (!previewTitle && url.includes('drive.google.com')) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        const idMatch = match ? match[1] : '';
        name = `Dokumen Google Drive ${idMatch ? '(' + idMatch.substring(0, 8) + '...)' : ''}`;
      }
      
      const newItem: LinkItem = {
        id: crypto.randomUUID(),
        url,
        name,
        isPublic,
        mimeType: mimeType || undefined
      };
      
      const newSaved = [newItem, ...savedLinks].slice(0, maxSaved);
      setSavedLinks(newSaved);
      localStorage.setItem(`qgen_saved_materi_${user?.email || 'guest'}`, JSON.stringify(newSaved));
      addToast('Tersimpan', 'Materi berhasil disimpan ke sidebar', 'success');
    } else {
      addToast('Info', 'Tautan sudah ada di daftar tersimpan', 'info');
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const url = cleanDriveLink(currentLink.trim());
    if (url && !links.find(l => l.url === url)) {
      if (links.length >= 10) return; // Limit to 10 files
      
      let name = previewTitle || url;
      let isPublic = previewIsPublic;
      let id = '';
      if (url.includes('drive.google.com') && !previewTitle) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        id = match ? match[1] : '';
        name = `Dokumen Google Drive ${id ? '(' + id.substring(0, 8) + '...)' : ''}`;
      }

      const newLinkId = crypto.randomUUID();
      // Add instantly for fast UI feedback
      setLinks(prev => [...prev, { id: newLinkId, url, name, isPublic, mimeType: previewMimeType || undefined }]);
      setSelectedLinks(prev => {
        const newSet = new Set(prev);
        newSet.add(newLinkId);
        return newSet;
      });
      setCurrentLink('');
      setPreviewTitle(null);
      setPreviewIsPublic(undefined);
      setPreviewMimeType(null);

      // Fetch the real name in the background if we couldn't get it in preview
      if (id && (!previewTitle || !previewMimeType) && user?.accessToken) {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name,permissions,mimeType`, {
          headers: { 'Authorization': `Bearer ${user.accessToken}` }
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Gagal mengambil nama file');
        })
        .then(data => {
          if (data) {
             let fetchedIsPublic = undefined;
             if (data.permissions) {
               fetchedIsPublic = data.permissions.some((p: any) => p.type === 'anyone' || p.id === 'anyoneWithLink');
             } else {
               fetchedIsPublic = false;
             }
             setLinks(prev => prev.map(l => l.id === newLinkId ? { ...l, name: data.name || l.name, isPublic: fetchedIsPublic, mimeType: data.mimeType || l.mimeType } : l));
          }
        })
        .catch(error => {
          console.error("Gagal mengambil nama file:", error);
        });
      }
    }
  };

  const removeLink = (idToRemove: string) => {
    setLinks(prev => prev.filter(l => l.id !== idToRemove));
    setSelectedLinks(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(idToRemove);
      return newSelected;
    });
  };

  const abortRef = React.useRef(false);

  const handleCancelGenerate = () => {
    abortRef.current = true;
    setIsGenerating(false);
    setIsGenerateClicked(false);
    setGeneratedContent(null);
    addToast('Info', 'Pembuatan penilaian dibatalkan.', 'info');
  };

  const handleGenerate = async () => {
    if (selectedLinks.size === 0 && !additionalInstructions.trim()) return;
    
    abortRef.current = false;
    setIsGenerateClicked(true);
    setIsGenerating(true);
    setGeneratedContent(null);
    
    import('../lib/gemini').then(async ({ generateQuizStream }) => {
      let isError = false;
      let checkComplete = false;
      let accumulatedText = "";
      
      const activeLinkTitles = links.filter(l => selectedLinks.has(l.id)).map(l => l.name);

      const finalResult = await generateQuizStream(
        additionalInstructions,
        activeLinkTitles,
        format,
        questionCount,
        (chunk) => {
          if (abortRef.current) return;
          accumulatedText = chunk;
          
          if (!checkComplete) {
             const upperText = accumulatedText.trimStart().toUpperCase();
             if (upperText.includes("ERROR_INSUFFICIENT_DATA") || upperText.includes("KESALAHAN SAAT MEMBUAT SOAL")) {
                 isError = true;
                 checkComplete = true;
             } else if (upperText.length > 40) {
                 checkComplete = true;
             }
          } else {
             const upperAccumulated = accumulatedText.trimStart().toUpperCase();
             if (upperAccumulated.includes("ERROR_INSUFFICIENT_DATA") || upperAccumulated.includes("KESALAHAN SAAT MEMBUAT SOAL")) {
                 isError = true;
             }
          }

          if (isError) {
             setGeneratedContent(null);
          } else {
              if (checkComplete) {
                setGeneratedContent(accumulatedText);
              }
          }
        }
      );
      
      if (abortRef.current) return;
      
      setIsGenerating(false);
      setIsGenerateClicked(false);
      
      const finalUpper = finalResult.trimStart().toUpperCase();
      if (finalUpper.includes("ERROR_INSUFFICIENT_DATA") || finalUpper.includes("KESALAHAN SAAT MEMBUAT SOAL")) {
          isError = true;
      }
      
      if (isError) {
        setGeneratedContent(null);
        addToast(
          'Materi Tidak Memadai', 
          finalResult.replace(/\*?\*?ERROR_INSUFFICIENT_DATA:?\*?\*?\s*/i, '').trim() || 'Input materi tidak memadai untuk dibuatkan soal atau terjadi kesalahan server.', 
          'error',
          { label: 'Ulangi', onClick: handleGenerate }
        );
      } else {
        try {
          const saved = localStorage.getItem(`qgen_history_${user?.email || 'guest'}`);
          let items: QuizHistoryItem[] = saved ? JSON.parse(saved) : [];
          
          const title = `${questionCount} Soal ${format}`;
          const rawExcerpt = additionalInstructions || activeLinkTitles.join(', ') || finalResult.substring(0, 60);
          const excerpt = rawExcerpt.substring(0, 70) + (rawExcerpt.length > 70 ? '...' : '');

          items.unshift({
             id: crypto.randomUUID(),
             date: new Date().toISOString(),
             content: isError ? '' : finalResult, 
             format,
             questionCount,
             title,
             excerpt
          });
          items = items.slice(0, isGuest ? 3 : 25);
          localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(items));
          setHistory(items);
          setLinks([]);
          setSelectedLinks(new Set());
          setAdditionalInstructions('');
          setQuestionCount(isGuest ? 5 : 10);
          setFormat('AIKEN');
        } catch (e) {
          console.error("Failed to save history", e);
        }
      }
    }).catch(error => {
      if (abortRef.current) return;
      console.error(error);
      setIsGenerating(false);
      setIsGenerateClicked(false);
      setGeneratedContent(null);
      addToast(
        'Kesalahan Sistem', 
        'Gagal memproses soal. Silakan coba lagi.', 
        'error',
        { label: 'Ulangi', onClick: handleGenerate }
      );
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`qgen_history_${user?.email || 'guest'}`);
    addToast('Sukses', 'Riwayat berhasil dihapus', 'success');
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingItem && renameInput.trim()) {
      const newHistory = history.map(h => h.id === renamingItem.id ? { ...h, title: renameInput.trim() } : h);
      setHistory(newHistory);
      localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
      addToast('Sukses', 'Nama riwayat berhasil diubah', 'success');
      setRenamingItem(null);
      setRenameInput('');
    }
  };

  const handleExportData = () => {
    const data = { history, savedLinks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qgen-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Sukses', 'Data berhasil diekspor', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          if (data && (Array.isArray(data.history) || Array.isArray(data.savedLinks))) {
            const newHistory = Array.isArray(data.history) ? data.history.slice(0, isGuest ? 3 : 25) : [];
            const newSavedLinks = Array.isArray(data.savedLinks) ? data.savedLinks.slice(0, isGuest ? 5 : 25) : [];
            
            setHistory(newHistory);
            setSavedLinks(newSavedLinks);
            localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
            localStorage.setItem(`qgen_saved_materi_${user?.email || 'guest'}`, JSON.stringify(newSavedLinks));
            
            addToast('Sukses', 'Data berhasil diimpor', 'success');
          } else {
            addToast('Kesalahan', 'Format data tidak valid', 'error');
          }
        } catch (err) {
          addToast('Kesalahan', 'Gagal memproses berkas', 'error');
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDirectDownload = async (e: React.MouseEvent, item: QuizHistoryItem) => {
    e.stopPropagation();
    if (item.format === 'AIKEN' || item.format === 'Esai') {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getExportFilename(item.format, 'txt');
      link.click();
      URL.revokeObjectURL(url);
    } else if (item.format === 'PDF') {
      try {
         const { jsPDF } = await import('jspdf');
         const doc = new jsPDF();
         const splitText = doc.splitTextToSize(item.content, 180);
         
         let y = 20;
         const pageHeight = doc.internal.pageSize.height;
         for (let i = 0; i < splitText.length; i++) {
           if (y > pageHeight - 20) {
             doc.addPage();
             y = 20;
           }
           doc.text(splitText[i], 15, y);
           y += 6;
         }
         
         doc.save(getExportFilename(item.format, 'pdf'));
      } catch (err) {
         console.error(err);
         addToast('Kesalahan', 'Gagal mengunduh PDF', 'error');
      }
    }
  };

  if (generatedContent !== null && !isGenerating) {
    const activeItem = history.find(h => h.content === generatedContent);
    return <Editor 
             initialContent={generatedContent} 
             onBack={() => { setGeneratedContent(null); setIsGenerating(false); setIsGenerateClicked(false); }} 
             format={activeItem?.format as 'AIKEN'|'Esai' || format} 
             isGenerating={isGenerating} 
             questionCount={activeItem?.questionCount || questionCount} 
             title={activeItem?.title}
             isSavedToDrive={activeItem?.isSavedToDrive}
             onSaveToDrive={() => {
                if (activeItem) {
                  const newHistory = history.map(h => h.id === activeItem.id ? { ...h, isSavedToDrive: true } : h);
                  setHistory(newHistory);
                  localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
                } else {
                  const newItem: QuizHistoryItem = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    content: generatedContent,
                    format: format,
                    questionCount: questionCount,
                    title: 'Editor',
                    excerpt: generatedContent.split('\n')[0].substring(0, 100),
                    isSavedToDrive: true
                  };
                  const newHistory = [newItem, ...history];
                  setHistory(newHistory);
                  localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
                }
             }}
             onSaveContent={(newContent) => {
               if (activeItem) {
                 const newHistory = history.map(h => h.id === activeItem.id ? { ...h, content: newContent } : h);
                 setHistory(newHistory);
                 localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
               } else {
                 const newItem: QuizHistoryItem = {
                   id: crypto.randomUUID(),
                   date: new Date().toISOString(),
                   content: newContent,
                   format: format,
                   questionCount: questionCount,
                   title: 'Editor',
                   excerpt: newContent.split('\n')[0].substring(0, 100)
                 };
                 const newHistory = [newItem, ...history];
                 setHistory(newHistory);
                 localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
               }
               setGeneratedContent(newContent);
             }}
           />;
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans overflow-hidden text-text-primary">
      <header className="h-16 bg-primary text-white flex items-center justify-between px-8 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 bg-white flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Q-Gen" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Q-Gen <span className="hidden md:inline font-light text-blue-100">| Instant Exams, Zero Burnout</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => {
                setGeneratedContent('');
                setIsGenerateClicked(false);
                setIsGenerating(false);
             }}
             title="Buka Editor Kosong"
             className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/80 hover:bg-blue-700 transition-colors text-blue-50 text-sm font-medium"
          >
             <Edit3 className="w-4 h-4" />
             Editor
          </button>
          <button 
             onClick={() => {
                setGeneratedContent('');
                setIsGenerateClicked(false);
                setIsGenerating(false);
             }}
             className="sm:hidden p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors text-blue-100"
             title="Buka Editor Kosong"
          >
             <Edit3 className="w-4 h-4" />
          </button>
          <button 
             onClick={() => setIsLibraryOpen(true)}
             className="lg:hidden p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors text-blue-100"
          >
            <Library className="w-4 h-4" />
          </button>
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors text-blue-100"
             title={theme === 'dark' ? 'Matikan Mode Gelap' : 'Aktifkan Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsLibraryOpen(false)}
            />
          )}
        </AnimatePresence>
        <aside className={cn(
          "fixed top-0 left-0 z-50 h-[100vh] w-80 bg-surface border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:h-full lg:translate-x-0 flex flex-col p-6 shrink-0",
          isLibraryOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Close button for mobile inside drawer */}
          <div className="flex lg:hidden justify-end mb-4">
            <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-text-muted hover:bg-background rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Riwayat Pustaka
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-surface rounded-md transition-colors"
                    title="Hapus Riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl bg-background shadow-sm">
                   <Folder className="w-8 h-8 text-border-hover mx-auto mb-3" />
                   <p className="text-sm font-semibold text-text-secondary">Belum ada pustaka</p>
                   <p className="text-xs text-text-muted mt-1.5 leading-relaxed">Penilaian yang Anda hasilkan akan muncul di sini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {history.map((item) => (
                     <div key={item.id} className="relative group w-full flex items-center bg-surface border border-border rounded-lg shadow-sm hover:border-primary hover:shadow transition-all overflow-hidden p-2">
                       <div className="shrink-0 pr-1 mr-1 border-r border-border/50">
                         <button
                            onClick={(e) => {
                               e.stopPropagation();
                               const newHistory = history.filter(h => h.id !== item.id);
                               setHistory(newHistory);
                               localStorage.setItem(`qgen_history_${user?.email || 'guest'}`, JSON.stringify(newHistory));
                            }}
                            title="Hapus Penilaian"
                            className="p-2 text-text-muted hover:text-red-500 bg-background hover:bg-red-500/10 rounded-md transition-colors"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       <button
                          onClick={() => {
                            setFormat(item.format as any);
                            setGeneratedContent(item.content);
                            setQuestionCount(item.questionCount);
                          }}
                          className="flex-1 text-left p-1.5 focus:outline-none min-w-0 ml-1"
                       >
                          <div className="flex items-start justify-between">
                            <h3 className="text-[13px] font-bold text-text-primary mb-1 truncate" title={item.title || `${item.questionCount} Soal ${item.format}`}>
                               {item.title || `${item.questionCount} Soal ${item.format}`}
                            </h3>
                          </div>
                          {item.excerpt && <p className="text-[11px] text-text-muted line-clamp-2 leading-tight mb-1">{item.excerpt}</p>}
                          <p className="text-[9px] text-text-tertiary font-mono font-medium">{new Date(item.date).toLocaleString('id-ID')}</p>
                       </button>
                       <div className="shrink-0 flex items-center gap-1 pl-1 ml-1 border-l border-border/50">
                         <button
                            onClick={(e) => {
                               e.stopPropagation();
                               setRenamingItem(item);
                               setRenameInput(item.title || `${item.questionCount} Soal ${item.format}`);
                            }}
                            title="Ubah Nama"
                            className="p-2 text-text-muted hover:text-primary bg-background hover:bg-border rounded-md transition-colors"
                         >
                            <Edit3 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-6">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4" />
                  Materi Tersimpan
                </h2>
                {savedLinks.length > 0 && (
                  <button 
                    onClick={() => {
                      setSavedLinks([]);
                      localStorage.removeItem(`qgen_saved_materi_${user?.email || 'guest'}`);
                    }}
                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-surface rounded-md transition-colors"
                    title="Kosongkan Pustaka Materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {savedLinks.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-border rounded-xl bg-background shadow-sm">
                   <p className="text-[11px] text-text-muted leading-relaxed">Belum ada materi tersimpan.<br/>Simpan materi melalui input utama.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {savedLinks.map((item) => (
                     <div key={item.id} className="relative group w-full flex items-center bg-surface border border-border rounded-lg shadow-sm hover:border-primary hover:shadow transition-all overflow-hidden p-2">
                       <div className="shrink-0 pr-1 mr-1 border-r border-border/50">
                         <button
                            onClick={(e) => {
                               e.stopPropagation();
                               const newSaved = savedLinks.filter(l => l.id !== item.id);
                               setSavedLinks(newSaved);
                               localStorage.setItem(`qgen_saved_materi_${user?.email || 'guest'}`, JSON.stringify(newSaved));
                            }}
                            title="Hapus Materi"
                            className="p-2 text-text-muted hover:text-red-500 bg-background hover:bg-red-500/10 rounded-md transition-colors"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       <div className="flex-1 min-w-0 pl-1 pr-3 ml-1">
                         <h3 className="text-[13px] font-bold text-text-primary mb-1 truncate" title={item.name}>{item.name}</h3>
                         <p className="text-[10px] text-text-muted truncate opacity-80 font-mono" title={item.url}>
                           {item.url.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || item.url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || item.url.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1] || item.url}
                         </p>
                       </div>
                       <div className="flex shrink-0 items-center justify-end gap-1.5 border-l border-border/50 pl-1 ml-1">
                         <button
                            onClick={(e) => {
                               e.stopPropagation();
                               if (!links.find(l => l.url === item.url)) {
                                 if (links.length >= 10) {
                                   addToast('Penuh', 'Maksimal 10 tautan dapat ditambah', 'error');
                                 } else {
                                   const newLinkId = crypto.randomUUID();
                                   setLinks(prev => [...prev, { ...item, id: newLinkId }]);
                                   setSelectedLinks(prev => {
                                      const newSet = new Set(prev);
                                      newSet.add(newLinkId);
                                      return newSet;
                                   });
                                 }
                               }
                            }}
                            title={links.some(l => l.url === item.url) ? "Sudah ada di daftar" : "Tambahkan ke Penilaian"}
                            disabled={links.some(l => l.url === item.url)}
                            className={`p-2 border rounded-md shadow-sm transition-colors ${
                               links.some(l => l.url === item.url)
                               ? "border-green-500/30 text-green-500 bg-green-500/10 cursor-not-allowed" 
                               : "border-primary/20 text-primary hover:bg-primary hover:text-white"
                            }`}
                         >
                            {links.some(l => l.url === item.url) ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                         </button>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => setShowShortcuts(true)}
                className="flex items-center gap-2 w-full p-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors"
              >
                 <Keyboard className="w-4 h-4" />
                 Pintasan Keyboard
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleExportData}
                  className="flex-1 flex justify-center items-center gap-2 p-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border"
                >
                  <Download className="w-4 h-4" />
                  Ekspor Data
                </button>
                <label className="flex-1 flex justify-center items-center gap-2 p-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer">
                  <UploadCloud className="w-4 h-4" />
                  Impor Data
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-text-primary">Status Sistem</span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">Terhubung ke Gemini 3.1 Pro. <br/>{isGuest ? 'Maksimal 5 soal per sesi.' : 'Fitur Pro aktif.'}</p>
            </div>

            <div className="flex items-center justify-between bg-background pl-3 rounded-xl border border-border shadow-sm overflow-hidden mt-4">
              <div className="flex items-center gap-3 py-3">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name || "User"} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : (isGuest ? 'G' : 'E')}
                  </div>
                )}
                <span className="text-sm font-semibold text-text-primary">{user?.name || (isGuest ? 'Pengguna Tamu' : 'Pendidik')}</span>
              </div>
              <button 
                onClick={logout} 
                title="Keluar"
                className="self-stretch px-4 text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center font-semibold text-[13px]"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-6 border-t border-border pt-4 flex flex-col items-center justify-center gap-2 text-[10px] text-text-tertiary">
              <div className="flex items-center gap-4">
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
                <Link to="/terms-of-service" className="hover:text-primary transition-colors">Ketentuan Layanan</Link>
              </div>
              <p>© {new Date().getFullYear()} Q-Gen. All rights reserved.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
        <div className="max-w-4xl w-full mx-auto space-y-6 pb-4">
          
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary drop-shadow-sm">Buat Paket Soal Baru</h1>
            <p className="text-text-muted font-medium text-lg">Sediakan materi pembelajaran Anda dan atur format kuis yang diinginkan.</p>
          </header>

          {/* Drive Links Input */}
          <section className="bg-surface rounded-2xl shadow-lg border border-border p-5 sm:p-7 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
                <UploadCloud className="w-5 h-5 text-primary" />
                Materi Pembelajaran
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {links.length > 0 && selectedLinks.size > 0 && (
                  <button 
                    onClick={() => {
                      setLinks(prev => prev.filter(l => !selectedLinks.has(l.id)));
                      setSelectedLinks(new Set());
                    }}
                    className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Hapus ({selectedLinks.size})
                  </button>
                )}
                {links.length > 0 && (
                  <label className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-background px-2.5 py-1.5 rounded-full cursor-pointer hover:bg-border transition-colors">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLinks(new Set(links.map(l => l.id)));
                        else setSelectedLinks(new Set());
                      }}
                      checked={links.length > 0 && selectedLinks.size === links.length}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    Pilih Semua
                  </label>
                )}
                <span className="text-xs font-medium text-text-muted bg-background px-2.5 py-1.5 rounded-full">
                  {links.length} / 10
                </span>
              </div>
            </div>

            <form onSubmit={handleAddLink} className="relative">
              <div className="flex shadow-sm rounded-lg border border-border focus-within:ring-4 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden bg-background">
                <input
                  type="text"
                  placeholder="Tempel tautan Google Drive (Docs, Slides, PDF)..."
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const addBtn = document.getElementById('add-link-btn');
                        if (addBtn && !addBtn.hasAttribute('disabled')) {
                           addBtn.click();
                        }
                     }
                  }}
                  className="flex-grow px-5 py-4 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
                />
                
                {currentLink.length < 15 && (
                  <button
                    type="button"
                    title="Tempel dari Clipboard"
                    onClick={async () => {
                       try {
                         const text = await navigator.clipboard.readText();
                         if (text) setCurrentLink(text);
                       } catch (err) {
                         addToast('Gagal', 'Tidak dapat mengakses clipboard', 'error');
                       }
                    }}
                    className="self-center mr-2 p-2 text-text-muted hover:text-primary hover:bg-surface rounded-md transition-colors"
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                )}

                {isFetchingTitle && (
                   <div className="absolute right-[150px] top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                   </div>
                )}

                {currentLink.length >= 15 && (
                  <button
                    type="button"
                    title="Simpan ke Materi Pembelajaran"
                    onClick={handleSaveToMateri}
                    disabled={isFetchingTitle}
                    className="self-center mr-2 p-2 text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-50"
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                )}

                <button
                  id="add-link-btn"
                  type="submit"
                  disabled={!currentLink.trim()}
                  className="px-6 py-4 bg-accent text-white hover:bg-accent-hover transition-colors font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Tambah Tautan</span>
                  <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] uppercase font-mono bg-white/20 rounded text-white border border-white/30">Enter</kbd>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {links.map((link) => {
                  let fileColorStyle = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200";
                  if (link.mimeType?.includes('presentation')) fileColorStyle = "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200";
                  else if (link.mimeType?.includes('pdf')) fileColorStyle = "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200";
                  else if (link.mimeType?.includes('document')) fileColorStyle = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200";
                  
                  return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={link.id}
                    className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5 border", fileColorStyle)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedLinks.has(link.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedLinks);
                        if (e.target.checked) newSet.add(link.id);
                        else newSet.delete(link.id);
                        setSelectedLinks(newSet);
                      }}
                      className="rounded border-border text-primary w-3.5 h-3.5 cursor-pointer bg-surface"
                    />
                    {(() => {
                       if (!link.mimeType) return <FileText className="w-3.5 h-3.5" />;
                       if (link.mimeType.includes('presentation')) return <Presentation className="w-3.5 h-3.5" />;
                       if (link.mimeType.includes('pdf')) return <File className="w-3.5 h-3.5" />;
                       return <FileText className="w-3.5 h-3.5" />;
                    })()}
                    <span className="max-w-[150px] truncate" title={link.url}>{link.name}</span>
                    
                    {link.isPublic !== undefined && (
                       <div 
                         className={cn(
                           "flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border",
                           link.isPublic 
                              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                              : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                         )}
                         title={link.isPublic ? "Dapat diakses Publik" : "Hanya Baca / Terbatas"}
                       >
                         {link.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                         <span>{link.isPublic ? 'Public' : 'Read-Only'}</span>
                       </div>
                    )}

                    <button 
                      onClick={() => removeLink(link.id)}
                      title="Hapus referensi ini"
                      className="ml-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )})}
              </AnimatePresence>
            </div>
            {links.length === 0 && (
               <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-text-muted text-sm">
                  Tempel tautan di atas atau ketik instruksi di bawah untuk memulai. Penguraian folder rekursif didukung.
               </div>
            )}
          </section>

          {/* Configuration */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl shadow-lg border border-border p-5 sm:p-7 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
                <Settings className="w-5 h-5 text-text-muted" />
                Parameter
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Jumlah Soal</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max={isGuest ? 5 : 50}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="flex-grow accent-accent"
                    />
                    <span className="text-lg font-bold text-accent w-8 text-center">{questionCount}</span>
                  </div>
                  {isGuest && <p className="text-xs text-accent font-medium">Batas tamu: 5 soal</p>}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-text-secondary">Format Keluaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['AIKEN', 'Esai'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200",
                          format === f 
                            ? "bg-accent/10 border-accent text-accent" 
                            : "bg-surface border-border text-text-secondary hover:border-border-hover hover:bg-background"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-lg border border-border p-5 sm:p-7 space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-lg font-semibold text-text-primary">Konteks Tambahan <span className="text-text-muted font-normal text-sm">(Opsional)</span></h2>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="misalnya, Fokus spesifik pada Bab 2, buat lebih sulit (Tingkat C4)..."
                className="w-full h-32 p-4 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted resize-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
              <div className="text-xs text-blue-50 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 border border-blue-600/50 p-4 md:p-5 rounded-xl flex items-start gap-3 md:gap-4 shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 blur-md rounded-full opacity-60"></div>
                  <Lightbulb className="w-5 h-5 text-amber-200 shrink-0 relative z-10" />
                </div>
                <p className="leading-relaxed font-medium">
                  <strong className="text-white font-bold block mb-1">Tips Prompt yang Baik</strong> 
                  Berikan topik atau paragraf materi konkret jika tidak melampirkan berkas Drive.
                </p>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                 initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                 animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                 exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                 className="w-full bg-surface rounded-xl p-4 sm:p-6 shadow-lg border border-border"
              >
                 <div className="w-full text-left">
                   <GenerationProgress isGenerating={isGenerating} />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Action */}
          <div className="pt-4 pb-4 flex justify-center w-full">
            <button
              id="generate-btn"
              onClick={isGenerating ? handleCancelGenerate : handleGenerate}
              disabled={!isGenerating && selectedLinks.size === 0 && !additionalInstructions.trim()}
              className={cn(
                "w-full md:w-1/2 justify-center flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl transition-all duration-300 outline-none",
                !isGenerating && selectedLinks.size === 0 && !additionalInstructions.trim()
                  ? "bg-border text-text-muted cursor-not-allowed transform-none scale-100" 
                  : isGenerating
                  ? "bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300/50 active:scale-[0.98]"
                  : "bg-accent text-white hover:bg-accent-hover focus:ring-4 focus:ring-orange-300/50 active:scale-[0.98]",
                !isGenerateClicked && !isGenerating && selectedLinks.size > 0 && "animate-button-glow hover:animate-none active:animate-none"
              )}
            >
            {isGenerating ? (
              <>
                <X className="w-6 h-6" />
                Batalkan Pembuatan
              </>
            ) : (
               <>
                 <Wand2 className="w-6 h-6" />
                 Buat {questionCount} Soal
                 <kbd className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-1 bg-black/10 text-white/90 text-[11px] font-mono rounded ring-1 ring-white/20">
                    <span className="opacity-80">{isMac ? '⌘' : 'Ctrl'}</span>
                    <span>G</span>
                 </kbd>
               </>
            )}
           </button>
          </div>
        </div>
        <footer className="mt-8 py-6 text-center text-text-muted text-sm border-t border-border/50 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Q-Gen | Instant Exams, Zero Burnout. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
             <Link to="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors">Kebijakan Privasi</Link>
             <span className="text-border">&bull;</span>
             <Link to="/terms-of-service" className="text-text-secondary hover:text-primary transition-colors">Ketentuan Layanan</Link>
          </div>
        </footer>
      </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl p-6 max-w-md w-full border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-primary" />
                    Pintasan Keyboard
                 </h2>
                 <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-background rounded-full transition-colors text-text-muted">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <span className="text-sm font-medium text-text-secondary">Buat Penilaian</span>
                    <div className="flex items-center gap-1.5">
                       <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono font-bold text-text-primary shadow-sm">{isMac ? 'Cmd ⌘' : 'Ctrl'}</kbd>
                       <span className="text-text-muted font-bold">+</span>
                       <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono font-bold text-text-primary shadow-sm">G</kbd>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <span className="text-sm font-medium text-text-secondary">Tambah Tautan Materi</span>
                    <div className="flex gap-1">
                       <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono font-bold text-text-primary shadow-sm">Enter</kbd>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Rename */}
      <AnimatePresence>
        {renamingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setRenamingItem(null); setRenameInput(''); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-xl p-6 w-full max-w-sm border border-border"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Ubah Nama Riwayat</h2>
              <form onSubmit={handleRenameSubmit}>
                <input
                  type="text"
                  autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full px-4 py-2 border border-border bg-background rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
                  placeholder="Nama riwayat..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setRenamingItem(null); setRenameInput(''); }}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!renameInput.trim()}
                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
