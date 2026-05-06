import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  _sql = postgres(url, { ssl: "require", prepare: false, max: 5 });
  return _sql;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
