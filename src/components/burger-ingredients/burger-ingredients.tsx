import { Counter, CurrencyIcon, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useRef, useState } from 'react';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';

import type { TIngredient, TIngredientType } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TIngredientGroup = {
  title: string;
  type: TIngredientType;
};

const ingredientGroups: TIngredientGroup[] = [
  { title: 'Булки', type: 'bun' },
  { title: 'Соусы', type: 'sauce' },
  { title: 'Начинки', type: 'main' },
];

type TBurgerIngredientsProps = {
  ingredients: TIngredient[];
};

export const BurgerIngredients = ({
  ingredients,
}: TBurgerIngredientsProps): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<TIngredientType>('bun');
  const [selectedIngredient, setSelectedIngredient] = useState<TIngredient | null>(
    null
  );
  const sectionRefs = useRef<Record<TIngredientType, HTMLElement | null>>({
    bun: null,
    sauce: null,
    main: null,
  });
  const displayedIngredients = ingredientGroups
    .flatMap(({ type }) => ingredients.filter((ingredient) => ingredient.type === type))
    .slice(0, 8);

  const handleTabClick = (value: string): void => {
    const selectedGroup = ingredientGroups.find((group) => group.type === value);

    if (!selectedGroup) {
      return;
    }

    setActiveTab(selectedGroup.type);
    sectionRefs.current[selectedGroup.type]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleIngredientClick = (ingredient: TIngredient): void => {
    setSelectedIngredient(ingredient);
  };

  const handleModalClose = (): void => {
    setSelectedIngredient(null);
  };

  return (
    <section className={styles.burger_ingredients}>
      <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
        Соберите бургер
      </h1>
      <nav aria-label="Категории ингредиентов">
        <ul className={styles.menu}>
          <Tab value="bun" active={activeTab === 'bun'} onClick={handleTabClick}>
            Булки
          </Tab>
          <Tab value="sauce" active={activeTab === 'sauce'} onClick={handleTabClick}>
            Соусы
          </Tab>
          <Tab value="main" active={activeTab === 'main'} onClick={handleTabClick}>
            Начинки
          </Tab>
        </ul>
      </nav>

      <div className={`${styles.ingredients} custom-scroll`}>
        {ingredientGroups.map((group) => {
          const groupIngredients = displayedIngredients.filter(
            (ingredient) => ingredient.type === group.type
          );

          if (groupIngredients.length === 0) {
            return null;
          }

          return (
            <section
              key={group.type}
              ref={(section) => {
                sectionRefs.current[group.type] = section;
              }}
              aria-labelledby={`${group.type}-title`}
            >
              <h2
                id={`${group.type}-title`}
                className={`${styles.group_title} text text_type_main-medium`}
              >
                {group.title}
              </h2>
              <ul className={styles.ingredients_list}>
                {groupIngredients.map((ingredient) => (
                  <li key={ingredient._id} className={styles.ingredient_card}>
                    <button
                      type="button"
                      className={styles.ingredient_button}
                      onClick={() => handleIngredientClick(ingredient)}
                    >
                      <div className={styles.image_wrapper}>
                        <img
                          className={styles.image}
                          src={ingredient.image}
                          alt={ingredient.name}
                        />
                        {ingredient._id === displayedIngredients[0]?._id && (
                          <Counter count={1} extraClass={styles.counter} />
                        )}
                      </div>
                      <p className={`${styles.price} text text_type_digits-default`}>
                        {ingredient.price}
                        <CurrencyIcon type="primary" />
                      </p>
                      <p className={`${styles.name} text text_type_main-default`}>
                        {ingredient.name}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {selectedIngredient && (
        <Modal title="Детали ингредиента" onClose={handleModalClose}>
          <IngredientDetails ingredient={selectedIngredient} />
        </Modal>
      )}
    </section>
  );
};
