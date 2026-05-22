function doPost(e) {
  // Check if this is a form creation request
  var contents = (e && e.postData && e.postData.contents) || (e && e.parameter && e.parameter.data) || '';
  if (typeof contents === 'string' && contents.length > 0) {
    try {
      var parsed = JSON.parse(contents);
      if (parsed && parsed.action === 'createForm') {
        return createFormFromJson(parsed);
      }
    } catch(err) { /* not JSON or not createForm, continue to handleRequest */ }
  }
  // Check query string for createForm action
  if (e && e.parameter && e.parameter.action === 'createForm' && e.parameter.definition) {
    return createFormFromJson(JSON.parse(e.parameter.definition));
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

function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = ss.getSheetByName('Data') || ss.insertSheet('Data');
  var dn = data.getName();

  var dash = ss.getSheetByName('Dashboard');
  if (dash) {
    var oldCharts = dash.getCharts();
    for (var ci = 0; ci < oldCharts.length; ci++) dash.removeChart(oldCharts[ci]);
    dash.clearContents();
    dash.clearFormats();
  } else {
    dash = ss.insertSheet('Dashboard');
  }

  dash.getRange('A1').setValue('DASHBOARD SURVEI LITERASI FORENSIK').setFontSize(16).setFontWeight('bold');
  dash.getRange('A2').setFormula('="Last updated: "&TEXT(NOW(),"dd MMM yyyy HH:mm")').setFontStyle('italic').setFontColor('#666');

  dash.getRange('A4').setValue('RINGKASAN').setFontSize(12).setFontWeight('bold');
  dash.getRange('A5').setFormula('="Total: "&COUNTA(' + dn + '!A2:A)');
  dash.getRange('A6').setFormula('="Grup A: "&COUNTIF(' + dn + '!B2:B,"A")');
  dash.getRange('A7').setFormula('="Grup B: "&COUNTIF(' + dn + '!B2:B,"B")');

  dash.getRange('D5').setValue('Grup');
  dash.getRange('E5').setValue('Count');
  dash.getRange('D6').setFormula('=QUERY(' + dn + '!B2:B,"select B, count(B) where B is not null group by B label count(B)\'\'",0)');

  var pie = dash.newChart().setChartType(Charts.ChartType.PIE)
    .addRange(dash.getRange('D5:E7')).setPosition(5, 7, 0, 0)
    .setOption('title', 'Proporsi Grup A vs B')
    .setOption('width', 300).setOption('height', 250).build();
  dash.insertChart(pie);

  dash.getRange('A10').setValue('DEMOGRAFI').setFontSize(12).setFontWeight('bold');

  dash.getRange('A12').setValue('Usia');
  dash.getRange('B12').setValue('Count');
  dash.getRange('A13').setFormula('=QUERY(' + dn + '!D2:D,"select D,count(D) where D is not null group by D order by D label count(D)\'\'",0)');

  dash.getRange('D12').setValue('Pendidikan');
  dash.getRange('E12').setValue('Count');
  dash.getRange('D13').setFormula('=QUERY(' + dn + '!E2:E,"select E,count(E) where E is not null group by E order by count(E) desc label count(E)\'\'",0)');

  dash.getRange('G12').setValue('Frekuensi Baca');
  dash.getRange('H12').setValue('Count');
  dash.getRange('G13').setFormula('=QUERY(' + dn + '!F2:F,"select F,count(F) where F is not null group by F order by count(F) desc label count(F)\'\'",0)');

  var colChart = dash.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(dash.getRange('A12:B22')).setPosition(11, 1, 0, 0)
    .setOption('title', 'Distribusi Usia')
    .setOption('width', 350).setOption('height', 250).build();
  dash.insertChart(colChart);

  var barChart = dash.newChart().setChartType(Charts.ChartType.BAR)
    .addRange(dash.getRange('D12:E22')).setPosition(11, 5, 0, 0)
    .setOption('title', 'Distribusi Pendidikan')
    .setOption('width', 400).setOption('height', 250).build();
  dash.insertChart(barChart);

  var freqChart = dash.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(dash.getRange('G12:H22')).setPosition(11, 10, 0, 0)
    .setOption('title', 'Frekuensi Membaca Berita')
    .setOption('width', 350).setOption('height', 250).build();
  dash.insertChart(freqChart);

  dash.getRange('A25').setValue('ANALISIS LIKERT').setFontSize(12).setFontWeight('bold');

  var likerts = [
    {col:'G', title:'b1q1 - Berita 1 jelas'},
    {col:'H', title:'b1q2 - Berita 1 akurat'},
    {col:'I', title:'b1q3 - Berita 1 objektif'},
    {col:'R', title:'b2q1 - Berita 2 jelas'},
    {col:'S', title:'b2q2 - Berita 2 akurat'},
    {col:'T', title:'b2q3 - Berita 2 objektif'}
  ];

  var row = 27;
  for (var i = 0; i < likerts.length; i++) {
    dash.getRange('A' + row).setValue(likerts[i].title).setFontWeight('bold').setFontSize(10);
    dash.getRange('A' + (row+1)).setValue('Respon');
    dash.getRange('B' + (row+1)).setValue('Count');
    dash.getRange('A' + (row+2)).setFormula(
      '=QUERY(' + dn + '!' + likerts[i].col + '2:' + likerts[i].col + ',"select ' + likerts[i].col + ', count(' + likerts[i].col + ') where ' + likerts[i].col + ' is not null group by ' + likerts[i].col + ' order by count(' + likerts[i].col + ') desc label count(' + likerts[i].col + ')\'\'",0)'
    );
    row += 8;
  }

  dash.activate();
  ss.moveActiveSheet(0);
  SpreadsheetApp.flush();
}
