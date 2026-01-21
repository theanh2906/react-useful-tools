import { createItem, listenCollection, setValue } from './realtimeDb';
import { uploadFile } from './storageService';

export type RoomMessage = {
  id?: string;
  content: string;
  timestamp: number;
  author: string;
  isAdmin?: boolean;
};

export type RoomFile = {
  id?: string;
  name: string;
  url: string;
  size: number;
  timestamp: number;
  type: 'file';
};

const roomPath = (roomId: string, type: 'messages' | 'files') => `liveShare/${roomId}/${type}`;

// Helper to get consistent Admin Room ID
export const getAdminRoomId = (userId: string) => `admin-${userId}`;

export const listenRoomMessages = (roomId: string, onChange: (messages: RoomMessage[]) => void) => {
  return listenCollection<RoomMessage>(roomPath(roomId, 'messages'), onChange);
};

export const listenRoomFiles = (roomId: string, onChange: (files: RoomFile[]) => void) => {
  return listenCollection<RoomFile>(roomPath(roomId, 'files'), onChange);
};

export const addMessage = async (roomId: string, message: RoomMessage) => {
  // Use createItem to push to list
  return createItem(roomPath(roomId, 'messages'), message);
};

export const uploadRoomFile = async (roomId: string, file: File) => {
  // Upload to matching storage path
  const uploaded = await uploadFile(`live-share/${roomId}`, file);
  const meta: RoomFile = {
    name: uploaded.name,
    url: uploaded.url || '',
    size: uploaded.size,
    timestamp: Date.now(),
    type: 'file'
  };
  await createItem(roomPath(roomId, 'files'), meta);
  return meta;
};

export const clearRoom = async (roomId: string) => {
  await setValue(roomPath(roomId, 'messages'), null);
  await setValue(roomPath(roomId, 'files'), null);
};

export const deleteRoom = async (roomId: string) => {
  await setValue(`liveShare/${roomId}`, null);
};
