function doPost(e) {
  try {
    var body = (e && e.postData && e.postData.contents) || '';
    if (typeof body === 'string' && body.length > 0) {
      var parsed = JSON.parse(body);
      if (parsed && parsed.action === 'createForm') {
        return createFormFromJson(parsed.definition || parsed);
      }
      if (parsed && parsed.kode !== undefined) {
        return handleRequest(e);
      }
    }
  } catch(err) { /* not JSON body, continue */ }

  if (e && e.parameter) {
    if (e.parameter.action === 'createForm' && e.parameter.definition) {
      return createFormFromJson(JSON.parse(e.parameter.definition));
    }
    if (e.parameter.data) {
      return handleRequest(e);
    }
  }
  return handleRequest(e);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'createForm' && e.parameter.definition) {
    return createFormFromJson(JSON.parse(e.parameter.definition));
  }
  return handleRequest(e);
}

function createFormFromJson(data) {
  try {
    var form = FormApp.create(data.title || 'Untitled Form');
    form.setDescription(data.description || '');
    form.setCollectEmail(false);
    form.setIsQuiz(false);
    form.setShowLinkToRespondAgain(false);
    form.setLimitOneResponsePerUser(false);

    if (data.confirmationMessage) {
      form.setConfirmationMessage(data.confirmationMessage);
    }

    var allItems = [];

    if (data.sections) {
      for (var si = 0; si < data.sections.length; si++) {
        var sec = data.sections[si];
        if (sec.questions) {
          for (var qi = 0; qi < sec.questions.length; qi++) {
            var q = sec.questions[qi];
            q._sectionIndex = si;
            allItems.push(q);
          }
        }
      }
    }

    for (var i = 0; i < allItems.length; i++) {
      var q = allItems[i];
      var item = null;

      if (q.type === 'section_title' || q.type === 'section') {
        var si = form.addPageBreakItem();
        si.setTitle(q.title || q.text || '');
        if (q.description) si.setHelpText(q.description);
        item = si;
      } else if (q.type === 'screen_break' || q.type === 'page_break') {
        item = form.addPageBreakItem().setTitle(q.title || '');
      } else if (q.type === 'linear_scale' || q.type === 'likert' || q.type === 'scale') {
        item = form.addScaleItem();
        item.setTitle(q.text || '');
        item.setBounds(q.min || 1, q.max || 5);
        if (q.minLabel && q.maxLabel) {
          item.setLabels(q.minLabel, q.maxLabel);
        } else if (q.labels && q.labels.length >= 2) {
          item.setLabels(q.labels[0], q.labels[q.labels.length - 1]);
        }
      } else if (q.type === 'multiple_choice' || q.type === 'radio' || q.type === 'mcq') {
        item = form.addMultipleChoiceItem();
        item.setTitle(q.text || '');
        if (q.options && q.options.length > 0) {
          item.setChoiceValues(q.options);
        }
      } else if (q.type === 'checkbox' || q.type === 'checklist') {
        item = form.addCheckboxItem();
        item.setTitle(q.text || '');
        if (q.options && q.options.length > 0) {
          item.setChoiceValues(q.options);
        }
      } else if (q.type === 'dropdown') {
        item = form.addListItem();
        item.setTitle(q.text || '');
        if (q.options && q.options.length > 0) {
          item.setChoiceValues(q.options);
        }
      } else if (q.type === 'short_answer' || q.type === 'text' || q.type === 'short') {
        item = form.addTextItem();
        item.setTitle(q.text || '');
        if (q.placeholder) item.setHelpText(q.placeholder);
      } else if (q.type === 'paragraph' || q.type === 'long_text' || q.type === 'long') {
        item = form.addParagraphTextItem();
        item.setTitle(q.text || '');
        if (q.placeholder) item.setHelpText(q.placeholder);
      } else if (q.type === 'date') {
        item = form.addDateItem();
        item.setTitle(q.text || '');
      } else if (q.type === 'time') {
        item = form.addTimeItem();
        item.setTitle(q.text || '');
      } else if (q.type === 'image') {
        try {
          if (q.url) {
            var blob = UrlFetchApp.fetch(q.url).getBlob();
            item = form.addImageItem().setImage(blob);
          }
        } catch(imgerr) { /* skip image on error */ }
      }

      if (item) {
        item.setRequired(q.required !== false);
        if (q.id) item.setHelpText(q.id);
      }
    }

    var url = form.getPublishedUrl();
    var editUrl = form.getEditUrl();

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok',
        url: url,
        editUrl: editUrl,
        formId: form.getId(),
        title: data.title,
        questionCount: allItems.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('createForm error:', err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        error: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(e) {
  try {
    var data = {};
    if (e && e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      // fallback: try reading query string
      var qs = (e && e.queryString) || '';
      if (qs.indexOf('data=') >= 0) {
        var parts = qs.split('&');
        for (var i = 0; i < parts.length; i++) {
          var kv = parts[i].split('=');
          if (kv[0] === 'data') {
            data = JSON.parse(decodeURIComponent(kv[1]));
            break;
          }
        }
      }
    }

    console.log('data keys:', JSON.stringify(Object.keys(data)));

    var columns = [
      'timestamp', 'group', 'kode', 'usia', 'pendidikan', 'frekuensi_baca',
      'b1q1', 'b1q2', 'b1q3', 'b1q4',
      'b1q5_1', 'b1q5_2',
      'b1q6', 'b1q7', 'b1q7_text', 'b1q8', 'b1q9',
      'b2q1', 'b2q2', 'b2q3', 'b2q4',
      'b2q5_1', 'b2q5_2',
      'b2q6', 'b2q7', 'b2q8', 'b2q9', 'b2q10',
      'rf1', 'rf2', 'rf3', 'rf3s', 'rf3_pengalaman', 'rf_komentar'
    ];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Data');
    if (!sheet) {
      sheet = ss.insertSheet('Data');
      sheet.appendRow(columns);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columns);
    }

    var row = columns.map(function(col) {
      return data[col] || '';
    });
    sheet.appendRow(row);

    console.log('row appended');

    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Survei Literasi Forensik</title>' +
      '<style>body{font-family:Georgia,serif;background:#faf7f2;color:#1a1208;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center;}' +
      '.card{background:white;border-top:4px solid #1a1208;padding:40px;max-width:480px;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,.08);}' +
      'h2{font-size:22px;margin-bottom:10px;}' +
      'p{font-size:14px;color:#6b5e4a;line-height:1.6;}' +
      '</style></head><body>' +
      '<div class="card">' +
      '<h2>✓ Jawaban Tersimpan</h2>' +
      '<p>Terima kasih atas partisipasi Anda. Jawaban Anda telah berhasil direkam dan akan digunakan untuk kemajuan penelitian literasi media di Indonesia.</p>' +
      '<p style="margin-top:16px;font-size:12px;color:#b8860b;">Survei Literasi Forensik · Universitas Negeri Surabaya · 2025</p>' +
      '</div></body></html>'
    ).setTitle('Survei Literasi Forensik - Terkirim');

  } catch (err) {
    console.error('Error:', err.toString());

    return HtmlService.createHtmlOutput(
      '<html><body style="font-family:sans-serif;padding:40px;text-align:center;">' +
      '<h2>Maaf, terjadi kesalahan</h2>' +
      '<p>' + err.toString() + '</p>' +
      '<p style="margin-top:20px;">Silakan tutup halaman ini dan laporkan ke peneliti.</p></body></html>'
    ).setTitle('Error');
  }
}

function ensureDataSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ds = ss.getSheetByName('Data');
  if (ds && ds.getLastRow() > 0) return ds;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    if (s.getName() === 'Dashboard' || s.getName() === 'Data') continue;
    if (s.getLastRow() > 1) {
      s.setName('Data');
      return s;
    }
  }
  if (!ds) ds = ss.insertSheet('Data');
  return ds;
}

