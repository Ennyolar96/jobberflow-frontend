import { AxiosError, AxiosResponse } from "axios";
import { client } from "./axiosService";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function makeApiCall<T>(
  endpoint: string,
  payload: Record<string, any>,
  method: "post" | "get" | "patch" | "delete" = "post",
  timeout = 10_000,
): Promise<ApiResponse<T | null>> {
  try {
    const res = await client[method]<AxiosResponse<T>>(endpoint, payload, {
      timeout,
    });

    return {
      success: true,
      message: "",
      data: res.data as T,
    };
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.code === "ECONNABORTED") {
        return {
          success: false,
          message: "Request timed out. Please try again.",
          data: null,
        };
      }

      const theError = err.response?.data;

      if (theError && typeof theError === "object") {
        if ("errors" in theError && Array.isArray(theError.errors)) {
          const msg = theError.errors
            .map((e: any) =>
              typeof e === "string"
                ? e
                : e.message || e.messages?.[0] || "An error occurred",
            )
            .join(", ");

          return {
            success: false,
            message: msg,
            data: null,
          };
        }

        const errorMessage =
          theError.message?.message ||
          theError.message ||
          theError.error ||
          "Something went wrong";

        return {
          success: false,
          message:
            typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage),
          data: null,
        };
      }
    }

    return {
      success: false,
      message: "Unexpected error occurred",
      data: null,
    };
  }
}
