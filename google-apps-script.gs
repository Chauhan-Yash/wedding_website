/**
 * RSVP receiver for the Yash & Divya wedding invitation.
 *
 * Setup:
 * 1. Create a blank Google Sheet, then open Extensions > Apps Script.
 * 2. Replace the default code with this file and save.
 * 3. Deploy > New deployment > Web app.
 * 4. Execute as: Me. Who has access: Anyone.
 * 5. Copy the Web App URL into rsvp-config.js in this website.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const payload = JSON.parse(e.postData.contents || '{}');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted at', 'Guest name', 'Attendance', 'Message']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    payload.name || '',
    payload.attendance === 'accept' ? 'Joyfully accept' : 'Regretfully decline',
    payload.message || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
