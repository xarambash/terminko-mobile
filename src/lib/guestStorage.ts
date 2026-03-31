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

function createInstallationId(): string {
  const generated = globalThis.crypto?.randomUUID?.();
  if (generated) {
    return generated;
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function getInstallationId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.installationId);
}

export async function ensureInstallationId(): Promise<string> {
  const existing = await getInstallationId();
  if (existing && isUuid(existing)) {
    return existing;
  }
  const created = createInstallationId();
  await AsyncStorage.setItem(STORAGE_KEYS.installationId, created);
  return created;
}

export async function clearInstallationId(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.installationId);
}
