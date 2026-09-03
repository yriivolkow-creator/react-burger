import { CheckMarkIcon } from '@krgaa/react-developer-burger-ui-components';

import { MOCK_ORDER_NUMBER } from '@utils/constants';

import styles from './order-details.module.css';

export const OrderDetails = (): React.JSX.Element => {
  return (
    <article className={`${styles.details} pb-30`}>
      <p className={`${styles.number} text text_type_digits-large mb-8`}>
        {MOCK_ORDER_NUMBER}
      </p>
      <p className="text text_type_main-medium mb-15">идентификатор заказа</p>
      <div className={`${styles.check} mb-15`}>
        <CheckMarkIcon type="primary" />
      </div>
      <p className="text text_type_main-default mb-2">Ваш заказ начали готовить</p>
      <p className="text text_type_main-default text_color_inactive">
        Дождитесь готовности на орбитальной станции
      </p>
    </article>
  );
};
