function doGet(e) {
  try {
    console.log('doGet called. e exists:', !!e);

    var params = (e && e.parameter) || {};
    console.log('params keys:', JSON.stringify(Object.keys(params)));

    var rawData = params.data || '{}';
    var data = JSON.parse(rawData);
    var callback = params.callback || 'callback';

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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

    console.log('row appended successfully');

    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ status: 'ok' }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (err) {
    console.error('Error:', err.toString(), 'stack:', err.stack);

    var cb = 'callback';
    try { cb = (e && e.parameter && e.parameter.callback) || 'callback'; } catch (ex) {}

    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify({ status: 'error', message: err.toString() }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  return doGet(e);
}
