import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  confirmPasswordReset,
  getUser,
  login,
  logout,
  register,
  requestPasswordReset,
  updateUser,
} from '@utils/api';
import { clearAuthTokens, setAuthTokens } from '@utils/token';

import type {
  TAuthResponse,
  TLoginRequest,
  TPasswordResetConfirmRequest,
  TPasswordResetRequest,
  TRegisterRequest,
  TUpdateUserRequest,
  TUser,
} from '@utils/types';

type TThunkConfig = {
  rejectValue: string;
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const registerUser = createAsyncThunk<
  TAuthResponse,
  TRegisterRequest,
  TThunkConfig
>('auth/register', async (payload, thunkAPI) => {
  try {
    const response = await register(payload);
    setAuthTokens(response);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Не удалось зарегистрироваться')
    );
  }
});

export const loginUser = createAsyncThunk<TAuthResponse, TLoginRequest, TThunkConfig>(
  'auth/login',
  async (payload, thunkAPI) => {
    try {
      const response = await login(payload);
      setAuthTokens(response);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Не удалось войти'));
    }
  }
);

export const checkUserAuth = createAsyncThunk<TUser, void, TThunkConfig>(
  'auth/checkUser',
  async (_, thunkAPI) => {
    try {
      return await getUser();
    } catch (error) {
      clearAuthTokens();
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, 'Не удалось проверить авторизацию')
      );
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, TThunkConfig>(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await logout();
      clearAuthTokens();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, 'Не удалось выйти'));
    }
  }
);

export const updateCurrentUser = createAsyncThunk<
  TUser,
  TUpdateUserRequest,
  TThunkConfig
>('auth/updateUser', async (payload, thunkAPI) => {
  try {
    return await updateUser(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Не удалось обновить профиль')
    );
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  TPasswordResetRequest,
  TThunkConfig
>('auth/forgotPassword', async (payload, thunkAPI) => {
  try {
    await requestPasswordReset(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Не удалось отправить письмо')
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  TPasswordResetConfirmRequest,
  TThunkConfig
>('auth/resetPassword', async (payload, thunkAPI) => {
  try {
    await confirmPasswordReset(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, 'Не удалось изменить пароль')
    );
  }
});
