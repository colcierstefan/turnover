import "server-only";

import { createVertex } from "@ai-sdk/google-vertex";
import { OpenTelemetry } from "@ai-sdk/otel";
import { registerTelemetry } from "ai";

import env from "@turnover/core/config/env.config";

registerTelemetry(new OpenTelemetry({ agentSpanName: "functionId" }));

const vertex = createVertex({
  project: env.vertex.project,
  location: env.vertex.location,
});

export default vertex;
