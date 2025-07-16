import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';

interface Website {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

interface StatusCheck {
  id: number;
  website_id: number;
  status: string;
  response_time: number | null;
  checked_at: string;
}

interface DatabaseSchema {
  websites: Website;
  status_checks: StatusCheck;
}

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const dbPath = path.join(dataDirectory, 'database.sqlite');

const sqliteDb = new Database(dbPath);

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});
