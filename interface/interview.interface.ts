export interface InterviewResponse {
  message: string;
  text: string;
  status: string;
  sender: "user" | "ai";
}
