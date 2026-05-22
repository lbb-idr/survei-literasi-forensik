Buatkan definisi JSON untuk Google Form penelitian "Survei Literasi Forensik dalam Membaca Berita".

## ATURAN OUTPUT
- Output **HANYA JSON valid** (tanpa ```markdown, tanpa penjelasan, tanpa komentar)
- Gunakan field names **PERSIS** seperti di bawah
- 17 pertanyaan untuk masing-masing berita + 3 refleksi = ~37 pertanyaan per form
- `required: true` untuk semua pertanyaan kecuali yang ditandai tidak wajib
- id harus unique dan konsisten dengan field name di tabel

## STRUKTUR JSON YANG HARUS DIKELUARKAN

```json
{
  "title": "...",
  "description": "...",
  "confirmationMessage": "...",
  "sections": [
    {
      "title": "...",
      "description": "...",
      "questions": [...]
    }
  ]
}
```

## TIPE QUESTION & FIELD YANG DIDUKUNG

| type | Field tambahan | Contoh |
|---|---|---|
| `linear_scale` | `min`, `max`, `minLabel`, `maxLabel` | `{"type":"linear_scale","min":1,"max":5,"minLabel":"Tidak","maxLabel":"Sangat"}` |
| `multiple_choice` | `options: [string]` | `{"type":"multiple_choice","options":["Opsi A","Opsi B"]}` |
| `short_answer` | `placeholder` | `{"type":"short_answer","placeholder":"Tulis..."}` |
| `paragraph` | `placeholder` | `{"type":"paragraph","placeholder":"Komentar..."}` |
| `checkbox` | `options: [string]` | `{"type":"checkbox","options":["A","B","C"]}` |

## ISI FORM

### Section 1: Data Responden (4 pertanyaan)

| id | type | text | options/placeholder | required |
|---|---|---|---|---|
| kode | short_answer | Kode Responden | placeholder: "Contoh: R-01" | true |
| usia | short_answer | Usia | placeholder: "Contoh: 24 tahun" | true |
| pendidikan | multiple_choice | Pendidikan Terakhir | ["SMA/Sederajat","D3/D4","S1","S2/S3","Lainnya"] | true |
| frekuensi_baca | multiple_choice | Seberapa sering membaca berita online? | ["Setiap hari","Beberapa kali seminggu","Sesekali saja","Jarang sekali"] | true |

### Section 2: Berita 1 — NASA "Kiamat Internet"

**description**: `Sumber: detikINET · Teknologi · ⚠ Berita Manipulasi Opini\nLink: https://inet.detik.com/science/d-6812051/waduh-nasa-prediksi-akan-terjadi-kiamat-internet-di-2025\nSinopsis: Berita ini membahas peringatan NASA tentang potensi badai matahari besar yang dapat mengganggu infrastruktur internet global pada tahun 2025. Judul menggunakan kata "kiamat internet" yang terkesan dramatis, padahal isi berita lebih menggambarkan gangguan sementara.`

**GRUP A (Kontrol — opini biasa) — 9 pertanyaan:**

| id | type | text | Opsi/Keterangan |
|---|---|---|---|
| b1q1 | linear_scale | Seberapa besar rasa khawatir atau panik yang Anda rasakan? | 1=Tidak khawatir, 5=Panik sekali |
| b1q2 | linear_scale | Seberapa besar dorongan untuk segera membagikan berita ini? | 1=Tidak ingin share, 5=Langsung share |
| b1q3 | linear_scale | Seberapa akurat kata "Kiamat Internet" menggambarkan isi berita? | 1=Sangat lebay, 5=Sangat akurat |
| b1q4 | multiple_choice | Apakah NASA sumber kompeten memprediksi "kiamat internet"? | ["Ya, NASA pasti tahu dan prediksinya pasti benar","NASA relevan soal badai matahari, tapi tidak bisa pastikan","Saya tidak tahu apakah NASA benar berkata demikian","Nama NASA dipakai agar terkesan kredibel"] |
| b1q5_1 | short_answer | Tulis hal menarik 1 yang Anda ingat dari berita ini | placeholder: "Hal menarik 1" |
| b1q5_2 | short_answer | Tulis hal menarik 2 yang Anda ingat | placeholder: "Hal menarik 2" |
| b1q6 | multiple_choice | Apakah judul "Kiamat Internet" sesuai dengan isi berita? | ["Sangat sesuai — isi mendukung penuh judul","Cukup sesuai — ada sedikit perbedaan","Kurang sesuai — judul lebih dramatis dari isi","Tidak sesuai sama sekali — menyesatkan"] |
| b1q7 | multiple_choice | Apakah ada informasi penting yang kurang dijelaskan? | ["Ya, banyak informasi penting yang kurang","Ada beberapa hal yang masih kurang jelas","Tidak, berita sudah cukup lengkap","Tidak tahu / tidak memperhatikan"] |
| b1q7_text | short_answer | Jika ada, jelaskan informasi apa yang kurang (tidak wajib) | placeholder: "Tulis di sini...", required: false |
| b1q8 | multiple_choice | Apakah penyebutan NASA membuat Anda lebih percaya? | ["Ya, sangat — NASA lembaga terpercaya","Sedikit lebih percaya","Tidak berpengaruh","Saya ragu NASA benar-benar mengatakan itu"] |
| b1q9 | multiple_choice | Kesan keseluruhan setelah membaca berita ini? | ["Sangat informatif","Cukup menarik","Biasa saja","Membingungkan"] |

**GRUP B (Perlakuan — teknik forensik) — 9 pertanyaan:**

- b1q1, b1q2, b1q3, b1q4: **SAMA dengan Grup A**
- Tambahkan di description section: `\n\nPetunjuk: Sebelum menjawab, gunakan teknik analisis forensik: scanning, mapping, triangulasi, dan verifikasi logika.`

| id | type | text | Opsi/Keterangan |
|---|---|---|---|
| b1q5_1 | short_answer | Tulis kata/frasa dramatis 1 → versi netralnya | placeholder: "Contoh: Kiamat → Gangguan besar", required: false |
| b1q5_2 | short_answer | Tulis kata/frasa dramatis 2 → versi netral | placeholder: "Kata/frasa lainnya", required: false |
| b1q6 | multiple_choice | Jika judul dibalik "NASA Bilang Internet Tetap Aman", adakah data mendukung? | ["Ya, ada data risiko tidak separah judul","Tidak ada, semua mendukung narasi kiamat","Tidak tahu"] |
| b1q7 | multiple_choice | Apakah berita menjelaskan proses badai → kiamat internet secara teknis? | ["Ya, penjelasan lengkap dan masuk akal","Sebagian, ada loncatan kesimpulan","Tidak ada penjelasan teknis sama sekali"] |
| b1q7_text | short_answer | Jika ada loncatan logika, jelaskan (tidak wajib) | placeholder: "Tulis di sini...", required: false |
| b1q8 | multiple_choice | Apakah berita menyertakan data/sumber resmi? | ["Ya, data spesifik dari sumber resmi","Ada penyebutan NASA tanpa kutipan jelas","Tidak ada data sama sekali"] |
| b1q9 | multiple_choice | Kesimpulan akhir tentang berita ini? | ["Internet bisa mati total berdasarkan data","Ada risiko nyata tapi judul berlebihan","Clickbait — judul tidak relevan","Tidak bisa menilai"] |

### Section 3: Berita 2 — Kompas PHK

**description**: `Sumber: Kompas · Ekonomi · ⚠ Berita Manipulasi Opini\nLink: https://money.kompas.com/read/2025/07/28/125720026/phk-melonjak-3219-persen-di-paruh-pertama-2025-sektor-manufaktur-paling-banyak\nSinopsis: Berita ini melaporkan data Kementerian Ketenagakerjaan tentang jumlah pekerja yang mengalami PHK sepanjang Januari–Juni 2025. Angka tersebut dibandingkan dengan periode yang sama pada tahun 2024, dan berita menyebutkan sektor manufaktur sebagai yang paling terdampak.`

**GRUP A (Kontrol — opini biasa):**

| id | type | text | Opsi/Keterangan |
|---|---|---|---|
| b2q1 | linear_scale | Seberapa khawatir tentang kondisi ekonomi/keamanan kerja? | 1=Tidak khawatir, 5=Panik sekali |
| b2q2 | linear_scale | Keinginan membagikan berita ini sebagai peringatan? | 1=Tidak ingin share, 5=Langsung share |
| b2q3 | linear_scale | Percaya PHK sedang melonjak signifikan? | 1=Sangat ragu, 5=Sangat percaya |
| b2q4 | multiple_choice | Apakah berita menyajikan gambaran lengkap dan jujur? | ["Ya, data utuh dan kontekstual","Cukup lengkap tapi ada detail terlewat","Ada informasi sengaja tidak disebut","Menyesatkan — persentase tanpa konteks"] |
| b2q5_1 | short_answer | Kata/angka 1 yang paling Anda ingat | placeholder: "Misal: 32,19%", required: false |
| b2q5_2 | short_answer | Kata/angka 2 yang paling Anda ingat | placeholder: "Kata/angka lainnya", required: false |
| b2q6 | multiple_choice | Apakah angka-angka dalam berita mudah dipahami? | ["Sangat mudah — jelas dan kontekstual","Cukup mudah","Agak sulit — kurang konteks","Sulit dipahami"] |
| b2q7 | multiple_choice | Informasi tambahan apa yang Anda rasa perlu? | ["Perbandingan tahun sebelumnya","Data per sektor/daerah","Perbandingan total angkatan kerja","Semua sudah cukup","Tidak tahu"] |
| b2q8 | multiple_choice | Apakah Anda percaya data PHK yang disajikan? | ["Sangat percaya — sumber pemerintah","Cukup percaya","Kurang percaya — bisa menyesatkan","Tidak tahu"] |
| b2q9 | multiple_choice | Bagaimana situasi PHK di Indonesia menurut Anda? | ["Sangat mengkhawatirkan — melonjak drastis","Cukup mengkhawatirkan — ada kenaikan","Biasa saja — fluktuasi wajar","Tidak tahu"] |
| b2q10 | multiple_choice | Apa yang paling mungkin Anda lakukan? | ["Percaya begitu saja","Share ke medsos","Cari data BPS/BPJS","Abaikan karena janggal"] |

**GRUP B (Perlakuan — teknik forensik):**
- b2q1, b2q2, b2q3, b2q4, b2q10: **SAMA dengan Grup A**
- Tambahkan di description: `\n\nPetunjuk: Gunakan teknik analisis forensik yang sama: scanning diksi, logical gap, triangulasi angka, dan verifikasi sumber.`

| id | type | text | Opsi/Keterangan |
|---|---|---|---|
| b2q5_1 | short_answer | Kata/frasa alarmis 1 dalam berita ini | placeholder: "Kata/frasa 1", required: false |
| b2q5_2 | short_answer | Kata/frasa alarmis 2 | placeholder: "Kata/frasa 2", required: false |
| b2q6 | multiple_choice | Apakah berita menyebut tren Juni turun (1.609) atau hanya fokus 32,19%? | ["Ya, disebut jelas","Disebut sekilas tidak ditekankan","Tidak disebut sama sekali"] |
| b2q7 | multiple_choice | Apakah ada konteks cukup untuk 32,19%? (misal: dari 145 juta pekerja) | ["Ya, konteks lengkap","Angka absolut tanpa proporsi","Tidak ada konteks"] |
| b2q8 | multiple_choice | Apakah sumber (Satudata Kemnaker) kredibel? | ["Resmi pemerintah — kredibel","Kredibel tapi penyajian menyesatkan","Perlu dibandingkan BPS/BPJS","Tidak tahu"] |
| b2q9 | multiple_choice | Kesimpulan paling akurat tentang situasi PHK? | ["PHK melonjak drastis — krisis","Ada kenaikan tapi framing berlebihan","Manipulatif — sembunyikan tren Juni","Tidak bisa menilai"] |

### Section 4: Refleksi Akhir (3 pertanyaan — SAMA untuk kedua grup)

| id | type | text | Opsi/Keterangan |
|---|---|---|---|
| rf1 | linear_scale | Kepercayaan terhadap media berita digital Indonesia? | 1=Sangat tidak percaya, 5=Sangat percaya |
| rf2 | multiple_choice | Apakah cara menyikapi berita berubah? | ["Ya, jadi lebih kritis","Sedikit berubah","Tidak berubah"] |
| rf_komentar | paragraph | Hal lain yang ingin disampaikan? (tidak wajib) | placeholder: "Komentar bebas...", required: false |

## OUTPUT FINAL

Keluarkan **2 JSON** — satu untuk Grup A, satu untuk Grup B. Jangan beri penjelasan apapun. Hanya JSON.

Gunakan `"confirmationMessage": "Terima kasih atas partisipasi Anda. Jawaban Anda sangat berarti untuk kemajuan penelitian literasi media di Indonesia."`

Gunakan description section yang sudah disediakan untuk masing-masing berita.

Judul: `"Survei Literasi Forensik — Grup A (Kontrol)"` dan `"Survei Literasi Forensik — Grup B (Perlakuan)"`
