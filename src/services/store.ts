import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { authSlice } from '@services/auth/authSlice';
import { burgerConstructorSlice } from '@services/burger-constructor/burgerConstructorSlice';
import { ingredientsSlice } from '@services/ingredients/ingredientsSlice';
import { orderSlice } from '@services/order/orderSlice';
import { selectedIngredientSlice } from '@services/selected-ingredient/selectedIngredientSlice';

export const rootReducer = combineSlices(
  authSlice,
  ingredientsSlice,
  burgerConstructorSlice,
  selectedIngredientSlice,
  orderSlice
);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
