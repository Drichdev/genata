import { Parser } from "json2csv";

export const exportToCSV = (data: Record<string, string>[]): string => {
  const parser = new Parser();
  return parser.parse(data);
};
