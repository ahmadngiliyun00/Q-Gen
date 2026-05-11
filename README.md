<div align="center">
  <img src="public/logo.png" alt="Q-Gen Logo" width="120" />
  <h1>Q-Gen (Quiz Generator)</h1>
  <p><b>"Instant Exams, Zero Burnout"</b></p>
  
  ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
  ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/Gemini_3.1_Pro-8E24AA?style=flat&logo=google&logoColor=white)
</div>

---

## 📌 Tentang Q-Gen

**Q-Gen** adalah solusi kecerdasan buatan (AI) yang dirancang khusus untuk membantu dosen dan guru. Aplikasi ini mengonversi materi pembelajaran langsung dari Google Drive menjadi kuis atau ujian yang siap pakai hanya dalam hitungan detik. 

Kami memahami bahwa waktu pendidik sangat berharga; Q-Gen hadir untuk menghilangkan beban administratif dan mencegah _burnout_, sehingga pendidik dapat fokus pada misi utamanya: **mengajar dan mendidik**.

## ✨ Fitur Utama

- 📂 **Integrasi Google Drive Mulus**: Mendukung impor dokumen langsung seperti Google Docs, Slides, PDF, TXT, dan file JSON.
- 🔄 **Pembacaan Folder Rekursif**: Mampu memindai dan masuk ke dalam sub-folder untuk mengekstrak seluruh materi secara komprehensif.
- 🧠 **Mesin AI Gemini 3.1 Pro**: Menghasilkan pertanyaan bermutu tinggi yang mematuhi standar pedagogi dan menyesuaikan dengan tingkat kognitif **Taksonomi Bloom**.
- 📤 **Ekspor Multiformat**: 
  - **AIKEN**: Format teks mentah yang siap diimpor ke dalam *Learning Management System* (LMS) seperti Moodle.
  - **PDF Profesional**: Lembar soal yang diformat secara rapi, elegan, dan dilengkapi dengan halaman khusus Kunci Jawaban.
  - **Esai**: Soal uraian terbuka dengan panduan/rubrik penilaian singkat.
- 💅 **Antarmuka Modern & Responsif**: Dibangun menggunakan Tailwind CSS untuk memastikan pengalaman pengguna yang *delightful*, premium, dan nyaman digunakan di segala ukuran layar perangkat.

## 🚀 Cara Penggunaan

Alur kerja di Q-Gen sangatlah intuitif dan sederhana:

1. **🔑 Login**: Masuk secara aman menggunakan kredensial akun Google Anda (Google OAuth).
2. **🔗 Paste Link Drive**: Masukkan tautan (URL) ke dokumen atau folder Google Drive yang berisi materi acuan Anda.
3. **⚙️ Atur Parameter**: Tentukan jumlah soal yang diinginkan (1 hingga 50), pilih format *output* (AIKEN/PDF/Esai), dan berikan instruksi/konteks tambahan.
4. **✨ Generate**: Duduk dan bersantai saat AI Gemini 3.1 Pro menganalisis, menyintesis, dan menyusun kuis cerdas untuk Anda.
5. **🔽 Export**: Periksa hasilnya di mode Editor, unduh berkasnya, dan interaksi siap dimulai dengan peserta didik!

## 🛠️ Build & Instalasi (Lokal)

Untuk menjalankan Q-Gen di *environment* lokal Anda, ikuti langkah-langkah teknis di bawah ini:

**1. Clone Repositori**
```bash
git clone https://github.com/ahmadngiliyun00/q-gen.git
cd q-gen
```

**2. Instal Dependensi**
Gunakan `npm` untuk menginstal seluruh utilitas yang dibutuhkan:
```bash
npm install
```

**3. Konfigurasi Environment**
Buat file bernama `.env` di *root directory* proyek Anda dan lengkapi konfigurasi API berikut:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

**4. Jalankan Development Server**
```bash
npm run dev
```

## 💻 Teknologi yang Digunakan

Q-Gen diciptakan dengan stack teknologi web inovatif:

| Kategori | Teknologi Utama |
| :--- | :--- |
| **Frontend Framework** | React, TypeScript, Vite |
| **Desain & Styling** | Tailwind CSS, Lucide React (Icons), Motion |
| **Mesin Pemrosesan (AI)** | Google AI Studio (Gemini 3.1 Pro) |
| **Otentikasi & Sumber Data** | Google Drive API, Google OAuth 2.0 |
| **Infrastruktur / Deployment** | Google Cloud Run |

## 👨‍💻 Dibuat Oleh

<a href="https://www.linkedin.com/in/ahmadngiliyun00/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-Ahmad_Ngiliyun-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Profil LinkedIn Ahmad Ngiliyun" />
</a>

> Dikembangkan dengan penuh semangat oleh **Ahmad Ngiliyun**. Didedikasikan bagi para pendidik pahlawan tanpa tanda jasa.

## 📄 Lisensi

Proyek ini didistribusikan di bawah **Lisensi MIT**. 

Hak Cipta (c) 2026 Ahmad Ngiliyun.  
*Silakan menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan/atau menjual salinan perangkat lunak ini sesuai dengan syarat Lisensi MIT.*
