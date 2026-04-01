## Overview

This app is your dedicated AI coach designed to help you land your dream job. It provides a personalized platform for interview preparation and resume optimization, taking the stress out of job seeking. You can practice interviews with an AI, get your resume tailored for specific job descriptions, and even receive discreet assistance during real interviews, all from your mobile device.

## Features

- **Interactive AI Interview Practice**: Engage in mock interviews where an AI asks questions, and you respond by typing. The AI provides instant feedback on your answers and poses follow-up questions to hone your skills.
- **AI-Powered Resume Optimization**: Upload your current CV and paste a target job description. The AI will then craft a tailored version of your resume, increasing its chances of passing Applicant Tracking Systems (ATS) and impressing recruiters. You can also select from various resume templates.
- **Real-time Interview Assistance (Audio)**: During an actual interview, activate assistance mode to discreetly transcribe the interviewer's questions and receive AI-generated prompts or answers via audio, ensuring you're always prepared.
- **Secure API Key Management**: Safely store your OpenAI and Google Gemini API keys, encrypted on the backend and protected by a password, ensuring your sensitive credentials remain private.
- **Personalized Session Configuration**: Customize your interview and resume sessions by setting your target role, company, and preferred communication tone (e.g., confident, humble, assertive).
- **Unique User Identity**: A persistent user ID ensures your data and session history are consistently managed across multiple uses of the app.
- **Adaptive Theming & Stealth Mode**: Switch between a clear light mode and an eye-friendly dark mode. Activate "Stealth Mode" to prioritize earpiece audio, enabling discreet AI assistance during calls.
- **Document Handling**: Easily upload resumes in PDF or DOCX format and download your AI-optimized resumes as PDFs directly to your device.

## Getting Started

To get the JobReady AI app running locally, follow these steps:

### Installation

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/ennyolar96/jobberflow-frontend.git
    cd jobberFlow-ai
    ```

    _(Remember to replace `https://github.com/ennyolar96/jobberflow-frontend.git` with your actual repository URL)_

2.  **Install Dependencies**:
    ```bash
    npm install
    # or if you prefer yarn
    # yarn install
    ```

### Environment Variables

Before running the app, you need to set up environment variables for the client to connect to your backend services. Create a `.env` file in the root of the project:

- `EXPO_PUBLIC_API_URI`: The base URL for your backend API and WebSocket server. This is where the frontend will send requests for AI processing and key management.
  - Example: `EXPO_PUBLIC_API_URI=http://localhost:3000` (for local development)
  - Example: `EXPO_PUBLIC_API_URI=https://api.yourdomain.com` (for production)

## Usage

1.  **Start the Expo Development Server**:

    ```bash
    npm start
    # or
    npx expo start
    ```

    This will open the Expo Dev Tools in your browser. You can then run the app on an iOS simulator, Android emulator, or your physical device using the Expo Go app.

2.  **Onboarding & User ID Setup**:
    - The first time you open the app, you'll go through a quick onboarding.
    - You'll then be prompted to set up your unique User ID. You can generate a new one or input an existing one. This ID helps link your data securely on the backend.

3.  **Configure API Keys (Settings Tab)**:
    - Navigate to the "Settings" tab.
    - Enter your OpenAI and Google Gemini API keys. These keys are crucial for the AI functionalities.
    - Set a strong password to encrypt and save your keys on the backend. This password will be required to view or update your keys later.

4.  **Optimize Your Resume (Resume AI Tab)**:
    - Go to the "Resume AI" tab.
    - **Upload Resume**: Tap the upload box to select your CV (PDF or DOCX format) from your device. The app will extract the text.
    - **Paste Job Description**: Paste the full text of the job description you're applying for into the designated text area.
    - **Choose Template**: Select a resume template from the picker.
    - **Optimize**: Tap "Optimize" to let the AI tailor your resume to the job description.
    - **Review & Download**: Preview the AI-optimized resume, then copy it as Markdown or download it as a PDF.

5.  **Practice Interviews (Interview Tab)**:
    - Head to the "Interview" tab.
    - The AI will start by asking a question based on your profile and job description.
    - Type your responses in the input box and send them.
    - Receive AI feedback, ratings, and the next question, just like a real interview.

6.  **Get Real-time Assistance (Assistance Tab)**:
    - Switch to the "Assistance" tab.
    - Tap the microphone button when the interviewer speaks. The app will transcribe their question.
    - The AI will process the question and provide a discreet response.
    - Tap the microphone again to stop listening and allow the AI to process.

7.  **Customize Your Session (Settings Tab)**:
    - In the "Settings" tab, you can update your target role, company name, and preferred interview tone at any time for more tailored interactions.
    - Toggle Dark Mode for a different visual experience or enable "Stealth Mode" for discreet audio during assistance.

## Technologies Used

| Category      | Technology                                                                        | Description                                                         |
| :------------ | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| **Frontend**  | [React Native](https://reactnative.dev/)                                          | Cross-platform mobile development framework                         |
|               | [Expo](https://expo.dev/)                                                         | Platform for universal React applications                           |
|               | [TypeScript](https://www.typescriptlang.org/)                                     | Strongly typed superset of JavaScript                               |
|               | [Zustand](https://zustand-bear.github.io/blog/)                                   | Fast and scalable state-management solution                         |
|               | [Expo Router](https://docs.expo.dev/router/overview/)                             | File-system based router for Expo and React Native                  |
|               | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)    | High-performance animations and interactions                        |
|               | [Axios](https://axios-http.com/)                                                  | Promise-based HTTP client for the browser and Node.js               |
|               | [Socket.IO Client](https://socket.io/docs/v4/client-api/)                         | Real-time bidirectional event-based communication                   |
|               | [Expo DocumentPicker](https://docs.expo.dev/versions/latest/sdk/document-picker/) | Allows access to the system's UI for selecting documents            |
|               | [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)                | Share local files to other apps                                     |
|               | [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)                    | Play and record audio in the background on iOS, Android, and web    |
| **Backend**   | [Node.js](https://nodejs.org/en/)                                                 | JavaScript runtime for server-side logic (implied by `keeper` file) |
|               | [Express.js](https://expressjs.com/)                                              | Fast, unopinionated, minimalist web framework for Node.js (implied) |
|               | [OpenAI API](https://openai.com/docs/api-reference)                               | AI model integration for natural language processing                |
|               | [Google Gemini AI API](https://ai.google.dev/docs/gemini_api_overview)            | Advanced AI models for diverse tasks                                |
| **Utilities** | [uuid](https://www.npmjs.com/package/uuid)                                        | Generate RFC-compliant UUIDs                                        |
|               | [Turndown](https://github.com/domchristie/turndown)                               | HTML to Markdown converter                                          |
|               | [Day.js](https://day.js.org/)                                                     | Fast 2KB alternative to Moment.js with the same modern API          |

## Contributing

We welcome contributions to JobReady AI! If you have suggestions for new features, bug fixes, or improvements, please feel free to:

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Make your changes and ensure they adhere to the project's coding style.
4.  Write clear and concise commit messages.
5.  Open a pull request describing your changes in detail.

## Author Info

- **Olaniyan Mutiu A.**
  - LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/ennyolar96)
  - X (Twitter): [Your X Profile](https://x.com/ennyolar96)

## Badges

[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-463238?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-bear.github.io/blog/)
[![Axios](https://img.shields.io/badge/axios-6710CF?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-6A0DAD?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/docs/gemini_api_overview)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)

# jobberflow-frontend
