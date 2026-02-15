/**
 * @module services/babyService
 * @description CRUD operations for baby development tracking (Peanut and Soya).
 * Uses Firebase Realtime Database via the realtimeDb abstraction layer.
 */

import type { BabyData, SoyaData } from '@/types';
import {
  createItem,
  deleteItem,
  listenCollection,
  updateItem,
} from './realtimeDb';

/** @internal Realtime Database path for Peanut (postnatal) records. */
const PEANUT_PATH = 'baby/peanut';

/** @internal Realtime Database path for Soya (prenatal) records. */
const SOYA_PATH = 'baby/soya';

/**
 * Subscribes to real-time updates of Peanut development records.
 *
 * @param onChange - Callback invoked with the latest array of records.
 * @returns Unsubscribe function.
 */
export const listenPeanutRecords = (
  onChange: (records: BabyData[]) => void
) => {
  return listenCollection<BabyData>(PEANUT_PATH, onChange);
};

/**
 * Subscribes to real-time updates of Soya prenatal records.
 *
 * @param onChange - Callback invoked with the latest array of records.
 * @returns Unsubscribe function.
 */
export const listenSoyaRecords = (onChange: (records: SoyaData[]) => void) => {
  return listenCollection<SoyaData>(SOYA_PATH, onChange);
};

/**
 * Adds a new Peanut development record.
 *
 * @param record - The baby data to create.
 * @returns The generated record key.
 */
export const addPeanutRecord = async (record: BabyData) => {
  return createItem(PEANUT_PATH, record);
};

/**
 * Updates an existing Peanut development record.
 *
 * @param id - Record ID to update.
 * @param record - Updated baby data.
 */
export const updatePeanutRecord = async (id: string, record: BabyData) => {
  return updateItem(PEANUT_PATH, id, record);
};

/**
 * Deletes a Peanut development record.
 *
 * @param id - Record ID to delete.
 */
export const deletePeanutRecord = async (id: string) => {
  return deleteItem(PEANUT_PATH, id);
};

/**
 * Adds a new Soya prenatal record.
 *
 * @param record - The prenatal data to create.
 * @returns The generated record key.
 */
export const addSoyaRecord = async (record: SoyaData) => {
  return createItem(SOYA_PATH, record);
};

/**
 * Updates an existing Soya prenatal record.
 *
 * @param id - Record ID to update.
 * @param record - Updated prenatal data.
 */
export const updateSoyaRecord = async (id: string, record: SoyaData) => {
  return updateItem(SOYA_PATH, id, record);
};

/**
 * Deletes a Soya prenatal record.
 *
 * @param id - Record ID to delete.
 */
export const deleteSoyaRecord = async (id: string) => {
  return deleteItem(SOYA_PATH, id);
};
