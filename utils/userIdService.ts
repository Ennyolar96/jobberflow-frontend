import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "permanent_user_id";
const ID_PREFIX = "AI_jober:";

export const userIdService = {
  /**
   * Generates a new User ID with the pattern AI_jober:<uuid>
   */
  generateId: (): string => {
    return `${ID_PREFIX}${uuidv4()}`;
  },

  /**
   * Validates if the ID matches the pattern AI_jober:<uuid>
   */
  validateId: (id: string): boolean => {
    if (!id.startsWith(ID_PREFIX)) return false;
    const uuidPart = id.substring(ID_PREFIX.length);
    // Simple UUID validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuidPart);
  },

  /**
   * Retrieves the User ID from persistent storage
   */
  getStoredId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error reading userId from storage", e);
      return null;
    }
  },

  /**
   * Saves the User ID to persistent storage
   */
  saveToStorage: async (id: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      console.error("Error saving userId to storage", e);
    }
  },

  /**
   * Clears the User ID from persistent storage (if ever needed, though user said don't)
   */
  clearStorage: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing userId from storage", e);
    }
  },
};
