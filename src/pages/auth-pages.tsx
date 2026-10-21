import {
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthForm } from '@components/auth-form/auth-form';
import { selectAuthError, selectAuthStatus } from '@services/auth/authSlice';
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from '@services/auth/authThunks';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { clearPasswordResetRequest, markPasswordResetRequested } from '@utils/token';

import type { FormEvent } from 'react';
import type { Location } from 'react-router-dom';

type TLocationState = {
  from?: Location;
};

const isPending = (status: string): boolean => status === 'pending';

export const LoginPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = (location.state as TLocationState | null)?.from?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      void navigate(from, { replace: true });
    } catch {
      return;
    }
  };

  return (
    <AuthForm
      error={error}
      footer={
        <>
          <p>
            Вы новый пользователь?{' '}
            <Link className="page-link" to="/register">
              Зарегистрироваться
            </Link>
          </p>
          <p>
            Забыли пароль?{' '}
            <Link className="page-link" to="/forgot-password">
              Восстановить пароль
            </Link>
          </p>
        </>
      }
      isSubmitting={isPending(status)}
      onSubmit={(event) => void handleSubmit(event)}
      submitLabel="Войти"
      title="Вход"
    >
      <EmailInput value={email} onChange={(event) => setEmail(event.target.value)} />
      <PasswordInput
        icon="ShowIcon"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Пароль"
        value={password}
      />
    </AuthForm>
  );
};

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await dispatch(registerUser({ email, name, password })).unwrap();
    } catch {
      return;
    }
  };

  return (
    <AuthForm
      error={error}
      footer={
        <p>
          Уже зарегистрированы?{' '}
          <Link className="page-link" to="/login">
            Войти
          </Link>
        </p>
      }
      isSubmitting={isPending(status)}
      onSubmit={(event) => void handleSubmit(event)}
      submitLabel="Зарегистрироваться"
      title="Регистрация"
    >
      <Input
        icon="EditIcon"
        onChange={(event) => setName(event.target.value)}
        placeholder="Имя"
        type="text"
        value={name}
      />
      <EmailInput value={email} onChange={(event) => setEmail(event.target.value)} />
      <PasswordInput
        icon="ShowIcon"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Пароль"
        value={password}
      />
    </AuthForm>
  );
};

export const ForgotPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      markPasswordResetRequested();
      void navigate('/reset-password', { replace: true });
    } catch {
      return;
    }
  };

  return (
    <AuthForm
      error={error}
      footer={
        <p>
          Вспомнили пароль?{' '}
          <Link className="page-link" to="/login">
            Войти
          </Link>
        </p>
      }
      isSubmitting={isPending(status)}
      onSubmit={(event) => void handleSubmit(event)}
      submitLabel="Восстановить"
      title="Восстановление пароля"
    >
      <EmailInput
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Укажите e-mail"
        value={email}
      />
    </AuthForm>
  );
};

export const ResetPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await dispatch(resetPassword({ password, token })).unwrap();
      clearPasswordResetRequest();
      void navigate('/login', { replace: true });
    } catch {
      return;
    }
  };

  return (
    <AuthForm
      error={error}
      footer={
        <p>
          Вспомнили пароль?{' '}
          <Link className="page-link" to="/login">
            Войти
          </Link>
        </p>
      }
      isSubmitting={isPending(status)}
      onSubmit={(event) => void handleSubmit(event)}
      submitLabel="Сохранить"
      title="Восстановление пароля"
    >
      <PasswordInput
        icon="ShowIcon"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Введите новый пароль"
        value={password}
      />
      <Input
        onChange={(event) => setToken(event.target.value)}
        placeholder="Введите код из письма"
        type="text"
        value={token}
      />
    </AuthForm>
  );
};
