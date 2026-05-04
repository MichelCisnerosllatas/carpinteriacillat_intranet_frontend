// src/config/app/appInfo.ts
export const getAppPlatform = () => {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  return 'server';
};

export const getAppVersion = () => {
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
};

export const getClientType = () => {
  return 'web';
};