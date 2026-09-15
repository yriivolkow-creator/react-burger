import {
  Button,
  ConstructorElement,
  CurrencyIcon,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Modal } from '@components/modal/modal';
import { OrderDetails } from '@components/order-details/order-details';
import {
  addIngredient,
  moveIngredient,
  removeIngredient,
  selectCanSubmitOrder,
  selectConstructorBun,
  selectConstructorIngredients,
  selectTotalPrice,
  setBun,
} from '@services/burger-constructor/burgerConstructorSlice';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import {
  closeOrderModal,
  selectIsOrderModalOpen,
  selectOrderError,
  selectOrderNumber,
  selectOrderStatus,
} from '@services/order/orderSlice';
import { createOrder } from '@services/order/orderThunks';
import {
  DND_ITEM_TYPES,
  type TConstructorIngredientDragItem,
  type TIngredientDragItem,
} from '@utils/dnd';

import type { TConstructorIngredient, TIngredient } from '@utils/types';

import styles from './burger-constructor.module.css';

type TBunPosition = 'top' | 'bottom';

type TDropTargetState = {
  canDrop: boolean;
  isOver: boolean;
};

type TBunSlotProps = {
  bun: TIngredient | null;
  position: TBunPosition;
};

type TConstructorIngredientProps = {
  index: number;
  ingredient: TConstructorIngredient;
};

const isFilling = (ingredient: TIngredient): boolean =>
  ingredient.type === 'sauce' || ingredient.type === 'main';

const BunSlot = ({ bun, position }: TBunSlotProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const [{ canDrop, isOver }, dropRef] = useDrop<
    TIngredientDragItem,
    void,
    TDropTargetState
  >(
    () => ({
      accept: DND_ITEM_TYPES.ingredient,
      canDrop: (item): boolean => item.ingredient.type === 'bun',
      collect: (monitor): TDropTargetState => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
      drop: (item): void => {
        if (item.ingredient.type === 'bun') {
          dispatch(setBun(item.ingredient));
        }
      },
    }),
    [dispatch]
  );
  const positionLabel = position === 'top' ? 'Верхняя булка' : 'Нижняя булка';
  const isActive = isOver && canDrop;

  return (
    <div
      ref={(element: HTMLDivElement | null): void => {
        dropRef(element);
      }}
      className={`${styles.bun_slot} ${styles.drop_target} ${
        isActive ? styles.drop_target_active : ''
      }`}
      data-testid={`bun-slot-${position}`}
      aria-label={positionLabel}
    >
      {bun ? (
        <ConstructorElement
          type={position}
          text={bun.name}
          thumbnail={bun.image}
          price={bun.price}
          isLocked
          extraClass={styles.bun}
        />
      ) : (
        <p className={`${styles.placeholder} text text_type_main-default`}>
          Перетащите булку сюда
        </p>
      )}
    </div>
  );
};

const ConstructorIngredient = ({
  index,
  ingredient,
}: TConstructorIngredientProps): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const itemRef = useRef<HTMLLIElement | null>(null);
  const [, dropRef] = useDrop<TConstructorIngredientDragItem, void, unknown>(
    () => ({
      accept: DND_ITEM_TYPES.constructorIngredient,
      hover: (dragItem, monitor): void => {
        const dragIndex = dragItem.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        const element = itemRef.current;
        const clientOffset = monitor.getClientOffset();

        if (!element || !clientOffset) {
          return;
        }

        const hoverBoundingRect = element.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (
          (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
          (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
        ) {
          return;
        }

        dispatch(moveIngredient({ fromIndex: dragIndex, toIndex: hoverIndex }));
        dragItem.index = hoverIndex;
      },
    }),
    [dispatch, index]
  );
  const [{ isDragging }, dragRef] = useDrag<
    TConstructorIngredientDragItem,
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      collect: (monitor): { isDragging: boolean } => ({
        isDragging: monitor.isDragging(),
      }),
      item: {
        id: ingredient.id,
        index,
        type: DND_ITEM_TYPES.constructorIngredient,
      },
      type: DND_ITEM_TYPES.constructorIngredient,
    }),
    [ingredient.id, index]
  );

  return (
    <li
      ref={(element: HTMLLIElement | null): void => {
        itemRef.current = element;
        dragRef(element);
        dropRef(element);
      }}
      className={`${styles.fillings_item} ${isDragging ? styles.dragging : ''}`}
      data-testid={`constructor-filling-${ingredient.id}`}
    >
      <DragIcon type="primary" className={styles.drag_icon} />
      <ConstructorElement
        text={ingredient.name}
        thumbnail={ingredient.image}
        price={ingredient.price}
        handleClose={() => dispatch(removeIngredient(ingredient.id))}
      />
    </li>
  );
};

