import type { BabyData, SoyaData } from '@/types';
import { createItem, deleteItem, listenCollection, updateItem } from './realtimeDb';

const PEANUT_PATH = 'baby/peanut';
const SOYA_PATH = 'baby/soya';

export const listenPeanutRecords = (onChange: (records: BabyData[]) => void) => {
  return listenCollection<BabyData>(PEANUT_PATH, onChange);
};

export const listenSoyaRecords = (onChange: (records: SoyaData[]) => void) => {
  return listenCollection<SoyaData>(SOYA_PATH, onChange);
};

export const addPeanutRecord = async (record: BabyData) => {
  return createItem(PEANUT_PATH, record);
};

export const updatePeanutRecord = async (id: string, record: BabyData) => {
  return updateItem(PEANUT_PATH, id, record);
};

export const deletePeanutRecord = async (id: string) => {
  return deleteItem(PEANUT_PATH, id);
};

export const addSoyaRecord = async (record: SoyaData) => {
  return createItem(SOYA_PATH, record);
};

export const updateSoyaRecord = async (id: string, record: SoyaData) => {
  return updateItem(SOYA_PATH, id, record);
};

export const deleteSoyaRecord = async (id: string) => {
  return deleteItem(SOYA_PATH, id);
};
