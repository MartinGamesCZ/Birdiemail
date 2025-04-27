// Which url to use for the app in development and production
export const APP_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001" // dev
    : "https://app.birdiemail.social"; // prod
