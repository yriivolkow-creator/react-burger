import { createSlice } from '@reduxjs/toolkit';

import { createOrder } from '@services/order/orderThunks';

import type { RootState } from '@services/store';
import type { TOrderState } from '@utils/types';

const initialState: TOrderState = {
  currentRequestId: null,
  error: null,
  isModalOpen: false,
  number: null,
  status: 'idle',
};

export const orderSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.error = null;
        state.isModalOpen = false;
        state.number = null;
        state.status = 'pending';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.currentRequestId = null;
        state.error = null;
        state.isModalOpen = true;
        state.number = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createOrder.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.currentRequestId = null;
        state.isModalOpen = false;
        state.number = null;

        if (action.meta.aborted) {
          state.error = null;
          state.status = 'idle';
          return;
        }

        state.error =
          action.payload ?? action.error.message ?? 'Не удалось создать заказ';
        state.status = 'failed';
      });
  },
  initialState,
  name: 'order',
  reducers: {
    closeOrderModal: (state): void => {
      state.currentRequestId = null;
      state.error = null;
      state.isModalOpen = false;
      state.number = null;
      state.status = 'idle';
    },
  },
});

export const { closeOrderModal } = orderSlice.actions;

export const selectOrderState = (state: RootState): TOrderState => state.order;

export const selectOrderNumber = (state: RootState): number | null =>
  selectOrderState(state).number;

export const selectOrderStatus = (state: RootState): TOrderState['status'] =>
  selectOrderState(state).status;

export const selectOrderError = (state: RootState): string | null =>
  selectOrderState(state).error;

export const selectIsOrderModalOpen = (state: RootState): boolean =>
  selectOrderState(state).isModalOpen;
