import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const url = process.env.EXPRESS_SUPABASE_URL
const key = process.env.EXPRESS_SUPABASE_SERVICE_KEY
const output = process.env.EXPRESS_BACKUP_DIR || resolve('backups')
if (!url || !key) throw new Error('Set EXPRESS_SUPABASE_URL and EXPRESS_SUPABASE_SERVICE_KEY first.')

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const tables = ['profiles', 'customers', 'settings', 'ledger_transactions', 'audit_log']
const data = { format: 'express-credit-ledger-backup-v1', created_at: new Date().toISOString(), project_url: url, tables: {} }
for (const table of tables) {
  const { data: rows, error } = await db.from(table).select('*')
  if (error) throw new Error(`${table}: ${error.message}`)
  data.tables[table] = rows
}
await mkdir(output, { recursive: true })
const stamp = data.created_at.replaceAll(':', '-').replaceAll('.', '-')
const file = resolve(output, `express-ledger-${stamp}.json`)
await writeFile(file, JSON.stringify(data, null, 2), 'utf8')
console.log(`Backup saved: ${file}`)
