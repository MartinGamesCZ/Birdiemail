//export const APP_URL = "https://app.birdiemail.social";
export const APP_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3001"
    : "https://app.birdiemail.social";
