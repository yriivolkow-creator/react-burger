import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  selectCanSubmitOrder,
  selectOrderIngredientIds,
} from '@services/burger-constructor/burgerConstructorSlice';
import { createOrder as createOrderRequest } from '@utils/api';

import type { RootState } from '@services/store';

const incompleteOrderMessage =
  'Добавьте булку и хотя бы одну начинку перед оформлением заказа';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const createOrder = createAsyncThunk<
  number,
  void,
  { rejectValue: string; state: RootState }
>(
  'order/createOrder',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const ingredients = selectOrderIngredientIds(state);
    const canSubmitOrder =
      selectCanSubmitOrder(state) || state.order.status === 'pending';

    if (!canSubmitOrder || ingredients.length === 0) {
      return thunkAPI.rejectWithValue(incompleteOrderMessage);
    }

    try {
      return await createOrderRequest({ ingredients }, thunkAPI.signal);
    } catch (error) {
      if (thunkAPI.signal.aborted) {
        throw error;
      }

      return thunkAPI.rejectWithValue(
        getErrorMessage(error, 'Не удалось создать заказ')
      );
    }
  },
  {
    condition: (_, { getState }) => getState().order.status !== 'pending',
  }
);
