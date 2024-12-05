export const isHtmlResponse = (contentType: string | null): boolean => {
  if (!contentType) return false;
  return contentType.toLowerCase().includes("text/html");
};
