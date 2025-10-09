export const exportToJSON = (data: any[]): string => {
  return JSON.stringify(data, null, 2);
};
