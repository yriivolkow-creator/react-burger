import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@services/store';
import type { TIngredient, TSelectedIngredientState } from '@utils/types';

const initialState: TSelectedIngredientState = {
  ingredient: null,
};

export const selectedIngredientSlice = createSlice({
  initialState,
  name: 'selectedIngredient',
  reducers: {
    clearSelectedIngredient: (state): void => {
      state.ingredient = null;
    },
    selectIngredient: (state, action: PayloadAction<TIngredient>): void => {
      state.ingredient = action.payload;
    },
  },
});

export const { clearSelectedIngredient, selectIngredient } =
  selectedIngredientSlice.actions;

export const selectSelectedIngredientState = (
  state: RootState
): TSelectedIngredientState => state.selectedIngredient;

export const selectSelectedIngredient = (state: RootState): TIngredient | null =>
  selectSelectedIngredientState(state).ingredient;

export const selectIsIngredientModalOpen = (state: RootState): boolean =>
  selectSelectedIngredient(state) !== null;
