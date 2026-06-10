// src/config/api/env.ts
export enum EnvType {
  LOCAL = 'local',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

const CURRENT_ENV: EnvType = EnvType.LOCAL;

const normalizeApiUrl = (url?: string) => {
  if (!url) return undefined;

  return url.replace(/\/$/, '');
};

const ENV_CONFIG = {
  [EnvType.LOCAL]: {
    apiUrl: normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL) ?? 'http://192.168.1.112:8000/api',
    debug: true,
    internalToken: 'TU_TOKEN_INTERNO_AQUI',
  },

  [EnvType.TESTING]: {
    apiUrl: 'https://cipploreto.app.carpinteriacillat.com/api',
    debug: true,
    internalToken: 'TU_TOKEN_INTERNO_AQUI',
  },

  [EnvType.PRODUCTION]: {
    apiUrl: 'https://api.ciploreto.com/api',
    debug: false,
    internalToken: 'TU_TOKEN_INTERNO_AQUI',
  },
};

export const AppConfig = {
  env: CURRENT_ENV,
  ...ENV_CONFIG[CURRENT_ENV],
};