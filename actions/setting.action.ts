import { client } from "@/services";

export const settingsAction = {
  verifyPassword: async (password: string, userId: string | null) => {
    try {
      const response = await client.post("key/verify", {
        password,
        userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getKeys: async (userId: string | null) => {
    try {
      const response = await client.get(`key/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  saveKeys: async (
    openai: string,
    gemini: string,
    deepgram: string,
    userId: string | null,
    password: string,
  ) => {
    try {
      const response = await client.post(
        "key",
        {
          openai,
          gemini,
          deepgram,
          userId,
          password,
        },
        { timeout: 10_000 },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
