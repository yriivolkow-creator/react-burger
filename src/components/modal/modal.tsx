import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { ModalOverlay } from '@components/modal-overlay/modal-overlay';

import type { ReactNode } from 'react';

import styles from './modal.module.css';

type TModalProps = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

const modalRoot = document.getElementById('modals');

export const Modal = ({ title, onClose, children }: TModalProps): React.JSX.Element => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!modalRoot) {
    throw new Error('Элемент #modals не найден');
  }

  return createPortal(
    <>
      <ModalOverlay onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={`${styles.header} pt-10 pl-10 pr-10`}>
          {title ? (
            <h2 className={`${styles.title} text text_type_main-large`}>{title}</h2>
          ) : (
            <span className={styles.title} />
          )}
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CloseIcon type="primary" />
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </>,
    modalRoot
  );
};
