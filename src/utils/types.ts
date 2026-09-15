import type { EntityState } from '@reduxjs/toolkit';

export type TRequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type TIngredientType = 'bun' | 'sauce' | 'main';

export type TIngredient = {
  _id: string;
  name: string;
  type: TIngredientType;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
  __v: number;
};

export type TIngredientsResponse = {
  success: boolean;
  data: TIngredient[];
};

export type TConstructorIngredient = TIngredient & {
  /** UI instance identity; API requests continue to use the canonical `_id`. */
  id: string;
};

export type TCreateOrderRequest = {
  ingredients: string[];
};

export type TOrderResponse = {
  success: boolean;
  name: string;
  order: {
    number: number;
  };
};

export type TIngredientsState = EntityState<TIngredient, string> & {
  status: TRequestStatus;
  error: string | null;
  currentRequestId: string | null;
};

export type TBurgerConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

export type TSelectedIngredientState = {
  ingredient: TIngredient | null;
};

export type TOrderState = {
  number: number | null;
  status: TRequestStatus;
  error: string | null;
  isModalOpen: boolean;
  currentRequestId: string | null;
};
