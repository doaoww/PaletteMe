#!/usr/bin/env node
/**
 * Cursor-compatible stdio proxy for Google Stitch MCP.
 * Strips outputSchema from tools/list to stay under Cursor's payload limit.
 * @see https://forum.cursor.com/t/mcp-server-connected-green-dot-and-tools-discovered-in-logs-but-0-tools-in-ui-and-agent/160620
 */

import { createInterface } from "node:readline";

const STITCH_URL = "https://stitch.googleapis.com/mcp";
const API_KEY = process.env.STITCH_API_KEY;

if (!API_KEY) {
  console.error("STITCH_API_KEY env var required");
  process.exit(1);
}

function stripOutputSchema(response) {
  if (response?.result?.tools && Array.isArray(response.result.tools)) {
    response.result.tools = response.result.tools.map((tool) => {
      const { outputSchema, ...rest } = tool;
      return rest;
    });
  }
  return response;
}

async function forwardRequest(line) {
  let parsed;
  try {
    parsed = JSON.parse(line);
  } catch {
    return { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } };
  }

  const { id, method, params } = parsed;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "stitch-proxy", version: "1.0.0" },
      },
    };
  }

  if (method === "notifications/initialized") {
    return null;
  }

  if (method === "tools/list") {
    const res = await fetch(STITCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    const data = await res.json();
    return stripOutputSchema({ ...data, id });
  }

  if (method === "tools/call") {
    const res = await fetch(STITCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params }),
    });
    const data = await res.json();
    return { ...data, id };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on("line", async (line) => {
  const response = await forwardRequest(line.trim());
  if (response) {
    process.stdout.write(JSON.stringify(response) + "\n");
  }
});
