// src/config/api/env.ts
export enum EnvType {
  LOCAL = 'local',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

const CURRENT_ENV: EnvType = EnvType.LOCAL;

const ENV_CONFIG = {
  [EnvType.LOCAL]: {
    apiUrl: 'http://10.36.102.250:8000/api',
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