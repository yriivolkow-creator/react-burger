import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useMemo } from 'react';

import type { TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBurgerConstructorProps = {
  ingredients: TIngredient[];
};

export const BurgerConstructor = ({
  ingredients,
}: TBurgerConstructorProps): React.JSX.Element => {
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
                handleClose={() => {}}
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
          />
        )}
      </section>

      <footer className={styles.footer}>
        <p className={`${styles.price} text text_type_digits-medium`}>
          {totalPrice}
          <CurrencyIcon type="primary" />
        </p>
        <Button type="primary" size="large" htmlType="button">
          Оформить заказ
        </Button>
      </footer>
    </section>
  );
};
