import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Wand2, Settings, Plus, X, UploadCloud, Library, Loader2, ArrowRight, Folder, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Editor from './Editor';

export default function Dashboard() {
  const { user, isGuest, logout } = useAuth();
  
  const [links, setLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState('');
  
  const [questionCount, setQuestionCount] = useState<number>(isGuest ? 5 : 10);
  const [format, setFormat] = useState<'AIKEN' | 'PDF' | 'Esai'>('AIKEN');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLink.trim() && !links.includes(currentLink.trim())) {
      if (links.length >= 10) return; // Limit to 10 files
      setLinks([...links, currentLink.trim()]);
      setCurrentLink('');
    }
  };

  const removeLink = (linkToRemove: string) => {
    setLinks(links.filter(l => l !== linkToRemove));
  };

  const handleGenerate = async () => {
    if (links.length === 0 && !additionalInstructions) return;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    // Show Wow Factor Loading State for a moment before switching
    setTimeout(() => {
      setGeneratedContent(''); // Trigger Editor render
      
      import('../lib/gemini').then(async ({ generateQuizStream }) => {
        await generateQuizStream(
          additionalInstructions,
          links.length,
          format,
          questionCount,
          (chunk) => {
            setGeneratedContent(chunk);
          }
        );
        setIsGenerating(false);
      });
    }, 2500);
  };

  if (generatedContent !== null) {
    return <Editor initialContent={generatedContent} onBack={() => { setGeneratedContent(null); setIsGenerating(false); }} format={format} isGenerating={isGenerating} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden text-gray-900">
      <header className="h-16 bg-[#0056b3] text-white flex items-center justify-between px-8 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Q-Gen <span className="font-light text-blue-100">| Instant Exams, Zero Burnout</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/privacy-policy" className="text-blue-100 hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link to="/terms-of-service" className="text-blue-100 hover:text-white transition-colors">Ketentuan Layanan</Link>
          </nav>
          <div className="flex items-center gap-3 pl-6 border-l border-blue-400">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold">
              {isGuest ? 'G' : 'E'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium hidden sm:block leading-none">{isGuest ? 'Pengguna Tamu' : 'Pendidik'}</span>
              <button onClick={logout} className="text-[10px] text-blue-200 hover:text-white transition-colors text-left mt-1">Keluar</button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-[#f8fafc] border-r border-gray-200 hidden md:flex flex-col p-6 shadow-sm z-10 shrink-0">
          <div className="flex-grow overflow-y-auto space-y-6">
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Pustaka
              </h2>
              <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl bg-white shadow-sm">
                 <Folder className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                 <p className="text-sm font-semibold text-gray-600">Belum ada pustaka</p>
                 <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Penilaian yang Anda simpan ke Google Drive akan muncul di sini.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-100 pt-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700">Status Sistem</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">Terhubung ke Gemini 3.1 Pro. {isGuest ? 'Maksimal 5 soal per sesi.' : 'Fitur Pro aktif.'}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto w-full p-8">
          <div className="max-w-7xl w-full mx-auto space-y-8 pb-32">
          
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Buat Penilaian Baru</h1>
            <p className="text-gray-500 font-medium text-lg">Sediakan materi pembelajaran Anda dan konfigurasikan preferensi keluaran.</p>
          </header>

          {/* Drive Links Input */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[var(--color-primary)]" />
                Materi Pembelajaran
              </h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {links.length} / 10 File
              </span>
            </div>

            <form onSubmit={handleAddLink} className="relative">
              <div className="flex shadow-sm rounded-lg border border-gray-200 focus-within:ring-4 focus-within:ring-[#0056b3]/20 focus-within:border-[#0056b3] transition-all overflow-hidden bg-gray-50">
                <input
                  type="url"
                  placeholder="Tempel tautan Google Drive (Docs, Slides, PDF)..."
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  className="flex-grow px-5 py-4 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!currentLink.trim()}
                  className="px-6 py-4 bg-[#0056b3]/10 text-[#0056b3] hover:bg-[#0056b3] hover:text-white transition-colors font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-[#0056b3]/10 disabled:hover:text-[#0056b3]"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Tautan
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {links.map((link) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={link}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="max-w-[150px] truncate">{link}</span>
                    <button 
                      onClick={() => removeLink(link)}
                      className="ml-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-200/50 p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {links.length === 0 && (
               <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  Tempel tautan di atas atau ketik instruksi di bawah untuk memulai. Penguraian folder rekursif didukung.
               </div>
            )}
          </section>

          {/* Configuration */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Parameter
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Jumlah Soal</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max={isGuest ? 5 : 50}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="flex-grow accent-[#ff8c00]"
                    />
                    <span className="text-lg font-bold text-[#ff8c00] w-8 text-center">{questionCount}</span>
                  </div>
                  {isGuest && <p className="text-xs text-[#ff8c00] font-medium">Batas tamu: 5 soal</p>}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-gray-700">Format Keluaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['AIKEN', 'PDF', 'Esai'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200",
                          format === f 
                            ? "bg-[#ff8c00]/10 border-[#ff8c00] text-[#cf7100]" 
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-lg font-semibold">Konteks Tambahan <span className="text-gray-400 font-normal text-sm">(Opsional)</span></h2>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="misalnya, Fokus spesifik pada Bab 2, buat lebih sulit (Tingkat C4), atau tempel teks di sini..."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:ring-4 focus:ring-[#0056b3]/20 focus:border-[#0056b3] transition-all outline-none"
              />
            </div>
          </section>

        </div>

        {/* Floating Generate Action */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent pointer-events-none flex justify-center pb-8 pt-20">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (links.length === 0 && !additionalInstructions.trim())}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 outline-none",
              isGenerating || (links.length === 0 && !additionalInstructions.trim())
                ? "bg-gray-300 text-gray-500 cursor-not-allowed transform-none scale-100" 
                : "bg-[#ff8c00] text-white hover:bg-[#e67e00] hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(255,140,0,0.6)] focus:ring-4 focus:ring-orange-300/50 active:scale-95"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Sedang Membuat Penilaian...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                Buat {questionCount} Soal
                <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
              </>
            )}
          </button>
        </div>
      </main>
      </div>
      {/* Wow Factor Loading Modal */}
      <AnimatePresence>
        {isGenerating && generatedContent === null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-3xl shadow-2xl border border-blue-100 max-w-sm text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-[#ff8c00]/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-[#0056b3]/10 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[#ff8c00] animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mensintesis Data</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Gemini sedang menganalisis materi Anda, mohon tunggu...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
