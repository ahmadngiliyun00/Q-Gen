import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Wand2, Download, LogIn, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  const { user, isGuest, login, continueAsGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user || isGuest) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isGuest, navigate]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-text-primary">
      <header className="px-6 space-y-2 py-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden bg-surface">
            <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">Q-Gen</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-full hover:bg-background transition-colors text-text-secondary"
             title={theme === 'dark' ? 'Matikan Mode Gelap' : 'Aktifkan Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={continueAsGuest}
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Coba Mode Tamu
          </button>
          <button 
            onClick={login}
            className="hidden sm:flex items-center gap-2 bg-surface border border-border shadow-sm px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-background transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login Pendidik
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto space-y-16 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm">
            <Wand2 className="w-4 h-4" />
            <span>Ditenagai oleh Gemini 3.1 Pro</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-tight">
            Ubah Materi Pembelajaran Menjadi <span className="text-primary">Kuis Siap Ujian</span> dalam Hitungan Detik.
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-accent mt-4">
            Instant Exams, Zero Burnout.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mt-6">
            Kami memahami bahwa waktu pendidik sangat berharga. Terjebak dalam rutinitas administratif menyusun soal hanyalah memicu <em>burnout</em> dan merampas energi yang seharusnya diberikan kepada siswa. Q-Gen membebaskan Anda dari tugas yang melelahkan ini: impor materi Anda, terapkan Taksonomi Bloom, dan dapatkan soal yang 100% siap pakai.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={login}
              className={cn(
                "flex items-center gap-2 px-8 py-4 bg-accent text-white hover:bg-accent-hover",
                "rounded-lg font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              )}
            >
              Masuk dengan Google
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={continueAsGuest}
              className="flex items-center gap-2 px-8 py-4 bg-surface border border-border text-text-primary hover:bg-background rounded-lg font-semibold text-lg transition-colors shadow-sm"
            >
              Lanjutkan sebagai Tamu (5 Soal)
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-primary" />}
            title="Integrasi Drive"
            description="Jelajahi folder Google Drive secara langsung. Kami membaca Docs, Slides, dan PDF hingga 50 halaman secara otomatis."
          />
          <FeatureCard 
            icon={<Wand2 className="w-8 h-8 text-accent" />}
            title="Mesin AI Pedagogi"
            description="Menghasilkan soal tingkat C2-C4 berdasarkan Taksonomi Bloom yang ketat dengan pengecoh logis yang cerdas."
          />
          <FeatureCard 
            icon={<Download className="w-8 h-8 text-emerald-600" />}
            title="Siap LMS & Cetak"
            description="Ekspor ke format AIKEN yang ketat untuk Moodle, atau PDF profesional siap cetak dengan Kunci Jawaban."
          />
        </motion.div>
      </main>
      
      <footer className="py-8 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 max-h-screen flex flex-col md:flex-row items-center justify-between text-sm text-text-muted gap-4">
          <p>&copy; 2026 Q-Gen | Instant Exams, Zero Burnout. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
             <Link to="/privacy-policy" className="text-text-secondary hover:text-primary transition-colors">Kebijakan Privasi</Link>
             <span className="text-border">&bull;</span>
             <Link to="/terms-of-service" className="text-text-secondary hover:text-primary transition-colors">Ketentuan Layanan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
      <div className="p-4 bg-background rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
