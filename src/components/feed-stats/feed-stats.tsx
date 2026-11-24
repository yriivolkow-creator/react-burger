import { useAppSelector } from '@services/hooks';
import {
  selectDoneOrders,
  selectPendingOrders,
  selectTotalOrders,
  selectTotalTodayOrders,
} from '@services/orders-feed/ordersFeedSlice';

import styles from './feed-stats.module.css';

const MAX_ORDERS_PER_COLUMN = 10;
const MAX_COLUMNS = 2;

export const FeedStats = (): React.JSX.Element => {
  const total = useAppSelector(selectTotalOrders) ?? 0;
  const totalToday = useAppSelector(selectTotalTodayOrders) ?? 0;
  const doneOrders = useAppSelector(selectDoneOrders) ?? [];
  const pendingOrders = useAppSelector(selectPendingOrders) ?? [];

  // Split orders into columns (max 10 per column, max 2 columns)
  const splitIntoColumns = (orders: typeof doneOrders): number[][] => {
    const columns: number[][] = [];
    const orderNumbers = orders
      .slice(0, MAX_ORDERS_PER_COLUMN * MAX_COLUMNS)
      .map((order) => order.number);

    for (let i = 0; i < orderNumbers.length; i += MAX_ORDERS_PER_COLUMN) {
      columns.push(orderNumbers.slice(i, i + MAX_ORDERS_PER_COLUMN));
    }

    return columns;
  };

  const doneColumns = splitIntoColumns(doneOrders);
  const pendingColumns = splitIntoColumns(pendingOrders);

  return (
    <section className={styles.stats}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className="text text_type_main-medium mb-6">Готовы:</h3>
          <div className={styles.orders_grid}>
            {doneColumns.map((column, colIndex) => (
              <ul className={styles.order_list} key={colIndex}>
                {column.map((orderNumber) => (
                  <li
                    className={`text text_type_digits-default ${styles.order_number_done}`}
                    key={orderNumber}
                  >
                    {orderNumber}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h3 className="text text_type_main-medium mb-6">В работе:</h3>
          <div className={styles.orders_grid}>
            {pendingColumns.map((column, colIndex) => (
              <ul className={styles.order_list} key={colIndex}>
                {column.map((orderNumber) => (
                  <li className="text text_type_digits-default" key={orderNumber}>
                    {orderNumber}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.totals}>
        <div className={styles.total_row}>
          <h3 className="text text_type_main-medium">Выполнено за всё время:</h3>
          <span className={`text text_type_digits-large ${styles.glow}`}>{total}</span>
        </div>

        <div className={styles.total_row}>
          <h3 className="text text_type_main-medium">Выполнено за сегодня:</h3>
          <span className={`text text_type_digits-large ${styles.glow}`}>
            {totalToday}
          </span>
        </div>
      </div>
    </section>
  );
};
