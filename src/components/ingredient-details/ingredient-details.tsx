import type { TIngredient } from '@utils/types';

import styles from './ingredient-details.module.css';

type TNutritionItem = {
  label: string;
  value: number;
};

type TIngredientDetailsProps = {
  ingredient: TIngredient;
};

export const IngredientDetails = ({
  ingredient,
}: TIngredientDetailsProps): React.JSX.Element => {
  const nutrition: TNutritionItem[] = [
    { label: 'Калории,ккал', value: ingredient.calories },
    { label: 'Белки, г', value: ingredient.proteins },
    { label: 'Жиры, г', value: ingredient.fat },
    { label: 'Углеводы, г', value: ingredient.carbohydrates },
  ];

  return (
    <article className={`${styles.details} pb-15`}>
      <img
        className={styles.image}
        src={ingredient.image_large}
        alt={ingredient.name}
      />
      <h3 className={`${styles.name} text text_type_main-medium mt-4 mb-8`}>
        {ingredient.name}
      </h3>
      <ul className={styles.nutrition}>
        {nutrition.map((item) => (
          <li key={item.label} className={styles.nutrition_item}>
            <span className="text text_type_main-default text_color_inactive">
              {item.label}
            </span>
            <span className="text text_type_digits-default text_color_inactive mt-2">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
