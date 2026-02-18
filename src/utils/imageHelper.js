export const fixImageUrl = (url) => {
  if (!url) return null;
  // Replace localhost with the specific IP address
  return url.replace('http://localhost:5000', 'http://192.168.100.12:5000');
};
