import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { OrderInfo } from '@components/order-info/order-info';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { selectOrderByNumber } from '@services/orders-feed/ordersFeedSlice';
import { selectUserOrderByNumber } from '@services/user-orders/userOrdersSlice';
import { getOrder } from '@utils/api';

import type { TOrder } from '@utils/types';

import styles from './order-page.module.css';

export const OrderPage = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to get order from feed or user orders
  const orderFromFeed = useAppSelector((state) =>
    number ? selectOrderByNumber(state, parseInt(number, 10)) : undefined
  );
  const orderFromUser = useAppSelector((state) =>
    number ? selectUserOrderByNumber(state, parseInt(number, 10)) : undefined
  );

  useEffect(() => {
    const orderNumber = number ? parseInt(number, 10) : null;

    if (!orderNumber) {
      setError('Номер заказа не указан');
      setIsLoading(false);
      return;
    }

    // If order is in store, use it
    if (orderFromFeed) {
      setOrder(orderFromFeed);
      setIsLoading(false);
      return;
    }

    if (orderFromUser) {
      setOrder(orderFromUser);
      setIsLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchOrder = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await getOrder(orderNumber);
        setOrder(data);
      } catch (_err) {
        setError('Не удалось загрузить заказ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [number, orderFromFeed, orderFromUser, dispatch]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className="text text_type_main-default">Загрузка...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <p className="text text_type_main-default text_color_inactive">{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={styles.page}>
        <p className="text text_type_main-default text_color_inactive">
          Заказ не найден
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <OrderInfo order={order} showStatus />
    </main>
  );
};
