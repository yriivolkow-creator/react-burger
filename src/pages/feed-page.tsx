import { useEffect, useRef } from 'react';

import { FeedStats } from '@components/feed-stats/feed-stats';
import { OrderCard } from '@components/order-card/order-card';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { selectIngredientsStatus } from '@services/ingredients/ingredientsSlice';
import { fetchIngredients } from '@services/ingredients/ingredientsThunks';
import {
  selectAllOrders,
  wsConnect,
  wsDisconnect,
} from '@services/orders-feed/ordersFeedSlice';
import { WS_ORDERS_ALL_URL } from '@utils/constants';

import styles from './feed-page.module.css';

export const FeedPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAllOrders);
  // const feedState = useAppSelector((state) => state.ordersFeed);
  const ingredientsStatus = useAppSelector(selectIngredientsStatus);
  const isConnectedRef = useRef(false);

  // Load ingredients if not loaded
  useEffect(() => {
    if (ingredientsStatus === 'idle') {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredientsStatus]);

  useEffect(() => {
    // Only connect if not already connected
    if (!isConnectedRef.current) {
      isConnectedRef.current = true;
      dispatch(wsConnect(WS_ORDERS_ALL_URL));
    }

    return () => {
      // Only disconnect if this component is actually unmounting
      if (isConnectedRef.current) {
        isConnectedRef.current = false;
        dispatch(wsDisconnect());
      }
    };
  }, [dispatch]);

  return (
    <main className={styles.page}>
      <h1 className="text text_type_main-large mb-5">Лента заказов</h1>
      <div className={styles.content}>
        <section className={`${styles.orders} custom-scroll`}>
          {orders.length === 0 ? (
            <p className="text text_type_main-default text_color_inactive">
              Загрузка заказов...
            </p>
          ) : (
            orders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </section>
        <aside className={styles.stats}>
          <FeedStats />
        </aside>
      </div>
    </main>
  );
};
