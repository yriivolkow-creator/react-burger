import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { useAppSelector } from '@services/hooks';
import {
  selectIngredientsError,
  selectIngredientsStatus,
} from '@services/ingredients/ingredientsSlice';

export const HomePage = (): React.JSX.Element => {
  const error = useAppSelector(selectIngredientsError);
  const status = useAppSelector(selectIngredientsStatus);

  if (status === 'idle' || status === 'pending') {
    return (
      <main className="route-preloader" aria-label="Загрузка ингредиентов" role="status">
        <Preloader />
      </main>
    );
  }

  if (status === 'failed') {
    return (
      <main className="route-message">
        <p className="text text_type_main-default" role="alert">
          {error ?? 'Не удалось загрузить ингредиенты'}
        </p>
      </main>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="home-page pl-5 pr-5">
        <BurgerIngredients />
        <BurgerConstructor />
      </main>
    </DndProvider>
  );
};
