import { client } from "./axiosService";

export interface InterviewResponse {
  answer: string;
  confidenceScore?: number;
}

export const aiService = {
  optimizeResume: async (
    resume: string,
    jobDescription: string,
    userId: string | null,
    template: string = "modern",
  ): Promise<string> => {
    try {
      const response = await client.post("/optimize", {
        userId,
        resume,
        jobDescription,
        referenceTemplate: template,
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  sendResponseText: async (
    text: string,
    context: {
      cvText: string | null;
      jobDescription: string | null;
      role: string | null;
      company: string | null;
      tone: string;
      userId: string | null;
    },
  ): Promise<any> => {
    try {
      const response = await client.post("/interview", {
        transcript: text,
        ...context,
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};
