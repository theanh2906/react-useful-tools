import type { FoodItem } from '@/types';
import { createItem, listenCollection, updateItem, deleteItem } from './realtimeDb';

const FOODS_PATH = 'foods';

export const listenFoods = (onChange: (foods: FoodItem[]) => void) => {
  return listenCollection<FoodItem>(FOODS_PATH, onChange);
};

export const addFood = async (food: FoodItem) => {
  return createItem(FOODS_PATH, food);
};

export const updateFood = async (id: string, food: FoodItem) => {
  return updateItem(FOODS_PATH, id, food);
};

export const deleteFood = async (id: string) => {
  return deleteItem(FOODS_PATH, id);
};
