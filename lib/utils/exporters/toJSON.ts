export const exportToJSON = (data: Record<string, string>[]): string => {
  return JSON.stringify(data, null, 2);
};
