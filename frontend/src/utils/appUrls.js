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

const dashboardBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_DASHBOARD_URL) ||
  (import.meta.env.DEV ? 'http://localhost:5174' : '');

export const dashboardLoginUrl = joinUrl(dashboardBaseUrl, '/login');
export const dashboardRegisterUrl = joinUrl(dashboardBaseUrl, '/register');
