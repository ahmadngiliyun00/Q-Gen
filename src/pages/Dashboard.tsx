import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Wand2, Settings, Plus, X, UploadCloud, Library, Loader2, ArrowRight, Folder, Sparkles, AlertCircle, Globe, Lock, Sun, Moon, Info, Keyboard, Download, Presentation, File, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
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
}

function cleanDriveLink(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.href.replace(/\/$/, '');
  } catch (e) {
    return url.split('?')[0].replace(/\/$/, '');
  }
}

export default function Dashboard() {
  const { user, isGuest, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [currentLink, setCurrentLink] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qgen_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  
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
    
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
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
  const [format, setFormat] = useState<'AIKEN' | 'PDF' | 'Esai'>('AIKEN');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
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

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const url = cleanDriveLink(currentLink.trim());
    if (url && !links.find(l => l.url === url)) {
      if (links.length >= 10) return; // Limit to 10 files
      
      let name = previewTitle || url;
      let isPublic = previewIsPublic;
      let id = '';
      if (url.includes('drive.google.com') && !previewTitle) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        id = match ? match[1] : '';
        name = `Dokumen Google Drive ${id ? '(' + id.substring(0, 8) + '...)' : ''}`;
      }

      const newLinkId = crypto.randomUUID();
      // Add instantly for fast UI feedback
      setLinks(prev => [...prev, { id: newLinkId, url, name, isPublic, mimeType: previewMimeType || undefined }]);
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
    setLinks(links.filter(l => l.id !== idToRemove));
  };

  const abortRef = React.useRef(false);

  const handleCancelGenerate = () => {
    abortRef.current = true;
    setIsGenerating(false);
    setIsGenerateClicked(false);
    setGeneratedContent(null);
    addToast('Info', 'Pembuatan penilaian dibatalkan.', 'default');
  };

  const handleGenerate = async () => {
    if (links.length === 0 && !additionalInstructions) return;
    
    abortRef.current = false;
    setIsGenerateClicked(true);
    setIsGenerating(true);
    setGeneratedContent(null);
    
    import('../lib/gemini').then(async ({ generateQuizStream }) => {
      let isError = false;
      let checkComplete = false;
      let accumulatedText = "";
      
      const finalResult = await generateQuizStream(
        additionalInstructions,
        links.length,
        format,
        questionCount,
        (chunk) => {
          if (abortRef.current) return;
          accumulatedText += chunk;
          
          if (!checkComplete) {
             const upperText = accumulatedText.trimStart().toUpperCase();
             const errorPrefix = "ERROR_INSUFFICIENT_DATA:";
             
             if (upperText.startsWith(errorPrefix)) {
                 isError = true;
                 checkComplete = true;
             } else if (errorPrefix.startsWith(upperText)) {
                 // Still forming the error string, wait for more chunks
                 checkComplete = false;
             } else {
                 // Not an error, so completion check is done
                 checkComplete = true;
             }
          }

          if (isError) {
            const cleanError = accumulatedText.replace(/ERROR_INSUFFICIENT_DATA:/i, '').trim();
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
      
      if (isError) {
        setGeneratedContent(null);
        addToast(
          'Materi Tidak Memadai', 
          accumulatedText.replace(/ERROR_INSUFFICIENT_DATA:/i, '').trim() || 'Input materi tidak memadai untuk dibuatkan soal.', 
          'error',
          { label: 'Ulangi', onClick: handleGenerate }
        );
      } else {
        try {
          const saved = localStorage.getItem('qgen_history');
          let items: QuizHistoryItem[] = saved ? JSON.parse(saved) : [];
          items.unshift({
             id: crypto.randomUUID(),
             date: new Date().toISOString(),
             content: isError ? '' : finalResult, 
             format,
             questionCount
          });
          items = items.slice(0, 10);
          localStorage.setItem('qgen_history', JSON.stringify(items));
          setHistory(items);
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
    localStorage.removeItem('qgen_history');
    addToast('Sukses', 'Riwayat berhasil dihapus', 'default');
  };

  const handleDirectDownload = async (e: React.MouseEvent, item: QuizHistoryItem) => {
    e.stopPropagation();
    if (item.format === 'AIKEN' || item.format === 'Esai') {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qgen-${item.format.toLowerCase()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (item.format === 'PDF') {
      try {
         const { jsPDF } = await import('jspdf');
         const doc = new jsPDF();
         const splitText = doc.splitTextToSize(item.content, 180);
         doc.text(splitText, 15, 20);
         doc.save('qgen-export.pdf');
      } catch (err) {
         console.error(err);
         addToast('Kesalahan', 'Gagal mengunduh PDF', 'error');
      }
    }
  };

  if (generatedContent !== null && !isGenerating) {
    return <Editor initialContent={generatedContent} onBack={() => { setGeneratedContent(null); setIsGenerating(false); setIsGenerateClicked(false); }} format={format} isGenerating={isGenerating} />;
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
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                    title="Hapus Riwayat"
                  >
                    Hapus
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
                <div className="space-y-2">
                  {history.map((item) => (
                     <div key={item.id} className="relative group w-full flex items-center bg-surface border border-border rounded-lg shadow-sm hover:border-primary hover:shadow transition-all overflow-hidden">
                       <button
                          onClick={() => {
                            setFormat(item.format as any);
                            setGeneratedContent(item.content);
                          }}
                          className="flex-1 text-left p-3"
                       >
                          <h3 className="text-sm font-bold text-text-primary mb-1">{item.questionCount} Soal {item.format}</h3>
                          <p className="text-[10px] text-text-muted">{new Date(item.date).toLocaleString('id-ID')}</p>
                       </button>
                       <button
                          onClick={(e) => handleDirectDownload(e, item)}
                          title="Unduh"
                          className="p-3 text-text-muted hover:text-primary transition-colors bg-background hover:bg-primary/10 border-l border-border"
                       >
                          <Download className="w-4 h-4" />
                       </button>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-6 space-y-4">
            <button 
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-2 w-full p-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors"
            >
               <Keyboard className="w-4 h-4" />
               Pintasan Keyboard
            </button>

            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-text-primary">Status Sistem</span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">Terhubung ke Gemini 3.1 Pro. <br/>{isGuest ? 'Maksimal 5 soal per sesi.' : 'Fitur Pro aktif.'}</p>
            </div>

            <div className="flex items-center justify-between bg-background pl-3 rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 py-3">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name || "User"} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {isGuest ? 'G' : 'E'}
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
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
        <div className="max-w-4xl w-full mx-auto space-y-6 pb-4">
          
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary drop-shadow-sm">Buat Penilaian Baru</h1>
            <p className="text-text-muted font-medium text-lg">Sediakan materi pembelajaran Anda dan konfigurasikan preferensi keluaran.</p>
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
                      setLinks(links.filter(l => !selectedLinks.has(l.id)));
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
                  type="url"
                  placeholder="Tempel tautan Google Drive (Docs, Slides, PDF)..."
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  className="flex-grow px-5 py-4 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
                />
                
                {isFetchingTitle && (
                   <div className="absolute right-[150px] top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                   </div>
                )}

                <button
                  id="add-link-btn"
                  type="submit"
                  disabled={!currentLink.trim() || isFetchingTitle}
                  className="px-6 py-4 bg-accent text-white hover:bg-accent-hover transition-colors font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:bg-accent/50 disabled:cursor-not-allowed"
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
                      className="ml-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-full hover:bg-blue-200/50 p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
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
                  <div className="grid grid-cols-3 gap-2">
                    {(['AIKEN', 'PDF', 'Esai'] as const).map((f) => (
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
              <div className="text-xs text-text-secondary bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-lg flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-blue-700 dark:text-blue-400">Tips Prompt yang Baik:</strong> Berikan topik atau paragraf materi konkret jika tidak melampirkan berkas Drive.
                </p>
              </div>
            </div>
          </section>

          {/* Generate Action */}
          <div className="pt-8 pb-4 flex justify-center w-full">
            <button
              id="generate-btn"
              onClick={isGenerating ? handleCancelGenerate : handleGenerate}
              disabled={!isGenerating && links.length === 0 && !additionalInstructions.trim()}
              className={cn(
                "w-full md:w-1/2 justify-center flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl transition-all duration-300 outline-none",
                !isGenerating && links.length === 0 && !additionalInstructions.trim()
                  ? "bg-border text-text-muted cursor-not-allowed transform-none scale-100" 
                  : isGenerating
                  ? "bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300/50 active:scale-[0.98]"
                  : "bg-accent text-white hover:bg-accent-hover focus:ring-4 focus:ring-orange-300/50 active:scale-[0.98]",
                !isGenerateClicked && !isGenerating && links.length > 0 && "animate-button-glow hover:animate-none active:animate-none"
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
                    <span className="opacity-80">Ctrl</span>
                    <span>G</span>
                 </kbd>
               </>
            )}
           </button>
          </div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="w-full bg-surface rounded-xl p-4 sm:p-6 shadow-lg border border-border"
              >
                <div className="w-full text-left">
                  <GenerationProgress isGenerating={isGenerating} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Links */}
          <footer className="mt-8 border-t border-border pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between text-sm text-text-muted">
            <p>© {new Date().getFullYear()} Q-Gen. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">Ketentuan Layanan</Link>
            </div>
          </footer>
        </div>
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
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-primary" />
                    Pintasan Keyboard
                 </h2>
                 <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Buat Penilaian</span>
                    <div className="flex gap-1">
                       <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">Ctrl</kbd>
                       <span className="text-gray-400 font-bold">+</span>
                       <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">G</kbd>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Tambah Tautan Materi</span>
                    <div className="flex gap-1">
                       <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">Ctrl</kbd>
                       <span className="text-gray-400 font-bold">+</span>
                       <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">Enter</kbd>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
