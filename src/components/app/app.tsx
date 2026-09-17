import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import {
  selectIngredientsError,
  selectIngredientsStatus,
} from '@services/ingredients/ingredientsSlice';
import { fetchIngredients } from '@services/ingredients/ingredientsThunks';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectIngredientsError);
  const status = useAppSelector(selectIngredientsStatus);

  useEffect((): (() => void) => {
    const request = dispatch(fetchIngredients());

    return () => {
      request.abort();
    };
  }, [dispatch]);

  if (status === 'idle' || status === 'pending') {
    return (
      <div aria-label="Загрузка ингредиентов" role="status">
        <Preloader />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={styles.app}>
        <p className={`${styles.error} text text_type_main-default`} role="alert">
          {error ?? 'Не удалось загрузить ингредиенты'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients />
        <BurgerConstructor />
      </main>
    </div>
  );
};

export default App;
