import { useNavigate, useParams } from 'react-router-dom';

import { IngredientDetails } from '@components/ingredient-details/ingredient-details';
import { Modal } from '@components/modal/modal';
import { useAppSelector } from '@services/hooks';
import { selectIngredientById } from '@services/ingredients/ingredientsSlice';

export const IngredientModal = (): React.JSX.Element | null => {
  const navigate = useNavigate();
  const { id } = useParams();
  const ingredient = useAppSelector((state) => selectIngredientById(state, id ?? ''));

  if (!ingredient) {
    return null;
  }

  return (
    <Modal title="Детали ингредиента" onClose={() => void navigate(-1)}>
      <IngredientDetails ingredient={ingredient} />
    </Modal>
  );
};
