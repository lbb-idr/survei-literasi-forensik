(function() {
  var APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzONajUKfrNsONkDJCgNI7N4WyGbq66e5D9pFz7WVc06L0U_Wf4ZJchYEBLpQm-PeTQ/exec';

  var jsonInput = document.getElementById('jsonInput');
  var createBtn = document.getElementById('createBtn');
  var pasteBtn = document.getElementById('pasteBtn');
  var clearBtn = document.getElementById('clearBtn');
  var loadSampleBtn = document.getElementById('loadSampleBtn');
  var statusDiv = document.getElementById('status');

  function setStatus(type, msg) {
    statusDiv.className = 'status status-' + type;
    statusDiv.innerHTML = msg;
    statusDiv.style.display = 'block';
  }

  function hideStatus() {
    statusDiv.style.display = 'none';
  }

  function validateJson(text) {
    if (!text || text.trim().length === 0) return null;
    try {
      var parsed = JSON.parse(text);
      return parsed;
    } catch(e) {
      return null;
    }
  }

  function updateCreateButton() {
    var val = jsonInput.value.trim();
    if (val.length === 0) {
      createBtn.disabled = true;
      return;
    }
    var parsed = validateJson(val);
    if (parsed && parsed.title && parsed.sections) {
      createBtn.disabled = false;
    } else {
      createBtn.disabled = true;
    }
  }

  jsonInput.addEventListener('input', updateCreateButton);

  pasteBtn.addEventListener('click', function() {
    navigator.clipboard.readText().then(function(text) {
      if (text) {
        jsonInput.value = text;
        updateCreateButton();
        var parsed = validateJson(text);
        if (parsed) {
          setStatus('success', '✓ JSON valid — ' + (parsed.title || 'Untitled') + ' (' +
            (parsed.sections ? parsed.sections.reduce(function(sum, s) { return sum + (s.questions ? s.questions.length : 0); }, 0) : 0) +
            ' pertanyaan)');
        } else {
          setStatus('error', '✗ JSON tidak valid — periksa format');
        }
      } else {
        setStatus('error', '✗ Clipboard kosong');
      }
    }).catch(function(err) {
      setStatus('error', '✗ Gagal baca clipboard: ' + err.message + '<br><span style="font-size:11px;">Coba paste manual (Ctrl+V)</span>');
    });
  });

  clearBtn.addEventListener('click', function() {
    jsonInput.value = '';
    hideStatus();
    updateCreateButton();
  });

  loadSampleBtn.addEventListener('click', function() {
    jsonInput.value = JSON.stringify(SAMPLE_DEFINITION, null, 2);
    updateCreateButton();
    setStatus('success', '✓ Contoh dimuat — ' + SAMPLE_DEFINITION.title + ' (' +
      SAMPLE_DEFINITION.sections.reduce(function(sum, s) { return sum + (s.questions ? s.questions.length : 0); }, 0) +
      ' pertanyaan)');
  });

  createBtn.addEventListener('click', function() {
    var text = jsonInput.value.trim();
    var parsed = validateJson(text);
    if (!parsed) {
      setStatus('error', '✗ JSON tidak valid — periksa kurung, koma, dan petik');
      return;
    }
    if (!parsed.title || !parsed.sections) {
      setStatus('error', '✗ JSON harus punya field "title" dan "sections"');
      return;
    }

    var allKeys = Object.keys(parsed);
    if (allKeys.length > 0 && !parsed.title && !parsed.sections) {
      setStatus('error', '✗ JSON tidak punya field "title" dan "sections". <br><span style="font-size:11px;">Catatan: Gemini output 2 JSON (Grup A &amp; Grup B). Copy SATU per SATU.</span>');
      createBtn.disabled = false;
      createBtn.textContent = '🚀 Buat Google Form';
      return;
    }

    var totalQ = parsed.sections.reduce(function(sum, s) { return sum + (s.questions ? s.questions.length : 0); }, 0);
    setStatus('loading', '⏳ Membuka tab: "' + parsed.title + '" (' + totalQ + ' pertanyaan)...');

    createBtn.disabled = true;
    createBtn.textContent = '⏳ Mengirim...';

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = APP_SCRIPT_URL;
    form.target = '_blank';

    var input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'action';
    input1.value = 'createForm';

    var input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'definition';
    input2.value = text;

    form.appendChild(input1);
    form.appendChild(input2);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setTimeout(function() {
      createBtn.disabled = false;
      createBtn.textContent = '🚀 Buat Google Form';
      setStatus('success',
        '✅ Form dikirim ke tab baru!<br>' +
        '📋 <strong>' + parsed.title + '</strong> — ' + totalQ + ' pertanyaan'
      );
    }, 1000);
  });

  var SAMPLE_DEFINITION = {
    "action": "createForm",
    "title": "Survei Literasi Forensik — Grup A (Kontrol)",
    "description": "Halo! Terima kasih telah bersedia meluangkan waktu untuk berpartisipasi dalam penelitian ini.\n\nAnda akan diminta membaca dua berita singkat, lalu menjawab beberapa pertanyaan tentang apa yang Anda rasakan dan pikirkan setelah membacanya.",
    "confirmationMessage": "Terima kasih atas partisipasi Anda. Jawaban Anda sangat berarti untuk kemajuan penelitian literasi media di Indonesia.",
    "sections": [
      {
        "title": "A. Data Responden",
        "questions": [
          { "id": "kode", "type": "short_answer", "text": "Kode Responden", "placeholder": "Contoh: R-01", "required": true },
          { "id": "usia", "type": "short_answer", "text": "Usia", "placeholder": "Contoh: 24 tahun", "required": true },
          { "id": "pendidikan", "type": "multiple_choice", "text": "Pendidikan Terakhir", "options": ["SMA/Sederajat", "D3/D4", "S1", "S2/S3", "Lainnya"], "required": true },
          { "id": "frekuensi_baca", "type": "multiple_choice", "text": "Seberapa sering membaca berita online?", "options": ["Setiap hari", "Beberapa kali seminggu", "Sesekali saja", "Jarang sekali"], "required": true }
        ]
      },
      {
        "title": "B. Berita 1 — NASA Kiamat Internet",
        "description": "Berita dari detikINET: Prediksi NASA tentang badai matahari dan gangguan internet global.\nLink: https://inet.detik.com/science/d-6812051/",
        "questions": [
          { "id": "b1q1", "type": "linear_scale", "text": "Seberapa besar rasa khawatir atau panik yang Anda rasakan?", "min": 1, "max": 5, "minLabel": "Tidak khawatir", "maxLabel": "Panik sekali", "required": true },
          { "id": "b1q2", "type": "linear_scale", "text": "Seberapa besar dorongan untuk membagikan berita ini?", "min": 1, "max": 5, "minLabel": "Tidak ingin share", "maxLabel": "Langsung share", "required": true },
          { "id": "b1q3", "type": "linear_scale", "text": "Seberapa akurat kata 'Kiamat Internet' menggambarkan isi berita?", "min": 1, "max": 5, "minLabel": "Sangat lebay", "maxLabel": "Sangat akurat", "required": true },
          { "id": "b1q4", "type": "multiple_choice", "text": "Apakah NASA kompeten memprediksi 'kiamat internet'?", "options": ["Ya, NASA pasti tahu", "NASA relevan tapi tidak bisa pastikan", "Saya tidak tahu", "Nama NASA dipakai agar terkesan kredibel"], "required": true },
          { "id": "b1q5_1", "type": "short_answer", "text": "Tulis kata/frasa dramatis 1 yang Anda ingat + versi netralnya", "placeholder": "Contoh: Kiamat → Gangguan besar", "required": false },
          { "id": "b1q5_2", "type": "short_answer", "text": "Tulis kata/frasa dramatis 2", "placeholder": "Kata/frasa lainnya", "required": false },
          { "id": "b1q6", "type": "multiple_choice", "text": "Jika judul dibalik 'NASA Bilang Internet Tetap Aman', adakah data yang mendukung?", "options": ["Ya, ada data risiko tidak separah judul", "Tidak ada, semua mendukung narasi kiamat", "Tidak tahu"], "required": true },
          { "id": "b1q7", "type": "multiple_choice", "text": "Apakah berita menjelaskan proses badai → kiamat internet secara teknis?", "options": ["Ya, lengkap", "Sebagian, ada loncatan kesimpulan", "Tidak ada penjelasan teknis"], "required": true },
          { "id": "b1q7_text", "type": "short_answer", "text": "Jika ada loncatan logika, jelaskan", "placeholder": "Tulis di sini...", "required": false },
          { "id": "b1q8", "type": "multiple_choice", "text": "Apakah berita menyertakan data/sumber resmi?", "options": ["Ya, data spesifik dari sumber resmi", "Ada penyebutan NASA tanpa kutipan jelas", "Tidak ada data sama sekali"], "required": true },
          { "id": "b1q9", "type": "multiple_choice", "text": "Kesimpulan akhir tentang berita ini?", "options": ["Internet bisa mati total", "Ada risiko tapi judul berlebihan", "Clickbait — judul tidak relevan", "Tidak bisa menilai"], "required": true }
        ]
      },
      {
        "title": "C. Berita 2 — Kompas PHK",
        "description": "Berita dari Kompas: PHK Melonjak 32,19% di Paruh Pertama 2025.\nLink: https://money.kompas.com/read/2025/07/28/125720026/",
        "questions": [
          { "id": "b2q1", "type": "linear_scale", "text": "Seberapa khawatir tentang kondisi ekonomi/keamanan kerja?", "min": 1, "max": 5, "minLabel": "Tidak khawatir", "maxLabel": "Panik sekali", "required": true },
          { "id": "b2q2", "type": "linear_scale", "text": "Keinginan membagikan berita ini?", "min": 1, "max": 5, "minLabel": "Tidak ingin share", "maxLabel": "Langsung share", "required": true },
          { "id": "b2q3", "type": "linear_scale", "text": "Percaya PHK sedang melonjak signifikan?", "min": 1, "max": 5, "minLabel": "Sangat ragu", "maxLabel": "Sangat percaya", "required": true },
          { "id": "b2q4", "type": "multiple_choice", "text": "Apakah berita menyajikan gambaran lengkap dan jujur?", "options": ["Ya, data utuh kontekstual", "Cukup lengkap tapi ada detail terlewat", "Ada informasi sengaja tidak disebut", "Menyesatkan — tanpa konteks"], "required": true },
          { "id": "b2q5_1", "type": "short_answer", "text": "Kata/angka 1 yang paling Anda ingat", "placeholder": "Misal: 32,19%", "required": false },
          { "id": "b2q5_2", "type": "short_answer", "text": "Kata/angka 2 yang paling Anda ingat", "placeholder": "Kata/angka lainnya", "required": false },
          { "id": "b2q6", "type": "multiple_choice", "text": "Apakah angka-angka dalam berita mudah dipahami?", "options": ["Sangat mudah", "Cukup mudah", "Agak sulit", "Sulit dipahami"], "required": true },
          { "id": "b2q7", "type": "multiple_choice", "text": "Informasi tambahan apa yang Anda rasa perlu?", "options": ["Perbandingan tahun sebelumnya", "Data per sektor/daerah", "Total angkatan kerja", "Semua sudah cukup", "Tidak tahu"], "required": true },
          { "id": "b2q8", "type": "multiple_choice", "text": "Apakah Anda percaya data PHK yang disajikan?", "options": ["Sangat percaya — sumber pemerintah", "Cukup percaya", "Kurang percaya", "Tidak tahu"], "required": true },
          { "id": "b2q9", "type": "multiple_choice", "text": "Bagaimana situasi PHK di Indonesia menurut Anda?", "options": ["Sangat mengkhawatirkan", "Cukup mengkhawatirkan", "Biasa saja", "Tidak tahu"], "required": true },
          { "id": "b2q10", "type": "multiple_choice", "text": "Apa yang paling mungkin Anda lakukan?", "options": ["Percaya begitu saja", "Share ke medsos", "Cari data BPS/BPJS", "Abaikan"], "required": true }
        ]
      },
      {
        "title": "D. Refleksi Akhir",
        "questions": [
          { "id": "rf1", "type": "linear_scale", "text": "Kepercayaan terhadap media berita digital Indonesia?", "min": 1, "max": 5, "minLabel": "Sangat tidak percaya", "maxLabel": "Sangat percaya", "required": true },
          { "id": "rf2", "type": "multiple_choice", "text": "Apakah cara menyikapi berita berubah?", "options": ["Ya, jadi lebih kritis", "Sedikit berubah", "Tidak berubah"], "required": true },
          { "id": "rf_komentar", "type": "paragraph", "text": "Hal lain yang ingin disampaikan?", "placeholder": "Komentar bebas (boleh dikosongkan)...", "required": false }
        ]
      }
    ]
  };
})();
