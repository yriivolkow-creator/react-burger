import { checkResponse } from '@utils/check-response';
import { BASE_API_URL } from '@utils/constants';

import type { TCreateOrderRequest, TIngredient, TIngredientType } from '@utils/types';

type TApiRecord = Record<string, unknown>;

const ingredientTypes: readonly TIngredientType[] = ['bun', 'sauce', 'main'];

const isRecord = (value: unknown): value is TApiRecord =>
  typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

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
    typeof _id !== 'string' ||
    typeof name !== 'string' ||
    !isFiniteNumber(proteins) ||
    !isFiniteNumber(fat) ||
    !isFiniteNumber(carbohydrates) ||
    !isFiniteNumber(calories) ||
    !isFiniteNumber(price) ||
    typeof image !== 'string' ||
    typeof image_large !== 'string' ||
    typeof image_mobile !== 'string' ||
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

const request = (endpoint: string, options?: RequestInit): Promise<unknown> =>
  fetch(`${BASE_API_URL}${endpoint}`, options).then(checkResponse);

const requireSuccessfulResponse = (
  payload: unknown,
  failureMessage: string
): TApiRecord => {
  if (!isRecord(payload) || payload.success !== true) {
    throw new Error(failureMessage);
  }

  return payload;
};

export const getIngredients = async (signal?: AbortSignal): Promise<TIngredient[]> => {
  const result = requireSuccessfulResponse(
    await request('/ingredients', { signal }),
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
  const result = requireSuccessfulResponse(
    await request('/orders', {
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
