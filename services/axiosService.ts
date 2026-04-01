import axios, { AxiosError, AxiosInstance } from "axios";
import { useSessionStore } from "../store/sessionStore";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const shouldRetry = (error: AxiosError, currentRetry: number): boolean => {
  if (currentRetry >= MAX_RETRIES) return false;

  // Retry on network errors or 5xx / 429
  if (error.code === "ECONNABORTED" || !error.response) return true;

  const status = error.response?.status;
  if (status && (status >= 500 || status === 429)) {
    return true;
  }

  return false;
};

const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Retry interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError & { config: any }) => {
      const { config } = error;
      if (!config) throw error;

      config.__retryCount = config.__retryCount || 0;

      if (shouldRetry(error, config.__retryCount)) {
        config.__retryCount += 1;
        console.warn(
          `[Axios Retry] Attempt ${config.__retryCount} after error: ${error.message}`,
        );
        await delay(RETRY_DELAY * config.__retryCount); // Exponential backoff
        return instance(config);
      }

      return Promise.reject(error);
    },
  );
 
  // Global Alert Interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const { showAlert } = useSessionStore.getState();
      const retryCount = (error.config as any)?.__retryCount || 0;
 
      // Only alert if we're not retrying anymore
      if (retryCount >= MAX_RETRIES || (error.response?.status && error.response.status < 500 && error.response.status !== 429)) {
        const message = (error.response?.data as any)?.message || error.message || "Request failed.";
        showAlert(message, "error");
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const client = createAxiosInstance(
  `${process.env.EXPO_PUBLIC_API_URI}/api`,
);
