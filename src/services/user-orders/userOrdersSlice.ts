import { createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@services/store';
import type { TOrder, TOrdersResponse, TOrdersState } from '@utils/types';

const initialState: TOrdersState = {
  error: null,
  orders: [],
  status: 'idle',
  total: 0,
  totalToday: 0,
};

// Actions
export const wsConnectUserOrders = createAction<string>('userOrders/wsConnect');
export const wsDisconnectUserOrders = createAction('userOrders/wsDisconnect');
export const wsConnectingUserOrders = createAction('userOrders/wsConnecting');

export const userOrdersSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(wsConnectingUserOrders, (state) => {
        state.status = 'pending';
      })
      .addCase(wsConnectUserOrders, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(wsDisconnectUserOrders, (state) => {
        state.status = 'idle';
        state.orders = [];
        state.total = 0;
        state.totalToday = 0;
      });
  },
  initialState,
  name: 'userOrders',
  reducers: {
    onOpen: (state) => {
      state.error = null;
    },
    onClose: (state) => {
      state.status = 'idle';
    },
    onError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    onMessage: (state, action: PayloadAction<TOrdersResponse>) => {
      const { orders, total, totalToday } = action.payload;
      state.orders = orders;
      state.total = total;
      state.totalToday = totalToday;
    },
  },
});

export const { onOpen, onClose, onError, onMessage } = userOrdersSlice.actions;

// Selectors
export const selectUserOrdersState = (state: RootState): TOrdersState => {
  const userOrders = state.userOrders;
  if (!userOrders) {
    return { error: null, orders: [], status: 'idle', total: 0, totalToday: 0 };
  }
  return userOrders;
};

export const selectUserOrders = (state: RootState): TOrder[] =>
  selectUserOrdersState(state).orders;

export const selectUserOrderById = (
  state: RootState,
  orderId: string
): TOrder | undefined => selectUserOrders(state).find((order) => order._id === orderId);

export const selectUserOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | undefined =>
  selectUserOrders(state).find((order) => order.number === orderNumber);
