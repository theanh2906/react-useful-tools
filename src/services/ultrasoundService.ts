import { createItem, deleteItem, listenCollection } from './realtimeDb';
import { deleteFile, uploadFile } from './storageService';

export type UltrasoundRecord = {
  id?: string;
  url: string;
  date: string;
  notes?: string;
  storagePath?: string;
};

const ULTRASOUND_PATH = 'ultrasounds';

export const listenUltrasounds = (onChange: (items: UltrasoundRecord[]) => void) => {
  return listenCollection<UltrasoundRecord>(ULTRASOUND_PATH, onChange);
};

export const uploadUltrasound = async (file: File, date: string, notes?: string) => {
  const uploaded = await uploadFile('ultrasounds', file);
  const record: UltrasoundRecord = {
    url: uploaded.url || '',
    date,
    notes,
    storagePath: uploaded.path,
  };
  await createItem(ULTRASOUND_PATH, record);
  return record;
};

export const deleteUltrasound = async (record: UltrasoundRecord) => {
  if (record.storagePath) {
    await deleteFile(record.storagePath);
  }
  if (record.id) {
    await deleteItem(ULTRASOUND_PATH, record.id);
  }
};
