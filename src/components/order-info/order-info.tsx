import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';

import { useAppSelector } from '@services/hooks';
import {
  selectAllIngredients,
  selectIngredientById,
} from '@services/ingredients/ingredientsSlice';

import type { TOrder } from '@utils/types';

import styles from './order-info.module.css';

type TOrderInfoProps = {
  order: TOrder;
  showStatus?: boolean;
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

export const OrderInfo = ({
  order,
  showStatus = false,
}: TOrderInfoProps): React.JSX.Element => {
  // Group ingredients and count them
  const ingredientCounts: Record<string, number> = {};

  for (const ingredientId of order.ingredients) {
    ingredientCounts[ingredientId] = (ingredientCounts[ingredientId] ?? 0) + 1;
  }

  const uniqueIngredientIds = [...new Set(order.ingredients)];

  return (
    <div className={styles.container}>
      <header className={`${styles.header} mt-10`}>
        <span className="text text_type_digits-default">#{order.number}</span>
      </header>

      <h2 className={`${styles.title} text text_type_main-medium mt-10 mb-3`}>
        {order.name ?? 'Заказ'}
      </h2>

      {showStatus && (
        <p
          className={`text text_type_main-default mb-15 ${
            order.status === 'done' ? styles.status_done : ''
          }`}
        >
          {getStatusText(order.status)}
        </p>
      )}

      <h3 className="text text_type_main-medium mb-6">Состав:</h3>

      <ul className={`${styles.ingredients} custom-scroll mb-10`}>
        {uniqueIngredientIds.map((ingredientId) => {
          const count = ingredientCounts[ingredientId] ?? 0;

          return (
            <OrderIngredientRow
              ingredientId={ingredientId}
              count={count}
              key={ingredientId}
            />
          );
        })}
      </ul>

      <footer className={styles.footer}>
        <time className="text text_type_main-default text_color_inactive">
          {formatDate(order.createdAt)}
        </time>
        <div className={styles.price}>
          <OrderTotalPrice order={order} />
        </div>
      </footer>
    </div>
  );
};

type TOrderIngredientRowProps = {
  ingredientId: string;
  count: number;
};

const OrderIngredientRow = ({
  ingredientId,
  count,
}: TOrderIngredientRowProps): React.JSX.Element | null => {
  const ingredient = useAppSelector((state) =>
    selectIngredientById(state, ingredientId)
  );

  if (!ingredient) {
    return null;
  }

  return (
    <li className={styles.ingredient_row}>
      <div className={styles.ingredient_preview}>
        <img
          alt={ingredient.name}
          className={styles.ingredient_image}
          src={ingredient.image_mobile}
        />
      </div>
      <span className={`${styles.ingredient_name} text text_type_main-default`}>
        {ingredient.name}
      </span>
      <div className={styles.ingredient_price}>
        <span className="text text_type_digits-default">
          {count} x {ingredient.price}
        </span>
        <CurrencyIcon type="primary" />
      </div>
    </li>
  );
};

type TOrderTotalPriceProps = {
  order: TOrder;
};

const OrderTotalPrice = ({ order }: TOrderTotalPriceProps): React.JSX.Element => {
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
