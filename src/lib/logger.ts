import "server-only";

import pino from "pino";

import env from "@/config/env.config";

const logger = pino({
  messageKey: "message",
  formatters: {
    // Cloud Logging reads the level from `severity`.
    level: (label) => ({ severity: label.toUpperCase() }),
  },
  transport:
    env.nodeEnv === "development" ? { target: "pino-pretty" } : undefined,
});

export default logger;
