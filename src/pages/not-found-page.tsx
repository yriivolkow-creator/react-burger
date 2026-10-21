import { Link } from 'react-router-dom';

export const NotFoundPage = (): React.JSX.Element => (
  <main className="route-message">
    <h1 className="text text_type_main-large">404</h1>
    <p className="text text_type_main-default">Страница не найдена</p>
    <Link className="page-link text text_type_main-default" to="/">
      Вернуться к конструктору
    </Link>
  </main>
);
