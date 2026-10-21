import { Preloader } from '@krgaa/react-developer-burger-ui-components';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { selectCurrentUser, selectIsAuthChecked } from '@services/auth/authSlice';
import { useAppSelector } from '@services/hooks';

type TProtectedRouteProps = {
  onlyUnauth?: boolean;
};

export const ProtectedRoute = ({
  onlyUnauth = false,
}: TProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();
  const isAuthChecked = useAppSelector(selectIsAuthChecked);
  const user = useAppSelector(selectCurrentUser);

  if (!isAuthChecked) {
    return (
      <main className="route-preloader" aria-label="Проверка авторизации" role="status">
        <Preloader />
      </main>
    );
  }

  if (onlyUnauth && user) {
    return <Navigate replace to="/" />;
  }

  if (!onlyUnauth && !user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
};
