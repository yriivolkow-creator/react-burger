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
export const wsConnect = createAction<string>('ordersFeed/wsConnect');
export const wsDisconnect = createAction('ordersFeed/wsDisconnect');
export const wsConnecting = createAction('ordersFeed/wsConnecting');

export const ordersFeedSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(wsConnecting, (state) => {
        state.status = 'pending';
      })
      .addCase(wsConnect, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(wsDisconnect, (state) => {
        state.status = 'idle';
        state.orders = [];
        state.total = 0;
        state.totalToday = 0;
      })
      .addCase(onMessage, (state, action) => {
        const { orders, total, totalToday } = action.payload;
        state.orders = orders;
        state.total = total;
        state.totalToday = totalToday;
      });
  },
  initialState,
  name: 'ordersFeed',
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

export const { onOpen, onClose, onError, onMessage } = ordersFeedSlice.actions;

// Selectors
export const selectOrdersFeedState = (state: RootState): TOrdersState => {
  const ordersFeed = state.ordersFeed;
  if (!ordersFeed) {
    return { error: null, orders: [], status: 'idle', total: 0, totalToday: 0 };
  }
  return ordersFeed;
};

export const selectAllOrders = (state: RootState): TOrder[] =>
  selectOrdersFeedState(state).orders;

export const selectTotalOrders = (state: RootState): number =>
  selectOrdersFeedState(state).total;

export const selectTotalTodayOrders = (state: RootState): number =>
  selectOrdersFeedState(state).totalToday;

export const selectOrderById = (state: RootState, orderId: string): TOrder | undefined =>
  selectAllOrders(state).find((order) => order._id === orderId);

export const selectOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | undefined =>
  selectAllOrders(state).find((order) => order.number === orderNumber);

export const selectDoneOrders = (state: RootState): TOrder[] =>
  selectAllOrders(state)?.filter((order) => order.status === 'done') ?? [];

export const selectPendingOrders = (state: RootState): TOrder[] =>
  selectAllOrders(state)?.filter((order) => order.status === 'pending') ?? [];
