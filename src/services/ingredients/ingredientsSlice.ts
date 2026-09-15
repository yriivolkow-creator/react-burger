import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { fetchIngredients } from '@services/ingredients/ingredientsThunks';

import type { RootState } from '@services/store';
import type { TIngredient, TIngredientsState, TIngredientType } from '@utils/types';

export const ingredientsAdapter = createEntityAdapter<TIngredient, string>({
  selectId: (ingredient: TIngredient): string => ingredient._id,
});

const initialState: TIngredientsState = ingredientsAdapter.getInitialState({
  currentRequestId: null,
  error: null,
  status: 'idle',
});

export const ingredientsSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.error = null;
        state.status = 'pending';
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        ingredientsAdapter.setAll(state, action.payload);
        state.currentRequestId = null;
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.currentRequestId = null;

        if (action.meta.aborted) {
          state.error = null;
          state.status = 'idle';
          return;
        }

        state.error =
          action.payload ?? action.error.message ?? 'Не удалось загрузить ингредиенты';
        state.status = 'failed';
      });
  },
  initialState,
  name: 'ingredients',
  reducers: {},
});

export const selectIngredientsState = (state: RootState): TIngredientsState =>
  state.ingredients;

const adapterSelectors =
  ingredientsAdapter.getSelectors<RootState>(selectIngredientsState);

export const selectAllIngredients = adapterSelectors.selectAll;
export const selectIngredientById = adapterSelectors.selectById;

export const selectIngredientsByType = (
  state: RootState,
  type: TIngredientType
): TIngredient[] =>
  selectAllIngredients(state).filter((ingredient) => ingredient.type === type);

export const selectIngredientsStatus = (state: RootState): TIngredientsState['status'] =>
  selectIngredientsState(state).status;

export const selectIngredientsError = (state: RootState): string | null =>
  selectIngredientsState(state).error;
