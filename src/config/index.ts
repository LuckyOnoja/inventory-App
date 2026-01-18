// src/config/index.ts

// ⚙️ MANUALLY SET YOUR ENVIRONMENT HERE
const CURRENT_ENVIRONMENT: 'development' | 'staging' | 'production' = 'development';

// Development configuration
const DEVELOPMENT = {
  API_URL: 'http://172.20.10.2:5000/api',
  SOCKET_URL: 'http://172.20.10.2:5000',
  APP_NAME: 'ToryAi (Dev)',
  DEBUG_MODE: true,
  LOG_LEVEL: 'debug' as const,
};

// Staging configuration
const STAGING = {
  API_URL: 'https://staging.inventory-guard.com/api',
  SOCKET_URL: 'https://staging.inventory-guard.com',
  APP_NAME: 'ToryAi (Staging)',
  DEBUG_MODE: true,
  LOG_LEVEL: 'info' as const,
};

// Production configuration
const PRODUCTION = {
  API_URL: 'https://inventory-guard.com/api',
  SOCKET_URL: 'https://inventory-guard.com',
  APP_NAME: 'ToryAi',
  DEBUG_MODE: false,
  LOG_LEVEL: 'error' as const,
};

// Environment configuration mapping
const ENVIRONMENTS: Record<string, any> = {
  development: DEVELOPMENT,
  staging: STAGING,
  production: PRODUCTION,
};

// Get config safely
const getConfig = () => {
  const config = ENVIRONMENTS[CURRENT_ENVIRONMENT];
  if (!config) {
    console.error(`Invalid environment: ${CURRENT_ENVIRONMENT}. Using development.`);
    return DEVELOPMENT;
  }
  return config;
};

const Config = getConfig();

// Export config and environment info
export default {
  ...Config,
  ENVIRONMENT: CURRENT_ENVIRONMENT,

  // Helper to get full URL
  getFullUrl: (path: string) => `${Config.API_URL}${path.startsWith('/') ? path : `/${path}`}`,

  // Helper to log environment info
  logEnvironment: () => {
    console.log(`Environment: ${CURRENT_ENVIRONMENT}`);
    console.log(`API URL: ${Config.API_URL}`);
  },
};