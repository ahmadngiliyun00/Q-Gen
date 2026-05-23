import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const privacyPolicyMd = `
# Kebijakan Privasi (Privacy Policy)

**Tanggal Berlaku:** 10 Mei 2026

## 1. Pengantar
Selamat datang di Q-Gen (Quiz Generator), dapat diakses melalui [https://q-gen-150840590811.asia-southeast1.run.app](https://q-gen-150840590811.asia-southeast1.run.app). Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda menggunakan layanan kami.

## 2. Informasi yang Kami Kumpulkan
Saat Anda menggunakan Q-Gen, kami dapat mengakses dan mengumpulkan jenis informasi berikut:
- **Informasi Akun:** Alamat email Anda yang digunakan saat Anda melakukan otentikasi melalui Google ("Login with Google").
- **Data Google Drive:** Kami mengakses file dan folder di akun Google Drive Anda setelah Anda memberikan izin secara eksplisit.
- **Konten Dokumen:** Teks di dalam dokumen yang Anda pilih (seperti Docs, Slides, Sheets, PDF, TXT, JSON) untuk keperluan ekstraksi dan pembuatan kuis.

## 3. Penggunaan Data Google Drive
Q-Gen mematuhi sepenuhnya kebijakan data pengguna API Google. Penggunaan informasi yang diterima dari Google APIs oleh aplikasi mematuhi [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), termasuk persyaratan Penggunaan Terbatas (Limited Use).
- Q-Gen menggunakan akses Google Drive **hanya** untuk mengambil teks dari materi yang Anda tentukan guna diubah menjadi pertanyaan kuis.
- File hasil (kuis yang di-generate) disimpan kembali ke Google Drive Anda ke dalam folder khusus ("Q-Gen_Library").
- Kami **tidak pernah** menggunakan data Google Drive Anda untuk tujuan periklanan atau melacak pengguna.

## 4. Pemrosesan Data oleh AI
Aplikasi kami mengintegrasikan teknologi Google Gemini API untuk memproses materi pembelajaran Anda:
- **Pengiriman ke AI:** Teks dari dokumen Anda akan dikirim sementara dan diproses oleh Google Gemini API untuk menghasilkan soal-soal dan jawaban yang relevan.
- **Zero Data Training:** Materi dan konten Anda **tidak digunakan** untuk melatih, menyempurnakan, atau memperbaiki model AI milik Q-Gen maupun dikontribusikan untuk model dasar Google tanpa persetujuan izin data terkait.
- **Transien:** Pemrosesan terjadi secara *real-time* atau transien. Setelah kuis selesai di-generate, materi mentah tidak disimpan pada basis data server kami.

## 5. Penyimpanan dan Retensi Data
Q-Gen **tidak menggunakan database eksternal perusahaan** untuk menyimpan materi asli Anda secara permanen.
Semua data kuis yang dihasilkan (.json) secara langsung diunggah (disave) ke Google Drive pribadi Anda. Server Q-Gen tidak menahan salinan dari dokumen atau kuis Anda setelah sesi pengguna berakhir atau tab ditutup.

## 6. Berbagi Informasi
Kami tidak menjual, menyewakan, atau membagikan data atau alamat email Anda kepada pihak ketiga manapun. Data hanya ditransfer dengan aman ke Google APIs (untuk proses otentikasi dan pemrosesan AI) semata-mata untuk mewujudkan fungsionalitas inti aplikasi.

## 7. Hak-Hak Pengguna
Anda berhak untuk:
- Mencabut akses Q-Gen ke akun Google Drive Anda kapan saja melalui pengaturan Keamanan Akun Google Anda.
- Menghapus semua hasil yang di-generate langsung dari Google Drive Anda.

## 8. Kontak Kami
Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini, Anda dapat menghubungi Developer:
**Nama:** Ahmad Ngiliyun  
**Email:** [ahmadngiliyun@gmail.com](mailto:ahmadngiliyun@gmail.com)
`;

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-primary text-white flex items-center px-8 shadow-md">
        <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Kembali ke Beranda</span>
        </Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full p-8 my-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="prose prose-blue max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-accent prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
          <Markdown remarkPlugins={[remarkGfm]}>{privacyPolicyMd}</Markdown>
        </div>
      </main>
    </div>
  );
}
