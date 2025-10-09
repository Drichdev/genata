import { Parser } from "json2csv";

export const exportToCSV = (data: any[]): string => {
  const parser = new Parser();
  return parser.parse(data);
};
