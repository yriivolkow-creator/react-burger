import { createSlice } from '@reduxjs/toolkit';

import {
  checkUserAuth,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateCurrentUser,
} from '@services/auth/authThunks';

import type { RootState } from '@services/store';
import type { TAuthState } from '@utils/types';

const initialState: TAuthState = {
  error: null,
  isChecked: false,
  status: 'idle',
  user: null,
};

export const authSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.error = null;
        state.status = 'succeeded';
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error =
          action.payload ?? action.error.message ?? 'Не удалось зарегистрироваться';
        state.status = 'failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.error = null;
        state.status = 'succeeded';
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Не удалось войти';
        state.status = 'failed';
      })
      .addCase(checkUserAuth.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.error = null;
        state.isChecked = true;
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.error = null;
        state.isChecked = true;
        state.status = 'idle';
        state.user = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.error = null;
        state.status = 'idle';
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Не удалось выйти';
        state.status = 'failed';
      })
      .addCase(updateCurrentUser.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.error = null;
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.error =
          action.payload ?? action.error.message ?? 'Не удалось обновить профиль';
        state.status = 'failed';
      })
      .addCase(forgotPassword.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error =
          action.payload ?? action.error.message ?? 'Не удалось отправить письмо';
        state.status = 'failed';
      })
      .addCase(resetPassword.pending, (state) => {
        state.error = null;
        state.status = 'pending';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error =
          action.payload ?? action.error.message ?? 'Не удалось изменить пароль';
        state.status = 'failed';
      });
  },
  initialState,
  name: 'auth',
  reducers: {
    clearAuthError: (state): void => {
      state.error = null;
    },
    markAuthChecked: (state): void => {
      state.isChecked = true;
    },
  },
});

export const { clearAuthError, markAuthChecked } = authSlice.actions;

export const selectAuthState = (state: RootState): TAuthState => state.auth;

export const selectCurrentUser = (state: RootState): TAuthState['user'] =>
  selectAuthState(state).user;

export const selectAuthStatus = (state: RootState): TAuthState['status'] =>
  selectAuthState(state).status;

export const selectAuthError = (state: RootState): string | null =>
  selectAuthState(state).error;

export const selectIsAuthChecked = (state: RootState): boolean =>
  selectAuthState(state).isChecked;
