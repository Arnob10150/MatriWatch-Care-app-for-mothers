import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "matriwatch_mother_auth";

export interface MotherAuth {
  motherId: string;
  name: string;
  email: string;
}

export async function getAuth(): Promise<MotherAuth | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MotherAuth;
  } catch {
    return null;
  }
}

export async function setAuth(auth: MotherAuth): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

/**
 * The mother id used for API submissions: the logged-in mother if present,
 * otherwise the EXPO_PUBLIC_MOTHER_ID demo fallback (kept for backward
 * compatibility with existing env-based setups).
 */
export async function getActiveMotherId(): Promise<string | undefined> {
  const auth = await getAuth();
  return auth?.motherId ?? process.env.EXPO_PUBLIC_MOTHER_ID;
}
