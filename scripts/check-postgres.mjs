#!/usr/bin/env node
// Read-only PostgreSQL readiness check. Requires psql installed and PG* connection
// environment variables. Never runs migrations and never prints credentials.
import { spawnSync } from 'node:child_process'

const required = ['PGHOST', 'PGDATABASE', 'PGUSER']
const missing = required.filter(name => !process.env[name])
if (missing.length) {
  console.error('Missing PostgreSQL connection settings: ' + missing.join(', '))
  console.error('Use PGHOST, PGPORT, PGDATABASE, PGUSER and PGPASSWORD (or secure PostgreSQL authentication).')
  process.exit(2)
}
if (process.env.PGHOST?.startsWith('/')) {
  console.error('Unix socket connections are not supported by this remote readiness check.')
  process.exit(2)
}
const sql = `BEGIN READ ONLY;
SELECT current_setting('server_version_num')::int >= 160000 AS postgres_16_or_newer;
SELECT COUNT(*) AS application_tables FROM information_schema.tables
 WHERE table_schema = 'public' AND table_name IN (
 'seasons','teams','players','data_import_runs','games',
 'player_game_stats','goalie_game_stats','player_season_snapshots',
 'goalie_season_snapshots','fantasy_rosters','fantasy_roster_entries',
 'forecast_snapshots');
ROLLBACK;`
const result = spawnSync('psql', ['-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
  encoding: 'utf8',
  timeout: 15000,
  env: { ...process.env, PGCONNECT_TIMEOUT: '8', PGOPTIONS: '-c default_transaction_read_only=on' }
})
if (result.error) {
  console.error(result.error.code === 'ENOENT' ? 'psql is not installed.' : 'PostgreSQL readiness check failed.')
  process.exit(1)
}
if (result.status !== 0) {
  console.error('PostgreSQL connection or read-only query failed. Check network, credentials and database permissions.')
  process.exit(1)
}
const lines = result.stdout.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean)
if (lines.length < 2 || !['t','f'].includes(lines[0]) || !/^\d+$/.test(lines[1])) {
  console.error('Unexpected PostgreSQL readiness response.')
  process.exit(1)
}
const tableCount = Number(lines[1])
console.log('PostgreSQL >= 16:', lines[0] === 't' ? 'yes' : 'no')
console.log('Application tables present:', tableCount, '/ 12')
if (lines[0] !== 't') process.exitCode = 1
