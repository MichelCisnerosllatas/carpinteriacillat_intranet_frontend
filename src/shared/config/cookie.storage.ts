// src/shared/config/cookies.storage.ts;
export const CookieStorage = {
  set(name: string, value: string) {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=${value}; path=/; SameSite=Lax`
  },

  remove(name: string) {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
  },
}