import type { TIngredient } from './types';

export const DND_ITEM_TYPES = {
  ingredient: 'ingredient',
  constructorIngredient: 'constructorIngredient',
} as const;

/** A canonical catalog ingredient dragged into a constructor target. */
export type TIngredientDragItem = {
  type: typeof DND_ITEM_TYPES.ingredient;
  ingredient: TIngredient;
};

/** A constructor filling instance dragged only to reorder constructor fillings. */
export type TConstructorIngredientDragItem = {
  type: typeof DND_ITEM_TYPES.constructorIngredient;
  id: string;
  index: number;
};
