type PGType = "VARCHAR(255)" | "INTEGER" | "NUMERIC(10,2)" | "BOOLEAN" | "DATE" | "TIMESTAMP" | "UUID";

const inferPgType = (val: any): PGType => {
  if (val === null || val === undefined || val === "") return "VARCHAR(255)";
  if (val === true || val === false || val === "true" || val === "false") return "BOOLEAN";
  if (typeof val === "number" && Number.isInteger(val)) return "INTEGER";
  if (typeof val === "string" && /^-?\d+$/.test(val)) return "INTEGER";
  if (typeof val === "number" && !Number.isNaN(val)) return "NUMERIC(10,2)";
  if (typeof val === "string" && /^-?\d+\.\d+$/.test(val)) return "NUMERIC(10,2)";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return "DATE";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) return "TIMESTAMP";
  if (typeof val === "string" && /^[0-9a-fA-F-]{36}$/.test(val)) return "UUID";
  return "VARCHAR(255)";
};

const pgEscape = (val: any): string => {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  let s = String(val);
  s = s.replace(/'/g, "''");
  return `'${s}'`;
};

export const exportToPostgres = (data: any[], tableName = "mock_data"): string => {
  if (!data || data.length === 0) return "-- No data";
  const columns = Object.keys(data[0] || {});

  const colTypes: Record<string, PGType> = {};
  for (const col of columns) {
    let sample: any = "";
    for (const row of data) {
      if (row[col] !== undefined && row[col] !== "") { sample = row[col]; break; }
    }
    colTypes[col] = inferPgType(sample);
  }

  const createCols = columns
    .map((c) => `  "${c}" ${colTypes[c]}`)
    .join(",\n");

  const createStmt = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n${createCols}\n);`;

  const insertPrefix = `INSERT INTO "${tableName}" ("${columns.join("\", \"")}") VALUES`;
  const valuesRows = data
    .map((row) => `(${columns.map((c) => pgEscape(row[c])).join(", ")})`)
    .join(",\n");

  const insertStmt = `${insertPrefix}\n${valuesRows};`;

  return `${createStmt}\n\n${insertStmt}\n`;
};
