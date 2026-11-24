import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Modal } from '@components/modal/modal';
import { OrderInfo } from '@components/order-info/order-info';
import { useAppSelector } from '@services/hooks';
import { selectOrderByNumber } from '@services/orders-feed/ordersFeedSlice';
import { selectUserOrderByNumber } from '@services/user-orders/userOrdersSlice';
import { getOrder } from '@utils/api';

import type { TOrder } from '@utils/types';

type TOrderModalProps = {
  onClose: () => void;
  isUserOrders?: boolean;
  number?: string;
};

export const OrderModal = ({
  onClose,
  isUserOrders = false,
  number: propNumber,
}: TOrderModalProps): React.JSX.Element => {
  const routeParams = useParams<{ number: string }>();
  const number = propNumber ?? routeParams.number;
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = number ? parseInt(number, 10) : null;

  const orderFromFeed = useAppSelector((state) =>
    orderNumber ? selectOrderByNumber(state, orderNumber) : undefined
  );
  const orderFromUser = useAppSelector((state) =>
    orderNumber ? selectUserOrderByNumber(state, orderNumber) : undefined
  );

  useEffect(() => {
    if (!number) {
      setError('Номер заказа не указан');
      setIsLoading(false);
      return;
    }

    const foundOrder = isUserOrders ? orderFromUser : orderFromFeed;

    if (foundOrder) {
      setOrder(foundOrder);
      setIsLoading(false);
      return;
    }

    const fetchOrder = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await getOrder(orderNumber);
        setOrder(data);
      } catch (_error) {
        setError('Не удалось загрузить заказ');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrder();
  }, [number, orderFromFeed, orderFromUser, isUserOrders]);

  return (
    <Modal onClose={onClose}>
      <div className="p-10">
        {isLoading && <p className="text text_type_main-default">Загрузка...</p>}
        {error && (
          <p className="text text_type_main-default text_color_inactive">{error}</p>
        )}
        {order && <OrderInfo order={order} showStatus={isUserOrders} />}
      </div>
    </Modal>
  );
};
