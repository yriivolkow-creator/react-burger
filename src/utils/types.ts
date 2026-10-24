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

export type TUser = {
  email: string;
  name: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TAuthResponse = TAuthTokens & {
  success: true;
  user: TUser;
};

export type TUserResponse = {
  success: true;
  user: TUser;
};

export type TRegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type TLoginRequest = Pick<TRegisterRequest, 'email' | 'password'>;

export type TUpdateUserRequest = TRegisterRequest;

export type TPasswordResetRequest = {
  email: string;
};

export type TPasswordResetConfirmRequest = {
  password: string;
  token: string;
};

export type TAuthState = {
  user: TUser | null;
  status: TRequestStatus;
  error: string | null;
  isChecked: boolean;
};
