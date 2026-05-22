import requests
import random
import time
from datetime import datetime

URL = "https://script.google.com/macros/s/AKfycbzONajUKfrNsONkDJCgNI7N4WyGbq66e5D9pFz7WVc06L0U_Wf4ZJchYEBLpQm-PeTQ/exec"

USIA = ["19 tahun", "20 tahun", "21 tahun", "22 tahun", "23 tahun", "24 tahun", "25 tahun"]
PENDIDIKAN = ["SMA / Sederajat", "D3 / D4", "S1", "S2 / S3"]
FREKUENSI = ["Setiap hari", "Beberapa kali seminggu", "Sesekali saja", "Jarang sekali"]

# Grup A — jawaban
LIKERT = ["1", "2", "3", "4", "5"]

RADIO_A = {
    "b1q4": [
        "Ya, NASA pasti tahu dan prediksinya pasti benar",
        "NASA relevan soal badai matahari, tapi tidak bisa pastikan \"kiamat internet\"",
        "Saya tidak tahu apakah NASA memang benar berkata demikian di berita aslinya",
        "Nama NASA tampaknya dipakai untuk membuat berita terkesan lebih kredibel",
    ],
    "b1q6": [
        "Sangat sesuai — isi berita mendukung penuh judul tersebut",
        "Cukup sesuai — ada sedikit perbedaan tapi tidak terlalu masalah",
        "Kurang sesuai — judul terkesan lebih dramatis dari isinya",
        "Tidak sesuai sama sekali — judul menyesatkan",
    ],
    "b1q7": [
        "Ya, banyak informasi penting yang kurang dijelaskan",
        "Ada beberapa hal yang masih kurang jelas",
        "Tidak, berita sudah cukup lengkap",
        "Tidak tahu / tidak memperhatikan",
    ],
    "b1q8": [
        "Ya, sangat — NASA adalah lembaga terpercaya",
        "Sedikit lebih percaya karena ada nama NASA",
        "Tidak berpengaruh — nama NASA biasa saja",
        "Saya ragu NASA benar-benar mengatakan hal yang sama persis",
    ],
    "b1q9": [
        "Sangat informatif — saya mendapatkan pengetahuan baru",
        "Cukup menarik — topiknya membuat saya penasaran",
        "Biasa saja — tidak ada yang istimewa",
        "Membingungkan — sulit memahami maksud berita",
    ],
    "b2q4": [
        "Ya, berita ini sudah menyajikan data PHK secara utuh dan kontekstual",
        "Cukup lengkap, tapi ada detail penting yang terlewat",
        "Ada banyak informasi yang sengaja tidak disebutkan (misal: tren Juni yang turun)",
        "Berita ini menyesatkan karena menyajikan persentase tanpa konteks angkatan kerja",
    ],
    "b2q6": [
        "Sangat mudah — angka disajikan jelas dan kontekstual",
        "Cukup mudah — bisa dipahami meski ada sedikit kebingungan",
        "Agak sulit — angka kurang konteks sehingga membingungkan",
        "Sulit dipahami — tidak ada konteks yang cukup untuk angka-angka tersebut",
    ],
    "b2q7": [
        "Perbandingan dengan tahun-tahun sebelumnya",
        "Data per sektor atau daerah yang lebih rinci",
        "Perbandingan dengan total angkatan kerja nasional",
        "Semua informasi sudah cukup jelas",
        "Tidak tahu",
    ],
    "b2q8": [
        "Ya, sangat percaya karena bersumber dari data pemerintah",
        "Cukup percaya — sumbernya resmi meski perlu verifikasi lanjutan",
        "Kurang percaya — angka bisa disajikan secara menyesatkan",
        "Tidak tahu — saya tidak bisa memverifikasi sendiri",
    ],
    "b2q9": [
        "Sangat mengkhawatirkan — PHK melonjak drastis dan meluas",
        "Cukup mengkhawatirkan — ada kenaikan tapi mungkin tidak separah yang digambarkan",
        "Biasa saja — fluktuasi PHK adalah hal yang wajar secara musiman",
        "Tidak tahu — data yang disajikan tidak cukup untuk menilai",
    ],
    "b2q10": [
        "Percaya begitu saja karena ada angka dan sumber resmi pemerintah",
        "Share ke media sosial karena angkanya mengkhawatirkan dan perlu diwaspadai",
        "Mencari data lengkap dari BPS atau BPJS Ketenagakerjaan untuk memverifikasi",
        "Mengabaikan karena merasa ada yang janggal dengan cara penyajian persentasenya",
    ],
    "rf2": [
        "Ya, saya jadi lebih kritis dan hati-hati",
        "Sedikit berubah, tapi tidak terlalu signifikan",
        "Tidak berubah, cara membaca saya tetap sama",
    ],
}

