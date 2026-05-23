import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const termsOfServiceMd = `
# Ketentuan Layanan (Terms of Service)

**Tanggal Berlaku:** 10 Mei 2026

## 1. Persetujuan Terhadap Ketentuan
Dengan mengakses dan menggunakan Q-Gen di [https://q-gen-150840590811.asia-southeast1.run.app](https://q-gen-150840590811.asia-southeast1.run.app), Anda menyetujui Ketentuan Layanan ini. Jika Anda tidak setuju dengan ketentuan ini, Anda dilarang menggunakan atau mengakses situs ini.

## 2. Deskripsi Layanan
Q-Gen adalah layanan (Software as a Service / SPA) yang membantu Pendidik (Guru atau Dosen) mengonversi teks dan dokumen di Google Drive menjadi butir soal atau kuis format khusus, menggunakan teknologi pemrosesan bahasa alami (Kecerdasan Buatan / AI).

## 3. Ketentuan Penggunaan Akun dan Integrasi Google Drive
- **Otentikasi:** Pengguna harus masuk menggunakan akun Google yang sah untuk menggunakan fungsionalitas menyeluruh dari Q-Gen. Mode Tamu (Guest) memiliki batasan fitur.
- **Kepatuhan:** Pengguna harus memastikan bahwa mereka memiliki hak akses untuk membaca dan memproses dokumen yang dipilih dari Google Drive mereka.
- **Pembacaan Materi:** Aplikasi menggunakan proses *"recursive folder reading"* yang tunduk pada batasan platform kami (saat ini dibatasi 10 file dan membaca max 50 halaman depan dokumen) guna memastikan kestabilan sistem.

## 4. Penggunaan Oleh AI dan Akurasi Hasil
- Q-Gen menggunakan Google Gemini API untuk menghasilkan soal. Sifat Model Bahasa Besar (LLM) dapat menghasilkan keluaran yang bervariasi.
- **Validasi Independen:** Kami **tidak menjamin** secara mutlak bahwa soal yang dihasilkan AI 100% akurat, relevan, terbebas dari kesalahan fakta (halusinasi AI), atau sesuai kurikulum Anda.
- **Tanggung Jawab Pengguna:** Sebagai Pendidik, pengguna bertanggung jawab penuh untuk me-review, mengedit, dan memvalidasi kebenaran pedagogis dan faktual soal di mode *Editor* sebelum diekspor dan diujikan ke peserta didik.

## 5. Lisensi dan Distribusi Soal
Seluruh butir soal atau hasil *generate* yang diberikan (format AIKEN/PDF/Esai) menjadi milik pengguna sepenuhnya. Q-Gen tidak menahan hak cipta atas kuis yang Anda generasikan dari materi Anda sendiri.

## 6. Pembatasan Tanggung Jawab
Dalam batas maksimum yang diizinkan oleh hukum yang berlaku, Q-Gen maupun pengembangnya, Ahmad Ngiliyun, tidak akan bertanggung jawab atas kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial (termasuk, tanpa batasan, kerugian data, gangguan penggunaan LMS, dsb.) yang timbul dari:
1. Ketidakmampuan Anda menggunakan aplikasi.
2. Kesalahan pengajaran atau evaluasi siswa akibat soal yang tidak valid.

## 7. Perubahan pada Ketentuan
Kami berhak untuk mengubah, memperbarui, atau merevisi Ketentuan Layanan ini sewaktu-waktu. Perubahan akan berlaku serta-merta pada saat versi perbaikan dipublikasikan pada aplikasi ini. Penggunaan berkelanjutan atas layanan dipandang sebagai penerimaan atas ketentuan yang telah diperbarui.

## 8. Hubungi Kami
Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami dengan mengirimkan email ke:
**Ahmad Ngiliyun** di [ahmadngiliyun@gmail.com](mailto:ahmadngiliyun@gmail.com).
`;

export default function TermsOfService() {
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
          <Markdown remarkPlugins={[remarkGfm]}>{termsOfServiceMd}</Markdown>
        </div>
      </main>
    </div>
  );
}
