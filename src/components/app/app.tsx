import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import { getIngredients } from '@utils/api';

import type { TIngredient } from '@utils/types';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  const [ingredients, setIngredients] = useState<TIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // убрал 2й апи запрос при дев разработке
    const abortController = new AbortController();

    const loadIngredients = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getIngredients(abortController.signal);
        setIngredients(data);
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';

        setError(message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadIngredients();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className={styles.app}>
        <p className={`${styles.error} text text_type_main-default`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients ingredients={ingredients} />
        <BurgerConstructor ingredients={ingredients} />
      </main>
    </div>
  );
};

export default App;