const FillingList = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const fillings = useAppSelector(selectConstructorIngredients);
  const [{ canDrop, isOver }, dropRef] = useDrop<
    TIngredientDragItem,
    void,
    TDropTargetState
  >(
    () => ({
      accept: DND_ITEM_TYPES.ingredient,
      canDrop: (item): boolean => isFilling(item.ingredient),
      collect: (monitor): TDropTargetState => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
      drop: (item): void => {
        if (isFilling(item.ingredient)) {
          dispatch(addIngredient(item.ingredient));
        }
      },
    }),
    [dispatch]
  );
  const isActive = isOver && canDrop;

  return (
    <div
      ref={(element: HTMLDivElement | null): void => {
        dropRef(element);
      }}
      className={`${styles.filling_target} ${styles.drop_target} ${
        isActive ? styles.drop_target_active : ''
      }`}
      data-testid="filling-target"
    >
      <ul className={`${styles.fillings} custom-scroll`} aria-label="Начинки">
        {fillings.length === 0 ? (
          <li className={`${styles.placeholder} text text_type_main-default`}>
            Перетащите начинку сюда
          </li>
        ) : (
          fillings.map((ingredient, index) => (
            <ConstructorIngredient
              key={ingredient.id}
              ingredient={ingredient}
              index={index}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const bun = useAppSelector(selectConstructorBun);
  const totalPrice = useAppSelector(selectTotalPrice);
  const canSubmitOrder = useAppSelector(selectCanSubmitOrder);
  const isOrderModalOpen = useAppSelector(selectIsOrderModalOpen);
  const orderError = useAppSelector(selectOrderError);
  const orderNumber = useAppSelector(selectOrderNumber);
  const orderStatus = useAppSelector(selectOrderStatus);
  const isOrderPending = orderStatus === 'pending';

  const handleOrderSubmit = (): void => {
    if (canSubmitOrder) {
      void dispatch(createOrder());
    }
  };

  const handleOrderModalClose = (): void => {
    dispatch(closeOrderModal());
  };

  return (
    <section className={`${styles.burger_constructor} pt-25`}>
      <section className={styles.elements} aria-label="Состав бургера">
        <BunSlot bun={bun} position="top" />
        <FillingList />
        <BunSlot bun={bun} position="bottom" />
      </section>

      <footer className={styles.footer}>
        <p className={`${styles.price} text text_type_digits-medium`}>
          {totalPrice}
          <CurrencyIcon type="primary" />
        </p>
        <Button
          type="primary"
          size="large"
          htmlType="button"
          disabled={!canSubmitOrder}
          onClick={handleOrderSubmit}
        >
          {isOrderPending ? 'Оформляем заказ...' : 'Оформить заказ'}
        </Button>
        {orderError && (
          <p
            className={`${styles.order_error} text text_type_main-default`}
            role="alert"
          >
            {orderError}
          </p>
        )}
      </footer>

      {isOrderModalOpen && orderNumber !== null && (
        <Modal onClose={handleOrderModalClose}>
          <OrderDetails orderNumber={orderNumber} />
        </Modal>
      )}
    </section>
  );
};
