import { Button } from '@krgaa/react-developer-burger-ui-components';

import type { FormEventHandler, ReactNode } from 'react';

type TAuthFormProps = {
  children: ReactNode;
  error: string | null;
  footer: ReactNode;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  title: string;
};

export const AuthForm = ({
  children,
  error,
  footer,
  isSubmitting,
  onSubmit,
  submitLabel,
  title,
}: TAuthFormProps): React.JSX.Element => (
  <main className="auth-page">
    <form className="auth-form" onSubmit={onSubmit}>
      <h1 className="text text_type_main-medium">{title}</h1>
      <div className="auth-form__fields">{children}</div>
      <Button htmlType="submit" size="medium" type="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем...' : submitLabel}
      </Button>
      {error && (
        <p className="auth-form__error text text_type_main-default" role="alert">
          {error}
        </p>
      )}
      <div className="auth-form__footer text text_type_main-default text_color_inactive">
        {footer}
      </div>
    </form>
  </main>
);
