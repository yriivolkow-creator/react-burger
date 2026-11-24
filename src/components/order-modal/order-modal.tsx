import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@components/modal/modal';
import { OrderInfo } from '@components/order-info/order-info';
import { useAppSelector } from '@services/hooks';
import { selectOrderByNumber } from '@services/orders-feed/ordersFeedSlice';
import { selectUserOrderByNumber } from '@services/user-orders/userOrdersSlice';
import { getOrder } from '@utils/api';

import type { TOrder } from '@utils/types';

type TOrderModalProps = {
  isUserOrders?: boolean;
  number?: string;
};

export const OrderModal = ({
  isUserOrders = false,
  number: propNumber,
}: TOrderModalProps): React.JSX.Element => {
  const navigate = useNavigate();
  // number is now order _id (ObjectId)
  const orderId = propNumber ?? null;
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to get order from feed or user orders by number (for backward compatibility)
  const orderFromFeed = useAppSelector((state) =>
    orderId ? selectOrderByNumber(state, parseInt(orderId, 10)) : undefined
  );
  const orderFromUser = useAppSelector((state) =>
    orderId ? selectUserOrderByNumber(state, parseInt(orderId, 10)) : undefined
  );

  useEffect(() => {
    if (!orderId) {
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

    // Otherwise fetch from API by order id
    const fetchOrder = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (_error) {
        setError('Не удалось загрузить заказ');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrder();
  }, [orderId, orderFromFeed, orderFromUser, isUserOrders]);

  return (
    <Modal onClose={() => void navigate(-1)}>
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
