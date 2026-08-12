# Google Drive cloud backup setup

1. Open https://script.google.com and create a new project named **Express Credit Ledger Backup**.
2. Replace the contents of `Code.gs` with the project `Code.gs` file.
3. Open **Project Settings** (gear icon), then **Script Properties**.
4. Add `BACKUP_EMAIL` with `abdullaharaji67th+backup@gmail.com`.
5. Add `BACKUP_PASSWORD` with the private password created for the backup account.
6. Save the properties. Never paste the password into source code.
7. Return to the editor, choose `setupHourlyBackup` from the function list, and click **Run**.
8. Approve access to external requests and Google Drive.
9. Open Google Drive and verify the `Express Credit Ledger Backups` folder contains a timestamped JSON file.

The script runs hourly on Google's servers and moves backups older than 30 days to Trash.
