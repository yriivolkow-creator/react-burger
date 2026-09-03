import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useMemo, useState } from 'react';

import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
};

export const BurgerConstructor = ({
  ingredients,
}: TBurgerConstructorProps): React.JSX.Element => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const bun = useMemo(
    () => ingredients.find((ingredient) => ingredient.type === 'bun'),
    [ingredients]
  );

  const fillings = useMemo(
    () =>
      ingredients
        .filter(
          (ingredient) => ingredient.type === 'main' || ingredient.type === 'sauce'
        )
        .slice(0, 6),
    [ingredients]
  );

  const totalPrice = useMemo(() => {
    if (!bun) {
      return 0;
    }

    const fillingsPrice = fillings.reduce(
      (sum, ingredient) => sum + ingredient.price,
      0
    );

    return bun.price * 2 + fillingsPrice;
  }, [bun, fillings]);

  return (
    <section className={`${styles.burger_constructor} pt-25`}>
      <section className={styles.elements} aria-label="Состав бургера">
        {bun && (
          <ConstructorElement
            type="top"
            text={bun.name}
            thumbnail={bun.image}
            price={bun.price}
            isLocked
            extraClass={styles.bun}
          />
        )}

        <ul className={`${styles.fillings} custom-scroll`}>
          {fillings.map((ingredient) => (
            <li key={ingredient._id} className={styles.fillings_item}>
              <DragIcon type="primary" />
              <ConstructorElement
                text={ingredient.name}
                thumbnail={ingredient.image}
                price={ingredient.price}
                handleClose={() => {
                  // Удаление ингредиента
                }}
              />
            </li>
          ))}
        </ul>

        {bun && (
          <ConstructorElement
            type="bottom"
            text={bun.name}
            thumbnail={bun.image}
            price={bun.price}
            isLocked
            extraClass={styles.bun}
          />
        )}
      </section>

      <footer className={styles.footer}>
        <p className={`${styles.price} text text_type_digits-medium`}>
          {totalPrice}
          <CurrencyIcon type="primary" />
        </p>
        <Button
          type="primary"
          size="large"
          htmlType="button"
          onClick={() => setIsOrderModalOpen(true)}
        >
          Оформить заказ
        </Button>
      </footer>

      {isOrderModalOpen && (
        <Modal onClose={() => setIsOrderModalOpen(false)}>
          <OrderDetails />
        </Modal>
      )}
    </section>
  );
};