RADIO_B = {
    "b1q4": RADIO_A["b1q4"],
    "b1q6": [
        "Ya, ada data yang menunjukkan risiko sebenarnya tidak separah judulnya",
        "Tidak ada, berita memang seluruhnya mendukung narasi \"kiamat\"",
        "Tidak tahu / tidak memperhatikan",
    ],
    "b1q7": [
        "Ya, penjelasan teknis rantai sebab-akibatnya lengkap dan masuk akal",
        "Sebagian dijelaskan, tapi ada loncatan kesimpulan yang tidak didukung data",
        "Tidak ada penjelasan teknis — berita langsung lompat ke kesimpulan \"kiamat\"",
    ],
    "b1q8": [
        "Ya, ada data spesifik dari sumber resmi yang bisa diverifikasi",
        "Ada penyebutan NASA tapi tanpa kutipan atau laporan resmi yang jelas",
        "Tidak ada data sama sekali — hanya pernyataan umum",
    ],
    "b1q9": [
        "Berita akurat — internet benar-benar bisa mati total berdasarkan data yang ada",
        "Ada risiko nyata tapi judul sangat berlebihan dan menyesatkan",
        "Berita ini clickbait — judul tidak relevan dengan isi dan data yang disajikan",
        "Tidak bisa menilai karena data tidak cukup untuk diverifikasi",
    ],
    "b2q4": RADIO_A["b2q4"],
    "b2q6": [
        "Ya, berita menyebutkan tren penurunan di Juni secara jelas",
        "Disebutkan sekilas tapi tidak ditekankan",
        "Tidak disebutkan sama sekali — berita hanya fokus pada \"lonjakan 32,19%\"",
    ],
    "b2q7": [
        "Ya, ada konteks lengkap termasuk proporsi terhadap total angkatan kerja",
        "Angka absolut (42.385 vs 32.064) disebutkan tapi tanpa proporsi terhadap total pekerja",
        "Tidak ada konteks — hanya persentase \"32,19%\" yang ditonjolkan",
    ],
    "b2q8": [
        "Ya, Satudata Kemnaker adalah sumber resmi pemerintah yang kredibel",
        "Sumber kredibel, tapi cara penyajian datanya (hanya persentase) bisa menyesatkan",
        "Data resmi tapi perlu dibandingkan dengan sumber lain (BPS, BPJS Ketenagakerjaan)",
        "Tidak tahu / tidak memperhatikan sumber data",
    ],
    "b2q9": [
        "PHK memang sedang melonjak drastis dan Indonesia menghadapi krisis ketenagakerjaan",
        "Ada kenaikan angka PHK, tapi framing \"melonjak 32,19%\" berlebihan tanpa konteks total angkatan kerja",
        "Berita ini manipulatif — menyajikan persentase besar tanpa menyebutkan tren Juni yang justru turun",
        "Tidak bisa menilai karena data yang disajikan tidak cukup untuk menarik kesimpulan",
    ],
    "b2q10": RADIO_A["b2q10"],
    "rf2": RADIO_A["rf2"],
    "rf3": [
        "1 \u2013 Scanning",
        "2 \u2013 Mapping / Reverse Framing",
        "3 \u2013 Neutralizing",
        "4 \u2013 Verifikasi Logika",
        "5 \u2013 Triangulasi Data",
        "6 \u2013 Logical Gap Analysis",
    ],
}

