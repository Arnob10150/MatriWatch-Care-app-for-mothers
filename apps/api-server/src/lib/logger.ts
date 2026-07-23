import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// pino-pretty runs as a worker-thread transport, which is not supported in
// serverless runtimes. Vercel sets VERCEL=1 on every deployment, including
// previews, where NODE_ENV is not always "production".
const isServerless = Boolean(process.env.VERCEL);

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction || isServerless
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