function refreshDashboard() {
  SpreadsheetApp.flush();
  var dash = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
  if (dash) {
    dash.getRange('A2').setFormula('="Last updated: "&TEXT(NOW(),"dd MMM yyyy HH:mm")');
  }
}

function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = ensureDataSheet();
  if (data.getLastRow() === 1) {
    SpreadsheetApp.getUi().alert('Belum ada data responden. Isi dulu sheet Data dengan data survei.');
    return;
  }
  var dn = data.getName();
  var lastDataRow = data.getLastRow();

  var dash = ss.getSheetByName('Dashboard');
  if (dash) {
    var oldCharts = dash.getCharts();
    for (var ci = 0; ci < oldCharts.length; ci++) dash.removeChart(oldCharts[ci]);
    dash.clearContents();
    dash.clearFormats();
  } else {
    dash = ss.insertSheet('Dashboard');
  }

  dash.getRange('A1:I1').mergeAcross();
  dash.getRange('A1').setValue('DASHBOARD SURVEI LITERASI FORENSIK').setFontSize(18).setFontWeight('bold');
  dash.getRange('A1').setBackground('#1a1208').setFontColor('#faf7f2').setHorizontalAlignment('center').setVerticalAlignment('middle');
  dash.setRowHeight(1, 40);

  dash.getRange('A2:I2').mergeAcross();
  dash.getRange('A2').setFormula('="Last updated: "&TEXT(NOW(),"dd MMM yyyy HH:mm")');
  dash.getRange('A2').setFontStyle('italic').setFontColor('#6b5e4a').setFontSize(11).setHorizontalAlignment('center');
  dash.setRowHeight(2, 22);

  // ── Ringkasan ──
  dash.getRange('A4').setValue('RINGKASAN').setFontSize(13).setFontWeight('bold');
  dash.getRange('A4').setBackground('#e8e0d0');

  var totalFormula = '=COUNTA(' + dn + '!A2:A' + lastDataRow + ')';
  dash.getRange('A5').setFormula('="Total Responden:  " & ' + totalFormula).setFontSize(12).setFontWeight('bold');
  dash.getRange('A5').setBorder(true,true,true,true,false,false, '#d4c9b0', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  dash.getRange('A6').setFormula('="Grup A (Kontrol):     " & COUNTIF(' + dn + '!B2:B' + lastDataRow + ',"A")').setFontSize(12);
  dash.getRange('A7').setFormula('="Grup B (Perlakuan): " & COUNTIF(' + dn + '!B2:B' + lastDataRow + ',"B")').setFontSize(12);
  dash.getRange('A6:A7').setBorder(true,true,true,true,false,false, '#d4c9b0', SpreadsheetApp.BorderStyle.SOLID);
  dash.setColumnWidth(1, 240);

  // ── Tabel Grup untuk Pie ──
  dash.getRange('D5').setValue('Grup');
  dash.getRange('E5').setValue('Responden');
  dash.getRange('D5:E5').setFontWeight('bold').setBackground('#1a1208').setFontColor('white').setHorizontalAlignment('center');
  dash.getRange('D6').setFormula(
    '=QUERY(' + dn + '!B2:B' + lastDataRow + ',"select B, count(B) where B is not null group by B label count(B)\'\'",0)'
  );
  dash.getRange('D6:E7').setHorizontalAlignment('center');

  var pie = dash.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dash.getRange('D5:E7'))
    .setPosition(5, 7, 0, 0)
    .setOption('title', 'Proporsi Grup A vs B')
    .setOption('width', 320).setOption('height', 260)
    .setOption('pieSliceText', 'value')
    .setOption('legend', {position: 'bottom'})
    .setOption('colors', ['#1a4a7a', '#c0392b'])
    .build();
  dash.insertChart(pie);

  // ── Demografi ──
  var demoRow = 10;
  dash.getRange('A' + demoRow).setValue('DEMOGRAFI').setFontSize(13).setFontWeight('bold');
  dash.getRange('A' + demoRow).setBackground('#e8e0d0');

  var usRow = demoRow + 2;
  dash.getRange('A' + usRow).setValue('Usia').setFontWeight('bold');
  dash.getRange('B' + usRow).setValue('Responden').setFontWeight('bold');
  dash.getRange('A' + usRow + ':B' + usRow).setBackground('#1a1208').setFontColor('white').setHorizontalAlignment('center');
  dash.getRange('A' + (usRow+1)).setFormula(
    '=QUERY(' + dn + '!D2:D' + lastDataRow + ',"select D,count(D) where D is not null group by D order by D label count(D)\'\'",0)'
  );
  dash.getRange('A' + (usRow+1) + ':B30').setHorizontalAlignment('center');

  var pendRow = demoRow + 2;
  dash.getRange('D' + pendRow).setValue('Pendidikan').setFontWeight('bold');
  dash.getRange('E' + pendRow).setValue('Responden').setFontWeight('bold');
  dash.getRange('D' + pendRow + ':E' + pendRow).setBackground('#1a1208').setFontColor('white').setHorizontalAlignment('center');
  dash.getRange('D' + (pendRow+1)).setFormula(
    '=QUERY(' + dn + '!E2:E' + lastDataRow + ',"select E,count(E) where E is not null group by E order by count(E) desc label count(E)\'\'",0)'
  );
  dash.getRange('D' + (pendRow+1) + ':E30').setHorizontalAlignment('center');

  var freqRow = demoRow + 2;
  dash.getRange('G' + freqRow).setValue('Frekuensi Baca').setFontWeight('bold');
  dash.getRange('H' + freqRow).setValue('Responden').setFontWeight('bold');
  dash.getRange('G' + freqRow + ':H' + freqRow).setBackground('#1a1208').setFontColor('white').setHorizontalAlignment('center');
  dash.getRange('G' + (freqRow+1)).setFormula(
    '=QUERY(' + dn + '!F2:F' + lastDataRow + ',"select F,count(F) where F is not null group by F order by count(F) desc label count(F)\'\'",0)'
  );
  dash.getRange('G' + (freqRow+1) + ':H30').setHorizontalAlignment('center');

  var colChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dash.getRange('A' + usRow + ':B30'))
    .setPosition(usRow, 1, 0, 0)
    .setOption('title', 'Distribusi Usia')
    .setOption('width', 350).setOption('height', 250)
    .setOption('hAxis', {title: 'Usia'}).setOption('vAxis', {title: 'Responden'})
    .setOption('colors', ['#1a4a7a'])
    .build();
  dash.insertChart(colChart);

  var barChart = dash.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(dash.getRange('D' + pendRow + ':E30'))
    .setPosition(pendRow, 5, 0, 0)
    .setOption('title', 'Distribusi Pendidikan')
    .setOption('width', 400).setOption('height', 250)
    .setOption('hAxis', {title: 'Responden'}).setOption('vAxis', {title: 'Pendidikan'})
    .setOption('colors', ['#b8860b'])
    .build();
  dash.insertChart(barChart);

  var freqChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dash.getRange('G' + freqRow + ':H30'))
    .setPosition(freqRow, 10, 0, 0)
    .setOption('title', 'Frekuensi Membaca Berita')
    .setOption('width', 350).setOption('height', 250)
    .setOption('hAxis', {title: 'Frekuensi'}).setOption('vAxis', {title: 'Responden'})
    .setOption('colors', ['#2d5a27'])
    .build();
  dash.insertChart(freqChart);

  dash.activate();
  ss.moveActiveSheet(0);
  SpreadsheetApp.flush();
}

function formatDataSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = ensureDataSheet();
  if (data.getLastRow() < 1) return;

  var lastCol = data.getLastColumn();
  var lastRow = data.getLastRow();
  var headerRange = data.getRange(1, 1, 1, lastCol);
  var dataRange = data.getRange(2, 1, lastRow - 1, lastCol);

  headerRange.setBackground('#1a1208').setFontColor('#faf7f2').setFontWeight('bold').setFontSize(10);
  headerRange.setHorizontalAlignment('center').setVerticalAlignment('middle');
  data.setRowHeight(1, 28);

  data.setFrozenRows(1);
  data.setFrozenColumns(2);

  if (lastRow > 1) {
    dataRange.setVerticalAlignment('middle').setFontSize(10);
    dataRange.setBorder(true, true, true, true, true, true, '#d4c9b0', SpreadsheetApp.BorderStyle.SOLID);
    for (var r = 2; r <= lastRow; r++) {
      if ((r - 2) % 2 === 0) {
        data.getRange(r, 1, 1, lastCol).setBackground('#f5f0e8');
      }
    }
  }

  for (var c = 1; c <= lastCol; c++) {
    var maxLen = 10;
    if (lastRow > 1) {
      var colVals = data.getRange(2, c, lastRow - 1 > 100 ? 100 : lastRow - 1, 1).getValues();
      for (var vr = 0; vr < colVals.length; vr++) {
        var val = String(colVals[vr][0] || '');
        if (val.length > maxLen) maxLen = val.length;
      }
    }
    var headerText = String(data.getRange(1, c).getValue() || '');
    if (headerText.length > maxLen) maxLen = headerText.length;
    var colWidth = Math.min(Math.max(maxLen * 8 + 20, 80), 350);
    data.setColumnWidth(c, colWidth);
  }

  data.activate();
  SpreadsheetApp.flush();
}
