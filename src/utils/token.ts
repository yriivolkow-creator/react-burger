const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const PASSWORD_RESET_REQUESTED_KEY = 'passwordResetRequested';

import type { TAuthTokens } from '@utils/types';

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthTokens = ({ accessToken, refreshToken }: TAuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasAuthTokens = (): boolean =>
  getAccessToken() !== null && getRefreshToken() !== null;

export const markPasswordResetRequested = (): void => {
  localStorage.setItem(PASSWORD_RESET_REQUESTED_KEY, 'true');
};

export const hasPasswordResetRequest = (): boolean =>
  localStorage.getItem(PASSWORD_RESET_REQUESTED_KEY) === 'true';

export const clearPasswordResetRequest = (): void => {
  localStorage.removeItem(PASSWORD_RESET_REQUESTED_KEY);
};
