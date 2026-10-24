import { Navigate, Outlet } from 'react-router-dom';

import { hasPasswordResetRequest } from '@utils/token';

export const PasswordResetRoute = (): React.JSX.Element =>
  hasPasswordResetRequest() ? <Outlet /> : <Navigate replace to="/forgot-password" />;
