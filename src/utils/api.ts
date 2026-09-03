import { BASE_API_URL } from '@utils/constants';

import type { TIngredient, TIngredientsResponse } from '@utils/types';

export const getIngredients = async (
  signal?: AbortSignal
): Promise<TIngredient[]> => {
  const response = await fetch(`${BASE_API_URL}/ingredients`, { signal });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки ингридиентов: ${response.status}`);
  }

  const result = (await response.json()) as TIngredientsResponse;

  if (!result.success) {
    throw new Error('Не удалось получить данные об ингредиентах');
  }

  return result.data;
};
