import { ApiError, checkResponse } from '@utils/check-response';
import { BASE_API_URL } from '@utils/constants';
import { getAccessToken, getRefreshToken, setAuthTokens } from '@utils/token';

import type {
  TAuthResponse,
  TCreateOrderRequest,
  TIngredient,
  TIngredientType,
  TLoginRequest,
  TPasswordResetConfirmRequest,
  TPasswordResetRequest,
  TRegisterRequest,
  TUpdateUserRequest,
  TUser,
  TUserResponse,
} from '@utils/types';

type TApiRecord = Record<string, unknown>;
type TRefreshResponse = {
  success: true;
  accessToken: string;
  refreshToken: string;
};
type TMessageResponse = {
  success: true;
  message: string;
};

const ingredientTypes: readonly TIngredientType[] = ['bun', 'sauce', 'main'];

const isRecord = (value: unknown): value is TApiRecord =>
  typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const requireSuccess = (payload: unknown, failureMessage: string): TApiRecord => {
  if (!isRecord(payload) || payload.success !== true) {
    throw new Error(failureMessage);
  }

  return payload;
};

const normalizeUser = (value: unknown): TUser => {
  if (!isRecord(value) || !isString(value.email) || !isString(value.name)) {
    throw new Error('Сервер вернул некорректные данные пользователя');
  }

  return { email: value.email, name: value.name };
};

const normalizeAuthResponse = (payload: unknown): TAuthResponse => {
  const result = requireSuccess(payload, 'Сервер сообщил об ошибке авторизации');

  if (!isString(result.accessToken) || !isString(result.refreshToken)) {
    throw new Error('Сервер не вернул токены авторизации');
  }

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    success: true,
    user: normalizeUser(result.user),
  };
};

const normalizeUserResponse = (payload: unknown): TUserResponse => {
  const result = requireSuccess(payload, 'Сервер сообщил об ошибке пользователя');

  return { success: true, user: normalizeUser(result.user) };
};

const normalizeMessageResponse = (payload: unknown): TMessageResponse => {
  const result = requireSuccess(payload, 'Сервер сообщил об ошибке запроса');

  if (!isString(result.message)) {
    throw new Error('Сервер вернул некорректный ответ');
  }

  return { message: result.message, success: true };
};

const normalizeIngredient = (value: unknown): TIngredient => {
  if (!isRecord(value) || !ingredientTypes.includes(value.type as TIngredientType)) {
    throw new Error('Сервер вернул некорректный ингредиент');
  }

  const {
    __v,
    _id,
    calories,
    carbohydrates,
    fat,
    image,
    image_large,
    image_mobile,
    name,
    price,
    proteins,
    type,
  } = value;

  if (
    !isString(_id) ||
    !isString(name) ||
    !isFiniteNumber(proteins) ||
    !isFiniteNumber(fat) ||
    !isFiniteNumber(carbohydrates) ||
    !isFiniteNumber(calories) ||
    !isFiniteNumber(price) ||
    !isString(image) ||
    !isString(image_large) ||
    !isString(image_mobile) ||
    !isFiniteNumber(__v)
  ) {
    throw new Error('Сервер вернул некорректный ингредиент');
  }

  return {
    __v,
    _id,
    calories,
    carbohydrates,
    fat,
    image,
    image_large,
    image_mobile,
    name,
    price,
    proteins,
    type: type as TIngredientType,
  };
};

export const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> =>
  checkResponse<T>(await fetch(`${BASE_API_URL}${endpoint}`, options));

const withAuthorization = (options: RequestInit = {}): RequestInit => {
  const headers = new Headers(options.headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set('authorization', accessToken);
  }

  return { ...options, headers };
};

const isExpiredAccessToken = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status === 403 &&
  /jwt expired|token is invalid/i.test(error.message);

const refreshAuthTokens = async (): Promise<void> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Не найден токен обновления');
  }

  const result = requireSuccess(
    await request<unknown>('/auth/token', {
      body: JSON.stringify({ token: refreshToken }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    'Не удалось обновить токен'
  );

  if (!isString(result.accessToken) || !isString(result.refreshToken)) {
    throw new Error('Сервер не вернул обновленные токены');
  }

  const tokens: TRefreshResponse = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    success: true,
  };
  setAuthTokens(tokens);
};

export const requestWithRefresh = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  try {
    return await request<T>(endpoint, withAuthorization(options));
  } catch (error) {
    if (!isExpiredAccessToken(error)) {
      throw error;
    }

    await refreshAuthTokens();
    return request<T>(endpoint, withAuthorization(options));
  }
};

export const getIngredients = async (signal?: AbortSignal): Promise<TIngredient[]> => {
  const result = requireSuccess(
    await request<unknown>('/ingredients', { signal }),
    'Сервер сообщил об ошибке загрузки ингредиентов'
  );

  if (!Array.isArray(result.data)) {
    throw new Error('Сервер вернул некорректный список ингредиентов');
  }

  return result.data.map(normalizeIngredient);
};

export const createOrder = async (
  payload: TCreateOrderRequest,
  signal?: AbortSignal
): Promise<number> => {
  const result = requireSuccess(
    await requestWithRefresh<unknown>('/orders', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    }),
    'Сервер сообщил об ошибке создания заказа'
  );

  if (!isRecord(result.order) || !isFiniteNumber(result.order.number)) {
    throw new Error('Сервер вернул некорректный номер заказа');
  }

  return result.order.number;
};

export const register = async (payload: TRegisterRequest): Promise<TAuthResponse> =>
  normalizeAuthResponse(
    await request<unknown>('/auth/register', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );

export const login = async (payload: TLoginRequest): Promise<TAuthResponse> =>
  normalizeAuthResponse(
    await request<unknown>('/auth/login', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );

export const logout = async (): Promise<TMessageResponse> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Не найден токен обновления');
  }

  return normalizeMessageResponse(
    await request<unknown>('/auth/logout', {
      body: JSON.stringify({ token: refreshToken }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );
};

export const getUser = async (): Promise<TUser> =>
  normalizeUserResponse(await requestWithRefresh<unknown>('/auth/user')).user;

export const updateUser = async (payload: TUpdateUserRequest): Promise<TUser> =>
  normalizeUserResponse(
    await requestWithRefresh<unknown>('/auth/user', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
  ).user;

export const requestPasswordReset = async (
  payload: TPasswordResetRequest
): Promise<TMessageResponse> =>
  normalizeMessageResponse(
    await request<unknown>('/password-reset', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );

export const confirmPasswordReset = async (
  payload: TPasswordResetConfirmRequest
): Promise<TMessageResponse> =>
  normalizeMessageResponse(
    await request<unknown>('/password-reset/reset', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );
