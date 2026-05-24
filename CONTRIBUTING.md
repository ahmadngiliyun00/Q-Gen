# Panduan Kontribusi Q-Gen

Terima kasih atas minat Anda untuk berkontribusi pada proyek Q-Gen! Kami sangat menghargai dukungan Anda. Berikut adalah langkah-langkah untuk mulai berkontribusi:

## Cara Berkontribusi

1. **Fork Repositori**
   - Klik tombol **Fork** di pojok kanan atas halaman repositori Github ini untuk menyalin repositori ke akun GitHub Anda.

2. **Clone Repositori (Lokal)**
   - Clone repositori yang telah di-fork ke perangkat komputer Anda:
     ```bash
     git clone https://github.com/USERNAME_ANDA/Q-Gen.git
     ```
   - Masuk ke direktori proyek:
     ```bash
     cd Q-Gen
     ```

3. **Buat Branch Baru**
   - Buat branch baru untuk setiap fitur yang ingin Anda tambahkan atau bug yang ingin diperbaiki:
     ```bash
     git checkout -b nama-fitur-anda
     ```

4. **Lakukan Perubahan**
   - Lakukakan perubahan atau penambahan kode yang Anda perlukan. Pastikan kode Anda rapi dan mengikuti standar yang ada.

5. **Commit Perubahan**
   - Simpan perubahan Anda dengan commit message yang jelas dan mendeskripsikan apa yang Anda ubah:
     ```bash
     git add .
     git commit -m "Menambahkan fitur X untuk meningkatkan stabilitas"
     ```

6. **Push ke GitHub**
   - Dorong perubahan Anda ke repositori fork Anda di GitHub:
     ```bash
     git push origin nama-fitur-anda
     ```

7. **Buat Pull Request (PR)**
   - Pergi ke repositori asli Q-Gen (https://github.com/ahmadngiliyun00/Q-Gen).
   - Klik tab **Pull Requests** dan klik tombol **New Pull Request**.
   - Pilih *base branch* (misalnya `main`) dan *compare branch* dengan branch yang telah Anda buat pada repositori fork.
   - Tambahkan deskripsi detail mengenai perubahan dan tujuan dari kontribusi Anda. Klik **Create Pull Request**!

Kami akan melakukan review setelah Anda mengirimkan Pull Request secepat mungkin. Terima kasih telah membantu menjadikan Q-Gen lebih baik!
