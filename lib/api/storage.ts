const ACCESS_TOKEN_KEY = 'studyflow:access_token';
const REFRESH_TOKEN_KEY = 'studyflow:refresh_token';

const canUseStorage = () => typeof window !== 'undefined';

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(tokens: { access: string; refresh: string }) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  },
  clear() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
