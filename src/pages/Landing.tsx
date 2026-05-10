import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Wand2, Download, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  const { login, continueAsGuest } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 space-y-2 py-6 md:px-12 flex justify-between items-center sticky top-0 bg-[var(--color-background)]/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden bg-white">
            <img src="/logo.png" alt="Q-Gen Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Q-Gen</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={continueAsGuest}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Coba Mode Tamu
          </button>
          <button 
            onClick={login}
            className="hidden sm:flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium text-sm">
            <Wand2 className="w-4 h-4" />
            <span>Ditenagai oleh Gemini 3.1 Pro</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
            Ubah Materi Pembelajaran Menjadi <span className="text-[var(--color-primary)]">Kuis Siap Ujian</span> dalam Hitungan Detik.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Q-Gen adalah aplikasi pedagogi bertenaga AI terbaik. Impor langsung dari Google Drive, terapkan Taksonomi Bloom, dan ekspor langsung ke format AIKEN atau PDF.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={login}
              className={cn(
                "flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
                "rounded-lg font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              )}
            >
              Masuk dengan Google
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={continueAsGuest}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-lg transition-colors shadow-sm"
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
            icon={<FileText className="w-8 h-8 text-[var(--color-primary)]" />}
            title="Integrasi Drive"
            description="Jelajahi folder Google Drive secara langsung. Kami membaca Docs, Slides, dan PDF hingga 50 halaman secara otomatis."
          />
          <FeatureCard 
            icon={<Wand2 className="w-8 h-8 text-[var(--color-accent)]" />}
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
      
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
        <p className="mb-2">&copy; {new Date().getFullYear()} Q-Gen Pedagogy Suite. Hak cipta dilindungi undang-undang.</p>
        <div className="flex justify-center gap-4 text-xs">
           <Link to="/privacy-policy" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">Kebijakan Privasi</Link>
           <span>&bull;</span>
           <Link to="/terms-of-service" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">Ketentuan Layanan</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
      <div className="p-4 bg-gray-50 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
