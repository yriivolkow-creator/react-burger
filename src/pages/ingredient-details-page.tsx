import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { Link, useParams } from 'react-router-dom';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredientById,
  selectIngredientsStatus,
} from '@services/ingredients/ingredientsSlice';

export const IngredientDetailsPage = (): React.JSX.Element => {
  const { id } = useParams();
  const ingredient = useAppSelector((state) => selectIngredientById(state, id ?? ''));
  const ingredientsStatus = useAppSelector(selectIngredientsStatus);

  if (ingredientsStatus === 'idle' || ingredientsStatus === 'pending') {
    return (
      <main className="route-preloader" aria-label="Загрузка ингредиента" role="status">
        <Preloader />
      </main>
    );
  }

  if (!ingredient) {
    return (
      <main className="route-message">
        <h1 className="text text_type_main-large">Ингредиент не найден</h1>
        <Link className="page-link text text_type_main-default" to="/">
          Вернуться к конструктору
        </Link>
      </main>
    );
  }

  return (
    <main className="ingredient-details-page">
      <h1 className="text text_type_main-large">Детали ингредиента</h1>
      <IngredientDetails ingredient={ingredient} />
    </main>
  );
};
