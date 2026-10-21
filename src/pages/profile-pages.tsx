import {
  Button,
  EmailInput,
  Input,
  LogoutIcon,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import {
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
} from '@services/auth/authSlice';
import { logoutUser, updateCurrentUser } from '@services/auth/authThunks';
import { useAppDispatch, useAppSelector } from '@services/hooks';

import type { FormEvent } from 'react';

type TProfileForm = {
  email: string;
  name: string;
  password: string;
};

const getProfileLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `profile-layout__link text text_type_main-medium ${
    isActive ? 'profile-layout__link_active' : ''
  }`;

export const ProfileLayout = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);

  return (
    <main className="profile-layout">
      <aside className="profile-layout__menu">
        <NavLink className={getProfileLinkClass} end to="/profile">
          Профиль
        </NavLink>
        <NavLink className={getProfileLinkClass} to="/profile/orders">
          История заказов
        </NavLink>
        <button
          className="profile-layout__logout text text_type_main-medium"
          disabled={status === 'pending'}
          onClick={() => void dispatch(logoutUser())}
          type="button"
        >
          <LogoutIcon type="secondary" />
          Выход
        </button>
        <p className="profile-layout__hint text text_type_main-default text_color_inactive">
          В этом разделе вы можете изменить свои персональные данные
        </p>
      </aside>
      <section className="profile-layout__content">
        <Outlet />
      </section>
    </main>
  );
};

export const ProfilePage = (): React.JSX.Element | null => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectCurrentUser);
  const [form, setForm] = useState<TProfileForm>({ email: '', name: '', password: '' });

  useEffect(() => {
    if (user) {
      setForm({ email: user.email, name: user.name, password: '' });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const isDirty =
    form.name !== user.name || form.email !== user.email || form.password.length > 0;

  const setField = (field: keyof TProfileForm, value: string): void => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await dispatch(updateCurrentUser(form)).unwrap();
      setForm((currentForm) => ({ ...currentForm, password: '' }));
    } catch {
      return;
    }
  };

  const handleCancel = (): void => {
    setForm({ email: user.email, name: user.name, password: '' });
  };

  return (
    <form className="profile-form" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        icon="EditIcon"
        onChange={(event) => setField('name', event.target.value)}
        placeholder="Имя"
        type="text"
        value={form.name}
      />
      <EmailInput
        isIcon
        onChange={(event) => setField('email', event.target.value)}
        value={form.email}
      />
      <PasswordInput
        icon="EditIcon"
        onChange={(event) => setField('password', event.target.value)}
        placeholder="Пароль"
        value={form.password}
      />
      {isDirty && (
        <div className="profile-form__actions">
          <Button
            htmlType="button"
            size="medium"
            type="secondary"
            onClick={handleCancel}
          >
            Отмена
          </Button>
          <Button
            htmlType="submit"
            size="medium"
            type="primary"
            disabled={status === 'pending'}
          >
            Сохранить
          </Button>
        </div>
      )}
      {error && (
        <p className="auth-form__error text text_type_main-default" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export const ProfileOrdersPage = (): React.JSX.Element => (
  <section className="stub-page">
    <h1 className="text text_type_main-large">История заказов</h1>
    <p className="text text_type_main-default text_color_inactive">
      История заказов находится в разработке
    </p>
  </section>
);
