const normalizeBaseUrl = (value) => {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue || trimmedValue === '/') {
    return trimmedValue;
  }

  return trimmedValue.replace(/\/+$/, '');
};

const getAllowedOrigins = () => {
  const origins = new Set();
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.DASHBOARD_URL,
    ...String(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
  ];

  configuredOrigins
    .map(normalizeBaseUrl)
    .filter(Boolean)
    .forEach((origin) => origins.add(origin));

  return [...origins];
};

const validateEnv = () => {
  const missingVariables = ['MONGO_URI', 'JWT_SECRET'].filter(
    (name) => !String(process.env[name] || '').trim()
  );

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  if (String(process.env.JWT_SECRET).trim().length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  if ((process.env.NODE_ENV || '').toLowerCase() === 'production' && getAllowedOrigins().length === 0) {
    throw new Error(
      'Production deployments must define at least one allowed origin via CLIENT_URL, DASHBOARD_URL, or ALLOWED_ORIGINS.'
    );
  }
};

module.exports = {
  getAllowedOrigins,
  normalizeBaseUrl,
  validateEnv
};
