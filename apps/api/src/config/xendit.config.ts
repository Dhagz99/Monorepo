// // config/xendit.config.ts

// export const xenditConfig = {
//   secretKey: process.env.XENDIT_SECRET_KEY,
//   webhookToken: process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN,
//   apiUrl: process.env.XENDIT_API_URL ?? "https://api.xendit.co",
//   webAppUrl: process.env.WEB_APP_URL ?? "http://localhost:3000",
// };

// if (!xenditConfig.secretKey) {
//   throw new Error("XENDIT_SECRET_KEY is missing in .env");
// }

// if (!xenditConfig.webhookToken) {
//   throw new Error("XENDIT_WEBHOOK_VERIFICATION_TOKEN is missing in .env");
// }


// config/xendit.config.ts

const webAppUrl = process.env.WEB_APP_URL;

if (!process.env.XENDIT_SECRET_KEY) {
  throw new Error("XENDIT_SECRET_KEY is missing in .env");
}

if (!process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
  throw new Error("XENDIT_WEBHOOK_VERIFICATION_TOKEN is missing in .env");
}

if (!webAppUrl) {
  throw new Error("WEB_APP_URL is missing in .env");
}

if (!webAppUrl.startsWith("https://")) {
  throw new Error("WEB_APP_URL must be a valid HTTPS URL.");
}

export const xenditConfig = {
  secretKey: process.env.XENDIT_SECRET_KEY,
  webhookToken: process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN,
  apiUrl: process.env.XENDIT_API_URL ?? "https://api.xendit.co",
  webAppUrl,
};