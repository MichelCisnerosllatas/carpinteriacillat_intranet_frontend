// src/config/api/sessionExpired.ts
type SessionExpiredCallback = () => void;

let callback: SessionExpiredCallback | null = null;

export const SessionExpired = {
  setCallback: (fn: SessionExpiredCallback) => {
    callback = fn;
  },

  execute: () => {
    if (callback) {
      callback();
    }
  },
};