ISI_ISIAN = {
    "A": [
        ("Kiamat Internet", "Judulnya menakutkan"),
        ("Prediksi NASA", "Gangguan sementara"),
        ("Badai matahari", "Dampak internet"),
        ("PHK melonjak", "Angka 32,19%"),
        ("42.385 orang", "Data Kemnaker"),
        ("Krisis tenaga kerja", "Sektor manufaktur"),
    ],
    "B": [
        ("Kiamat \u2192 Gangguan besar", "Internet mati total \u2192 Gangguan sementara"),
        ("Melonjak \u2192 Meningkat", "PHK melonjak \u2192 Ada kenaikan"),
        ("Kiamat", "Melonjak"),
        ("32,19%", "Badai matahari"),
        ("Waduh", "Kiamat Teknologi"),
        ("Manufaktur", "42.385"),
    ],
}

KOMENTAR = [
    "",
    "",
    "",
    "Surveinya menarik, membuat saya lebih kritis membaca berita.",
    "Terima kasih, penelitian yang bagus.",
    "Semoga hasilnya bermanfaat untuk literasi media di Indonesia.",
    "",
    "",
]

PENGALAMAN_RF3 = [
    "Teknik neutralizing paling membantu saya melihat bias berita.",
    "Mapping / reverse framing membuka wawasan saya tentang framing media.",
    "Verifikasi logika membantu saya mendeteksi kejanggalan berita.",
    "Triangulasi data membuat saya tidak langsung percaya angka.",
    "Scanning membantu saya lebih peka terhadap kata-kata dramatis.",
    "Logical gap analysis membuat saya kritis terhadap kesimpulan berita.",
    "Cukup membantu secara keseluruhan.",
    "",
]


def make_dummy(kode, group, usia, pendidikan, frekuensi):
    data = {
        "timestamp": datetime.now().isoformat(),
        "group": group,
        "kode": kode,
        "usia": usia,
        "pendidikan": pendidikan,
        "frekuensi_baca": frekuensi,
    }

    for q in ["b1q1", "b1q2", "b1q3", "b2q1", "b2q2", "b2q3", "rf1"]:
        data[q] = random.choice(LIKERT)

    radio_set = RADIO_B if group == "B" else RADIO_A
    for q, options in radio_set.items():
        data[q] = random.choice(options)

    if group == "B":
        data["rf3s"] = random.choice(LIKERT)

    isian_list = ISI_ISIAN.get(group, ISI_ISIAN["A"])
    pair = random.choice(isian_list)
    data["b1q5_1"] = pair[0]
    data["b1q5_2"] = pair[1]
    pair2 = random.choice(isian_list)
    data["b2q5_1"] = pair2[0]
    data["b2q5_2"] = pair2[1]

    data["b1q7_text"] = random.choice([
        "Penjelasan teknisnya kurang mendalam.",
        "Tidak disebutkan bagaimana badai matahari bisa memutus internet.",
        "Sumber NASA tidak dikutip secara langsung.",
        "Tidak ada data pendukung yang jelas.",
        "",
    ])

    if group == "B":
        data["rf3_pengalaman"] = random.choice(PENGALAMAN_RF3)

    data["rf_komentar"] = random.choice(KOMENTAR)

    return data


def send(data):
    try:
        r = requests.post(URL, params={"data": __import__("json").dumps(data)}, timeout=30)
        print(f"  [{data['kode']}] Grup {data['group']} -> {r.status_code}")
        return True
    except Exception as e:
        print(f"  [{data['kode']}] GAGAL: {e}")
        return False


def main():
    print("Mengirim dummy responses ke Google Sheet...\n")

    # Grup A — 5 responden
    for i in range(1, 6):
        usr = f"R0{i}"
        d = make_dummy(usr, "A", random.choice(USIA), random.choice(PENDIDIKAN), random.choice(FREKUENSI))
        send(d)
        time.sleep(1)

    # Grup B — 5 responden
    for i in range(1, 6):
        usr = f"B0{i}"
        d = make_dummy(usr, "B", random.choice(USIA), random.choice(PENDIDIKAN), random.choice(FREKUENSI))
        send(d)
        time.sleep(1)

    print("\nSelesai! 10 dummy responses terkirim.")


if __name__ == "__main__":
    main()
