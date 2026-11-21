import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import { langfuseSpanProcessor } from "@/lib/langfuse";

export function register() {
  new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
  }).register();
}
