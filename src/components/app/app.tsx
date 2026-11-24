import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppHeader } from '@components/app-header/app-header';
import { IngredientModal } from '@components/ingredient-modal/ingredient-modal';
import { OrderModal } from '@components/order-modal/order-modal';
import { PasswordResetRoute } from '@components/password-reset-route/password-reset-route';
import { ProtectedRoute } from '@components/protected-route/protected-route';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from '@pages/auth-pages';
import { FeedPage } from '@pages/feed-page';
import { HomePage } from '@pages/home-page';
import { IngredientDetailsPage } from '@pages/ingredient-details-page';
import { NotFoundPage } from '@pages/not-found-page';
import { OrderPage } from '@pages/order-page';
import { ProfileLayout, ProfileOrdersPage, ProfilePage } from '@pages/profile-pages';
import { markAuthChecked, selectIsAuthChecked } from '@services/auth/authSlice';
import { checkUserAuth } from '@services/auth/authThunks';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { selectIngredientsStatus } from '@services/ingredients/ingredientsSlice';
import { fetchIngredients } from '@services/ingredients/ingredientsThunks';
import { hasAuthTokens } from '@utils/token';

import type { Location } from 'react-router-dom';

import styles from './app.module.css';

type TLocationState = {
  backgroundLocation?: Location;
};

// Extract order id from pathname (e.g., /feed/6b0545308da1e6001b2ba7f7)
function extractOrderIdFromPathname(pathname: string): string | null {
  const parts = pathname.split('/');
  // For /feed/:number, number is at index 2
  // For /profile/orders/:number, number is at index 3
  if (parts[1] === 'feed' && parts[2]) {
    return parts[2];
  }
  if (parts[1] === 'profile' && parts[2] === 'orders' && parts[3]) {
    return parts[3];
  }
  return null;
}

const AppRoutes = (): React.JSX.Element => {
  const location = useLocation();
  const backgroundLocation = (location.state as TLocationState | null)
    ?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ingredients/:id" element={<IngredientDetailsPage />} />
        <Route element={<ProtectedRoute onlyUnauth />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<PasswordResetRoute />}>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="orders" element={<ProfileOrdersPage />} />
          </Route>
        </Route>
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route path="/profile/orders/:number" element={<OrderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {backgroundLocation && (
        <>
          <IngredientModal />
          <OrderModal number={extractOrderIdFromPathname(location.pathname)} />
        </>
      )}
    </>
  );
};

const AppContent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const ingredientsStatus = useAppSelector(selectIngredientsStatus);
  const isAuthChecked = useAppSelector(selectIsAuthChecked);

  useEffect((): void => {
    if (ingredientsStatus !== 'idle') {
      return;
    }
    void dispatch(fetchIngredients());
  }, [dispatch, ingredientsStatus]);

  useEffect((): void | (() => void) => {
    if (isAuthChecked) {
      return;
    }
    if (hasAuthTokens()) {
      void dispatch(checkUserAuth());
      return;
    }
    dispatch(markAuthChecked());
  }, [dispatch, isAuthChecked]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppRoutes />
    </div>
  );
};

export const App = (): React.JSX.Element => {
  return <AppContent />;
};

export default App;
