import { createAsyncThunk } from '@reduxjs/toolkit';

import { getIngredients } from '@utils/api';

import type { TIngredient } from '@utils/types';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, thunkAPI) => {
  try {
    return await getIngredients(thunkAPI.signal);
  } catch (error) {
    if (thunkAPI.signal.aborted) {
      throw error;
    }

    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Не удалось загрузить ингредиенты')
    );
  }
});
