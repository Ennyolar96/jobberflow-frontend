import { useSessionStore } from "@/store/sessionStore";
import { AudioModule, RecordingPresets } from "expo-audio";
import * as Speech from "expo-speech";
import { client } from "./axiosService";

export const speechService = {
  startRecording: async (): Promise<any> => {
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Microphone permission not granted");
      }

      const { isStealthMode } = useSessionStore.getState();

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        // @ts-ignore - Support earpiece routing if available in current version
        shouldRouteThroughEarpieceAndroid: isStealthMode,
      });

      const recorder = new AudioModule.AudioRecorder(
        RecordingPresets.HIGH_QUALITY,
      );
      await recorder.prepareToRecordAsync();
      recorder.record();

      return recorder;
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  },

  speak: async (text: string) => {
    try {
      const { isStealthMode } = useSessionStore.getState();

      // Ensure audio mode is set correctly before speaking
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        // @ts-ignore
        shouldRouteThroughEarpieceAndroid: isStealthMode,
      });

      Speech.speak(text, {
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      console.error("Speech error:", error);
    }
  },

  stopRecording: async (recorder: any): Promise<string> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        console.log("Recording stopped. File stored at:", uri);
        return uri;
      }
      throw new Error("Recording ended but no URI was generated.");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  },

  transcribeAudio: async (uri: string): Promise<boolean> => {
    try {
      const { cvText, jobDescription, role, company, tone, userId } =
        useSessionStore.getState();

      const fm = [
        { name: "cvText", value: cvText },
        { name: "jobDescription", value: jobDescription },
        { name: "role", value: role },
        { name: "company", value: company },
        { name: "tone", value: tone },
        { name: "userId", value: userId },
      ];

      const formData = new FormData();
      const filename = uri.split("/").pop() || "recording.m4a";
      const type = filename.endsWith(".wav") ? "audio/wav" : "audio/m4a";

      formData.append("file", {
        uri,
        name: filename,
        type,
      } as any);

      fm.forEach((item: { name: string; value: any }) => {
        if (item.value !== null && item.value !== undefined) {
          formData.append(item.name, String(item.value));
        }
      });

      await client.post("/transcript", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return true;
    } catch (error) {
      throw error;

      // if (error instanceof AxiosError) {
      //   console.log(error.response?.data.errors[0].messages.join(", "));
      // }
      // return false;
    }
  },
};
