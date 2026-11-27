import "server-only";

import { Mastra } from "@mastra/core";
import { noopLogger } from "@mastra/core/logger";
import { Observability } from "@mastra/observability";
import { OtelBridge } from "@mastra/otel-bridge";

import { issueChatAgent } from "@turnover/core/agents/issue-chat/issue-chat.agent";

const mastra = new Mastra({
  agents: { [issueChatAgent.id]: issueChatAgent },
  logger: noopLogger,
  observability: new Observability({
    configs: {
      default: { serviceName: "turnover", bridge: new OtelBridge() },
    },
  }),
});

export default mastra;
