import "server-only";

import { GoogleGenAI } from "@google/genai";

import env from "@turnover/core/config/env.config";

const vertex = new GoogleGenAI({
  vertexai: true,
  project: env.vertex.project,
  location: env.vertex.location,
});

export default vertex;
