import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';

export async function getGuestId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.guestId);
}

export async function setGuestId(id: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.guestId, id);
}

export async function clearGuestId(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.guestId);
}
