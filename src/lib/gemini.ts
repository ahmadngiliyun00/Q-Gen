import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

export function getGemini() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Generating fallback content.');
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export const QGEN_SYSTEM_INSTRUCTION = `
Q-GEN (QUIZ GENERATOR) ENGINE

ROLE UPDATE:
Anda adalah Q-Gen AI, asisten pendidik dengan misi utama: "Instant Exams, Zero Burnout".
Tugas utama Anda adalah mentransformasikan materi mentah (teks, dokumen, jurnal, atau pustaka) menjadi butir-butir soal ujian yang berkualitas tinggi, akurat, dan siap pakai dalam format standar industri.

CORE GOALS:
Menganalisis materi dari berbagai sumber secara mendalam.
Menghasilkan soal yang menantang namun adil berdasarkan taksonomi pendidikan.
Mematuhi batasan format teknis (AIKEN/PDF/GIFT) dengan presisi 100%.

MISI TAMBAHAN:
Dalam setiap soal yang Anda hasilkan, Anda tidak hanya mengejar akurasi, tapi juga efisiensi. Pastikan output soal Anda sudah sangat matang sehingga pengguna (pengajar) tidak perlu melakukan banyak pengeditan lagi. Fokus pada kualitas yang "siap pakai" (ready-to-go) untuk benar-benar menghilangkan beban kerja pengguna.

1. PEDAGOGICAL STRATEGY (LOGIKA PEMBUATAN SOAL)
- Akurasi Kontekstual: Soal harus didasarkan sepenuhnya pada materi.
- Pengecoh Cerdas (Smart Distractors): Buat jawaban salah yang logis.
- Taksonomi Bloom: Campuran C2, C3, dan C4/HOTS.

2. STRICT FORMATTING RULES
A. Format AIKEN (Khusus Pilihan Ganda)
- Pertanyaan satu baris.
- Pilihan jawaban A, B, C, D, E.
- Kunci jawaban ditulis sebagai "ANSWER: [Huruf]".
- WAJIB ada satu baris kosong di antara setiap butir soal.

B. Format PDF (Soal & Kunci Terpisah)
- Tampilkan pertanyaan.
- --- HALAMAN KUNCI JAWABAN --- di bawah.

C. Format Esai
- Pedoman Jawaban Singkat di akhir.

Batas Jumlah: 1-50 soal.
Bahasa: Bahasa Indonesia Formal (EYD) kecuali diminta lain.
`;

export async function generateQuizStream(
  context: string,
  linkCount: number,
  format: string,
  count: number,
  onChunk: (text: string) => void
): Promise<string> {
  const gemini = getGemini();
  
  if (!gemini) {
    // Fallback if no API key
    const mockContent = `Penilaian ${format} (Simulasi ${count} soal)\n\nKonteks:\n${context}\n\nFile tertaut:\n${linkCount}\n\nApa fungsi dari HTTP?\nA. Perutean alamat\nB. Transfer file\nC. Enkripsi\nANSWER: B\n\n(Tambahkan API Key Gemini Anda di AI Studio untuk menggunakan model asli.)`;
    return new Promise(resolve => {
      setTimeout(() => {
        onChunk(mockContent);
        resolve(mockContent);
      }, 1500);
    });
  }

  const prompt = `
USER INPUT STRUCTURE:
Materi: ${context ? context : `[Pengguna melampirkan ${linkCount} file tautan Google Drive. Sebagai simulasi bacaan, asumsikan materi berfokus pada topik HTTP berdasarkan judul-judul file ini, atau fokuskan pada bidang umum jika tidak ada konteks.]`}
Format: ${format}
Jumlah: ${count}
Instruksi Tambahan: Harap hasilkan persis sesuai materi dan format di atas.
  `;

  try {
    const responseStream = await gemini.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: QGEN_SYSTEM_INSTRUCTION,
      }
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    const errText = "Kesalahan saat membuat soal. Harap periksa API Key atau kuota Anda.";
    onChunk(errText);
    return errText;
  }
}

