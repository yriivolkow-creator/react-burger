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

  // number is now order _id (ObjectId)
  const orderId = number;

  // Try to get order from feed or user orders
  const orderFromFeed = useAppSelector((state) =>
    orderId ? selectOrderByNumber(state, parseInt(orderId, 10)) : undefined
  );
  const orderFromUser = useAppSelector((state) =>
    orderId ? selectUserOrderByNumber(state, parseInt(orderId, 10)) : undefined
  );

  useEffect(() => {
    if (!orderId) {
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

    // Otherwise fetch from API by order id
    const fetchOrder = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (_err) {
        setError('Не удалось загрузить заказ');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrder();
  }, [orderId, orderFromFeed, orderFromUser, dispatch]);

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
