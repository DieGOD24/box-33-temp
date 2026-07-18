import 'reflect-metadata'
import dataSource from './data-source'

const RETRIES = 10
const RETRY_DELAY_MS = 3_000
/** Serializes concurrent replicas racing to migrate on deploy. */
const MIGRATION_LOCK_KEY = 733100901

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Production migration runner, executed by docker-entrypoint.sh BEFORE the app
 * boots. Non-zero exit aborts the deploy — a half-migrated schema never serves.
 */
async function run() {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      await dataSource.initialize()
      break
    } catch (err) {
      console.error(`DB connect attempt ${attempt}/${RETRIES} failed: ${(err as Error).message}`)
      if (attempt === RETRIES) process.exit(1)
      await sleep(RETRY_DELAY_MS)
    }
  }

  try {
    await dataSource.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY])
    const applied = await dataSource.runMigrations({ transaction: 'all' })
    if (applied.length === 0) {
      console.log('✓ Schema up to date — no migrations to run')
    } else {
      for (const m of applied) console.log(`✓ Applied migration ${m.name}`)
    }
    await dataSource.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY])
  } catch (err) {
    console.error(`✗ Migration failed: ${(err as Error).message}`)
    process.exit(1)
  } finally {
    await dataSource.destroy().catch(() => undefined)
  }
}

void run()
