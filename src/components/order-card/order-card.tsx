import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { Link, useLocation } from 'react-router-dom';

import { useAppSelector } from '@services/hooks';
import {
  selectAllIngredients,
  selectIngredientById,
} from '@services/ingredients/ingredientsSlice';

import type { TOrder } from '@utils/types';

import styles from './order-card.module.css';

type TOrderCardProps = {
  order: TOrder;
  showStatus?: boolean;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  const dayLabel =
    diffDays === 0 ? 'Сегодня' : diffDays === 1 ? 'Вчера' : `${diffDays} дней назад`;

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${dayLabel}, ${hours}:${minutes} i-GMT+3`;
};

const getStatusText = (status: TOrder['status']): string => {
  switch (status) {
    case 'created':
      return 'Создан';
    case 'pending':
      return 'Готовится';
    case 'done':
      return 'Выполнен';
    default:
      return 'Неизвестен';
  }
};

const getStatusClass = (status: TOrder['status']): string => {
  return status === 'done' ? styles.status_done : '';
};

export const OrderCard = ({
  order,
  showStatus = false,
}: TOrderCardProps): React.JSX.Element => {
  const location = useLocation();

  // Count ingredients
  const ingredientCounts: Record<string, number> = {};

  for (const ingredientId of order.ingredients) {
    ingredientCounts[ingredientId] = (ingredientCounts[ingredientId] ?? 0) + 1;
  }

  // Get unique ingredients
  const uniqueIngredientIds = [...new Set(order.ingredients)];

  return (
    <Link
      className={styles.card}
      state={{ backgroundLocation: location }}
      to={showStatus ? `/profile/orders/${order.number}` : `/feed/${order.number}`}
    >
      <header className={styles.header}>
        <span className="text text_type_digits-default">#{order.number}</span>
        <time className="text text_type_main-default text_color_inactive">
          {formatDate(order.createdAt)}
        </time>
      </header>

      <h2 className={`${styles.title} text text_type_main-medium`}>
        {order.name ?? 'Заказ'}
      </h2>

      {showStatus && (
        <p className={`text text_type_main-default ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </p>
      )}

      <footer className={styles.footer}>
        <ul className={styles.ingredients}>
          {uniqueIngredientIds.slice(0, 6).map((ingredientId, index) => {
            const count = ingredientCounts[ingredientId] ?? 0;
            const isLast = index === 5 && uniqueIngredientIds.length > 6;
            const hiddenCount = uniqueIngredientIds.length - 6;

            return (
              <OrderIngredient
                ingredientId={ingredientId}
                key={ingredientId}
                count={isLast ? hiddenCount + 1 : count}
                isLast={isLast}
                index={index}
              />
            );
          })}
        </ul>
        <div className={styles.price}>
          <OrderPrice order={order} />
        </div>
      </footer>
    </Link>
  );
};

type TOrderIngredientProps = {
  ingredientId: string;
  count: number;
  isLast: boolean;
  index: number;
};

const OrderIngredient = ({
  ingredientId,
  count,
  isLast,
  index,
}: TOrderIngredientProps): React.JSX.Element | null => {
  const ingredient = useAppSelector((state) =>
    selectIngredientById(state, ingredientId)
  );

  if (!ingredient) {
    return null;
  }

  const zIndex = 10 - index;
  const marginLeft = index > 0 ? -16 : 0;

  return (
    <li className={styles.ingredient} style={{ marginLeft, zIndex }}>
      <img
        alt={ingredient.name}
        className={styles.ingredient_image}
        src={ingredient.image_mobile}
      />
      {isLast && <span className={styles.ingredient_count}>+{count}</span>}
    </li>
  );
};

type TOrderPriceProps = {
  order: TOrder;
};

const OrderPrice = ({ order }: TOrderPriceProps): React.JSX.Element => {
  const allIngredients = useAppSelector(selectAllIngredients);

  let totalPrice = 0;

  for (const ingredientId of order.ingredients) {
    const ingredient = allIngredients.find((ing) => ing._id === ingredientId);
    if (ingredient) {
      totalPrice += ingredient.price;
    }
  }

  return (
    <>
      <span className="text text_type_digits-default">{totalPrice}</span>
      <CurrencyIcon type="primary" />
    </>
  );
};
