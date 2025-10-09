type SQLType = "VARCHAR(255)" | "INT" | "DECIMAL(10,2)" | "BOOLEAN" | "DATE" | "DATETIME" | "CHAR(36)";
type Value = string | number | boolean | null | undefined;

const inferSqlType = (val: Value): SQLType => {
  if (val === null || val === undefined || val === "") return "VARCHAR(255)";
  // boolean
  if (val === true || val === false || val === "true" || val === "false") return "BOOLEAN";
  // int
  if (typeof val === "number" && Number.isInteger(val)) return "INT";
  if (typeof val === "string" && /^-?\d+$/.test(val)) return "INT";
  // float
  if (typeof val === "number" && !Number.isNaN(val)) return "DECIMAL(10,2)";
  if (typeof val === "string" && /^-?\d+\.\d+$/.test(val)) return "DECIMAL(10,2)";
  // date (YYYY-MM-DD)
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return "DATE";
  // datetime (ISO)
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) return "DATETIME";
  // uuid
  if (typeof val === "string" && /^[0-9a-fA-F-]{36}$/.test(val)) return "CHAR(36)";
  return "VARCHAR(255)";
};

const sqlEscape = (val: Value): string => {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  // keep numbers as-is
  if (typeof val === "number") return String(val);
  let s = String(val);
  s = s.replace(/'/g, "''");
  return `'${s}'`;
};

export const exportToSQL = (data: Record<string, string>[], tableName = "mock_data"): string => {
  if (!data || data.length === 0) return "-- No data";
  const columns = Object.keys(data[0] || {});

  // infer column types from first non-empty value per column
  const colTypes: Record<string, SQLType> = {};
  for (const col of columns) {
    let sample: Value = "";
    for (const row of data) {
      if (row[col] !== undefined && row[col] !== "") { sample = row[col]; break; }
    }
    colTypes[col] = inferSqlType(sample);
  }

  const createCols = columns
    .map((c) => `  \`${c}\` ${colTypes[c]}`)
    .join(",\n");

  const createStmt = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n${createCols}\n);`;

  const insertPrefix = `INSERT INTO \`${tableName}\` (\`${columns.join("\`, \`")}\`) VALUES`;
  const valuesRows = data
    .map((row) => `(${columns.map((c) => sqlEscape(row[c])).join(", ")})`)
    .join(",\n");

  const insertStmt = `${insertPrefix}\n${valuesRows};`;

  return `${createStmt}\n\n${insertStmt}\n`;
};
