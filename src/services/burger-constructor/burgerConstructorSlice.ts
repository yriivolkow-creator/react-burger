import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

import type { RootState } from '@services/store';
import type {
  TBurgerConstructorState,
  TConstructorIngredient,
  TIngredient,
} from '@utils/types';

const initialState: TBurgerConstructorState = {
  bun: null,
  ingredients: [],
};

const isFilling = (
  ingredient: TIngredient | TConstructorIngredient
): ingredient is TConstructorIngredient =>
  ingredient.type === 'sauce' || ingredient.type === 'main';

export const burgerConstructorSlice = createSlice({
  initialState,
  name: 'burgerConstructor',
  reducers: {
    setBun: (state, action: PayloadAction<TIngredient>): void => {
      if (action.payload.type === 'bun') {
        state.bun = action.payload;
      }
    },
    addIngredient: {
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
      reducer: (state, action: PayloadAction<TConstructorIngredient>): void => {
        if (isFilling(action.payload)) {
          state.ingredients.push(action.payload);
        }
      },
    },
    removeIngredient: (state, action: PayloadAction<string>): void => {
      const ingredientIndex = state.ingredients.findIndex(
        (ingredient) => ingredient.id === action.payload
      );

      if (ingredientIndex !== -1) {
        state.ingredients.splice(ingredientIndex, 1);
      }
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ): void => {
      const { fromIndex, toIndex } = action.payload;
      const isValidIndex = (index: number): boolean =>
        Number.isInteger(index) && index >= 0 && index < state.ingredients.length;

      if (!isValidIndex(fromIndex) || !isValidIndex(toIndex) || fromIndex === toIndex) {
        return;
      }

      const [ingredient] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, ingredient);
    },
  },
});

export const { addIngredient, moveIngredient, removeIngredient, setBun } =
  burgerConstructorSlice.actions;

export const selectBurgerConstructorState = (
  state: RootState
): TBurgerConstructorState => state.burgerConstructor;

export const selectConstructorBun = createSelector(
  [selectBurgerConstructorState],
  (constructorState): TIngredient | null => constructorState.bun
);

export const selectConstructorIngredients = createSelector(
  [selectBurgerConstructorState],
  (constructorState): TConstructorIngredient[] => constructorState.ingredients
);

export const selectIngredientCountsById = createSelector(
  [selectConstructorBun, selectConstructorIngredients],
  (bun, ingredients): Record<string, number> => {
    const counts: Record<string, number> = {};

    if (bun) {
      counts[bun._id] = 2;
    }

    for (const ingredient of ingredients) {
      counts[ingredient._id] = (counts[ingredient._id] ?? 0) + 1;
    }

    return counts;
  }
);

export const selectTotalPrice = createSelector(
  [selectConstructorBun, selectConstructorIngredients],
  (bun, ingredients): number =>
    (bun?.price ?? 0) * 2 +
    ingredients.reduce((total, ingredient) => total + ingredient.price, 0)
);

export const selectOrderIngredientIds = createSelector(
  [selectConstructorBun, selectConstructorIngredients],
  (bun, ingredients): string[] => {
    if (!bun || ingredients.length === 0) {
      return [];
    }

    return [bun._id, ...ingredients.map((ingredient) => ingredient._id), bun._id];
  }
);

export const selectCanSubmitOrder = createSelector(
  [
    selectConstructorBun,
    selectConstructorIngredients,
    (state: RootState): RootState['order']['status'] => state.order.status,
  ],
  (bun, ingredients, orderStatus): boolean =>
    bun !== null && ingredients.length > 0 && orderStatus !== 'pending'
);
