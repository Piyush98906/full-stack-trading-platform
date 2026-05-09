const normalizeBaseUrl = (value) => {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue || trimmedValue === '/') {
    return trimmedValue;
  }

  return trimmedValue.replace(/\/+$/, '');
};

const joinUrl = (baseUrl, path) => {
  if (!baseUrl || baseUrl === '/') {
    return path;
  }

  return `${baseUrl}${path}`;
};

const frontendBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_FRONTEND_URL) ||
  (import.meta.env.DEV ? 'http://localhost:5173' : '');

export const frontendHomeUrl = joinUrl(frontendBaseUrl, '/');
export const apiBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
