function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};

    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

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

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columns);
    }

    var row = columns.map(function(col) {
      return data[col] || '';
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput('<h2>Survey endpoint aktif.</h2>');
}
