import { Counter, CurrencyIcon, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useRef, useState } from 'react';
import { useDrag } from 'react-dnd';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { selectIngredientCountsById } from '@services/burger-constructor/burgerConstructorSlice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { selectAllIngredients } from '@services/ingredients/ingredientsSlice';
import {
  clearSelectedIngredient,
  selectIngredient,
  selectSelectedIngredient,
} from '@services/selected-ingredient/selectedIngredientSlice';
import { DND_ITEM_TYPES, type TIngredientDragItem } from '@utils/dnd';

import type { TIngredient, TIngredientType } from '@utils/types';

import styles from './burger-ingredients.module.css';

type TIngredientGroup = {
  title: string;
  type: TIngredientType;
};

type TIngredientCardProps = {
  count: number;
  ingredient: TIngredient;
  onClick: (ingredient: TIngredient) => void;
};

const ingredientGroups: TIngredientGroup[] = [
  { title: 'Булки', type: 'bun' },
  { title: 'Соусы', type: 'sauce' },
  { title: 'Начинки', type: 'main' },
];

const IngredientCard = ({
  count,
  ingredient,
  onClick,
}: TIngredientCardProps): React.JSX.Element => {
  const [{ isDragging }, dragRef] = useDrag<
    TIngredientDragItem,
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      collect: (monitor): { isDragging: boolean } => ({
        isDragging: monitor.isDragging(),
      }),
      item: (): TIngredientDragItem => ({
        ingredient,
        type: DND_ITEM_TYPES.ingredient,
      }),
      type: DND_ITEM_TYPES.ingredient,
    }),
    [ingredient]
  );

  return (
    <li
      ref={(element) => {
        dragRef(element);
      }}
      className={`${styles.ingredient_card} ${isDragging ? styles.dragging : ''}`}
    >
      <button
        type="button"
        className={styles.ingredient_button}
        onClick={() => onClick(ingredient)}
      >
        <div className={styles.image_wrapper}>
          <img className={styles.image} src={ingredient.image} alt={ingredient.name} />
          {count > 0 && <Counter count={count} extraClass={styles.counter} />}
        </div>
        <p className={`${styles.price} text text_type_digits-default`}>
          {ingredient.price}
          <CurrencyIcon type="primary" />
        </p>
        <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
      </button>
    </li>
  );
};

export const BurgerIngredients = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectAllIngredients);
  const ingredientCountsById = useAppSelector(selectIngredientCountsById);
  const selectedIngredient = useAppSelector(selectSelectedIngredient);
  const [activeTab, setActiveTab] = useState<TIngredientType>('bun');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headingRefs = useRef<Record<TIngredientType, HTMLHeadingElement | null>>({
    bun: null,
    sauce: null,
    main: null,
  });

  const handleTabClick = (value: string): void => {
    const selectedGroup = ingredientGroups.find((group) => group.type === value);

    if (!selectedGroup) {
      return;
    }

    setActiveTab(selectedGroup.type);

    const container = containerRef.current;
    const heading = headingRefs.current[selectedGroup.type];

    if (!container || !heading) {
      return;
    }

    const scrollOptions: ScrollToOptions = {
      behavior: 'smooth',
      top: heading.offsetTop - container.offsetTop,
    };

    if (typeof container.scrollTo === 'function') {
      container.scrollTo(scrollOptions);
      return;
    }

    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScroll = (): void => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    let nearestType: TIngredientType | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const group of ingredientGroups) {
      const heading = headingRefs.current[group.type];

      if (!heading) {
        continue;
      }

      const distance = Math.abs(heading.getBoundingClientRect().top - containerTop);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestType = group.type;
      }
    }

    if (nearestType) {
      setActiveTab(nearestType);
    }
  };

  const handleIngredientClick = (ingredient: TIngredient): void => {
    dispatch(selectIngredient(ingredient));
  };

  const handleModalClose = (): void => {
    dispatch(clearSelectedIngredient());
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

      <div
        ref={containerRef}
        className={`${styles.ingredients} custom-scroll`}
        onScroll={handleScroll}
      >
        {ingredientGroups.map((group) => {
          const groupIngredients = ingredients.filter(
            (ingredient) => ingredient.type === group.type
          );

          return (
            <section key={group.type} aria-labelledby={`${group.type}-title`}>
              <h2
                id={`${group.type}-title`}
                ref={(heading) => {
                  headingRefs.current[group.type] = heading;
                }}
                className={`${styles.group_title} text text_type_main-medium`}
              >
                {group.title}
              </h2>
              <ul className={styles.ingredients_list}>
                {groupIngredients.map((ingredient) => (
                  <IngredientCard
                    key={ingredient._id}
                    count={ingredientCountsById[ingredient._id] ?? 0}
                    ingredient={ingredient}
                    onClick={handleIngredientClick}
                  />
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
