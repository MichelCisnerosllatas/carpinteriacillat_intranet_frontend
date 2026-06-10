// src/shared/config/cookies.storage.ts;
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export const CookieStorage = {
  set(name: string, value: string, maxAge = DEFAULT_MAX_AGE) {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
  },

  remove(name: string) {
    if (typeof window === 'undefined') return

    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
  },
}
// export const CookieStorage = {
//   set(name: string, value: string) {
//     if (typeof window === 'undefined') return
//
//     document.cookie = `${name}=${value}; path=/; SameSite=Lax`
//   },
//
//   remove(name: string) {
//     if (typeof window === 'undefined') return
//
//     document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
//   },
// }