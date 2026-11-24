import {
  Button,
  EmailInput,
  Input,
  LogoutIcon,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { OrderCard } from '@components/order-card/order-card';
import { useForm } from '@hooks/use-form';
import {
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
} from '@services/auth/authSlice';
import { logoutUser, updateCurrentUser } from '@services/auth/authThunks';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import {
  selectUserOrders,
  wsConnectUserOrders,
  wsDisconnectUserOrders,
} from '@services/user-orders/userOrdersSlice';
import { WS_ORDERS_USER_URL } from '@utils/constants';
import { getAccessToken } from '@utils/token';

import type { FormEvent } from 'react';

import styles from './profile-orders-page.module.css';

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
  const { handleChange, setValues, values } = useForm<TProfileForm>({
    email: '',
    name: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setValues({ email: user.email, name: user.name, password: '' });
    }
  }, [setValues, user]);

  if (!user) {
    return null;
  }

  const isDirty =
    values.name !== user.name ||
    values.email !== user.email ||
    values.password.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    void dispatch(updateCurrentUser(values))
      .unwrap()
      .then(() => {
        setValues((currentValues) => ({ ...currentValues, password: '' }));
      })
      .catch(() => undefined);
  };

  const handleCancel = (): void => {
    setValues({ email: user.email, name: user.name, password: '' });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <Input
        icon="EditIcon"
        name="name"
        onChange={handleChange}
        placeholder="Имя"
        type="text"
        value={values.name}
      />
      <EmailInput isIcon name="email" onChange={handleChange} value={values.email} />
      <PasswordInput
        icon="EditIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        value={values.password}
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

export const ProfileOrdersPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectUserOrders);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    const accessToken = getAccessToken();

    if (accessToken) {
      // Remove 'Bearer ' prefix if present
      const token = accessToken.replace('Bearer ', '');
      dispatch(wsConnectUserOrders(`${WS_ORDERS_USER_URL}?token=${token}`));
    }

    return () => {
      dispatch(wsDisconnectUserOrders());
    };
  }, [dispatch, tokenExpired]);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = (): void => {
      setTokenExpired((prev) => !prev);
    };

    window.addEventListener('userOrdersTokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('userOrdersTokenExpired', handleTokenExpired);
    };
  }, []);

  if (orders.length === 0) {
    return (
      <section className={styles.page}>
        <p className="text text_type_main-default text_color_inactive">
          Вы ещё не сделали ни одного заказа
        </p>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <ul className={`${styles.orders} custom-scroll`}>
        {orders.map((order) => (
          <li key={order._id}>
            <OrderCard order={order} showStatus />
          </li>
        ))}
      </ul>
    </section>
  );
};
