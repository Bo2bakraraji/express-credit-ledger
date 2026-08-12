const SUPABASE_URL = 'https://sddssihhredgeerpqfqw.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_jpohOhZht8eDN2Pur3M9VQ_v0vfbeIf';
const FOLDER_NAME = 'Express Credit Ledger Backups';
const RETENTION_DAYS = 30;

function backupExpressLedger() {
  const props = PropertiesService.getScriptProperties();
  const email = props.getProperty('BACKUP_EMAIL');
  const password = props.getProperty('BACKUP_PASSWORD');
  if (!email || !password) throw new Error('BACKUP_EMAIL and BACKUP_PASSWORD are not configured.');

  const auth = request_('/auth/v1/token?grant_type=password', 'post', {
    email: email,
    password: password
  });
  if (!auth.access_token) throw new Error('Backup account authentication failed.');

  const snapshot = request_('/rest/v1/rpc/create_backup_snapshot', 'post', {}, auth.access_token);
  validateSnapshot_(snapshot);

  const folder = getOrCreateFolder_();
  const stamp = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd_HH-mm-ss') + '_UTC';
  folder.createFile('express-ledger_' + stamp + '.json', JSON.stringify(snapshot, null, 2), MimeType.PLAIN_TEXT);
  removeExpiredFiles_(folder);
  props.setProperty('LAST_SUCCESSFUL_BACKUP', new Date().toISOString());
}

function setupHourlyBackup() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupExpressLedger').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupExpressLedger').timeBased().everyHours(1).create();
  backupExpressLedger();
}

function testBackupNow() {
  backupExpressLedger();
  console.log('Backup completed successfully.');
}

function request_(path, method, body, accessToken) {
  const response = UrlFetchApp.fetch(SUPABASE_URL + path, {
    method: method,
    contentType: 'application/json',
    payload: JSON.stringify(body),
    headers: {
      apikey: PUBLISHABLE_KEY,
      ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {})
    },
    muteHttpExceptions: true
  });
  const text = response.getContentText();
  let data;
  try { data = JSON.parse(text); } catch (_) { throw new Error('Invalid server response: ' + text); }
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error('Supabase error ' + response.getResponseCode() + ': ' + (data.message || data.error_description || text));
  }
  return data;
}

function validateSnapshot_(data) {
  if (!data || data.format !== 'express-credit-ledger-backup-v1') throw new Error('Backup format validation failed.');
  ['settings','profiles','customers','ledger_transactions','audit_log'].forEach(key => {
    if (!Array.isArray(data[key])) throw new Error('Backup is missing ' + key + '.');
  });
}

function getOrCreateFolder_() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
}

function removeExpiredFiles_(folder) {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().startsWith('express-ledger_') && file.getDateCreated().getTime() < cutoff) file.setTrashed(true);
  }
}
