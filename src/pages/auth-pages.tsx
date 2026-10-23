import {
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthForm } from '@components/auth-form/auth-form';
import { useForm } from '@hooks/use-form';
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

type TLoginForm = {
  email: string;
  password: string;
};

type TRegisterForm = TLoginForm & {
  name: string;
};

type TForgotPasswordForm = Pick<TLoginForm, 'email'>;

type TResetPasswordForm = {
  password: string;
  token: string;
};

const isPending = (status: string): boolean => status === 'pending';

export const LoginPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();
  const navigate = useNavigate();
  const { handleChange, values } = useForm<TLoginForm>({
    email: '',
    password: '',
  });
  const from = (location.state as TLocationState | null)?.from?.pathname ?? '/';

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    void dispatch(loginUser(values))
      .unwrap()
      .then(() => {
        void navigate(from, { replace: true });
      })
      .catch(() => undefined);
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
      onSubmit={handleSubmit}
      submitLabel="Войти"
      title="Вход"
    >
      <EmailInput name="email" onChange={handleChange} value={values.email} />
      <PasswordInput
        icon="ShowIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        value={values.password}
      />
    </AuthForm>
  );
};

export const RegisterPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const { handleChange, values } = useForm<TRegisterForm>({
    email: '',
    name: '',
    password: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void dispatch(registerUser(values))
      .unwrap()
      .catch(() => undefined);
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
      onSubmit={handleSubmit}
      submitLabel="Зарегистрироваться"
      title="Регистрация"
    >
      <Input
        icon="EditIcon"
        name="name"
        onChange={handleChange}
        placeholder="Имя"
        type="text"
        value={values.name}
      />
      <EmailInput name="email" onChange={handleChange} value={values.email} />
      <PasswordInput
        icon="ShowIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        value={values.password}
      />
    </AuthForm>
  );
};

export const ForgotPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const { handleChange, values } = useForm<TForgotPasswordForm>({ email: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    void dispatch(forgotPassword(values))
      .unwrap()
      .then(() => {
        markPasswordResetRequested();
        void navigate('/reset-password', { replace: true });
      })
      .catch(() => undefined);
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
      onSubmit={handleSubmit}
      submitLabel="Восстановить"
      title="Восстановление пароля"
    >
      <EmailInput
        name="email"
        onChange={handleChange}
        placeholder="Укажите e-mail"
        value={values.email}
      />
    </AuthForm>
  );
};

export const ResetPasswordPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const { handleChange, values } = useForm<TResetPasswordForm>({
    password: '',
    token: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    void dispatch(resetPassword(values))
      .unwrap()
      .then(() => {
        clearPasswordResetRequest();
        void navigate('/login', { replace: true });
      })
      .catch(() => undefined);
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
      onSubmit={handleSubmit}
      submitLabel="Сохранить"
      title="Восстановление пароля"
    >
      <PasswordInput
        icon="ShowIcon"
        name="password"
        onChange={handleChange}
        placeholder="Введите новый пароль"
        value={values.password}
      />
      <Input
        name="token"
        onChange={handleChange}
        placeholder="Введите код из письма"
        type="text"
        value={values.token}
      />
    </AuthForm>
  );
};
