import { fetchValue, setValue, listenValue } from './realtimeDb';

export type UserProfile = {
  conceptionDate?: string;
  babyBirthDate?: string;
};

const PROFILE_PATH = 'profile';

export const fetchProfile = async () => {
  return fetchValue<UserProfile>(PROFILE_PATH);
};

export const saveProfile = async (profile: UserProfile) => {
  return setValue(PROFILE_PATH, profile);
};

export const listenProfile = (onChange: (profile: UserProfile | null) => void) => {
  return listenValue<UserProfile>(PROFILE_PATH, onChange);
};
