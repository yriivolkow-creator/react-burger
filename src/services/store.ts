import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { authSlice } from '@services/auth/authSlice';
import { burgerConstructorSlice } from '@services/burger-constructor/burgerConstructorSlice';
import { ingredientsSlice } from '@services/ingredients/ingredientsSlice';
import { orderSlice } from '@services/order/orderSlice';
import { ordersFeedMiddleware } from '@services/orders-feed/ordersFeedMiddleware';
import { ordersFeedSlice } from '@services/orders-feed/ordersFeedSlice';
import { selectedIngredientSlice } from '@services/selected-ingredient/selectedIngredientSlice';
import { userOrdersMiddleware } from '@services/user-orders/userOrdersMiddleware';
import { userOrdersSlice } from '@services/user-orders/userOrdersSlice';

export const rootReducer = combineSlices(
  authSlice,
  ingredientsSlice,
  burgerConstructorSlice,
  selectedIngredientSlice,
  orderSlice,
  ordersFeedSlice,
  userOrdersSlice
);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ordersFeedMiddleware).concat(userOrdersMiddleware),
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
