import { createServer as createHttpServer } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { BusinessOffer } from "@agentweb/core";
import { createAgentWebMcpServer } from "./create-server.js";

export async function serveMcpStdio(offer: BusinessOffer): Promise<void> {
  const server = createAgentWebMcpServer(offer);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export async function serveMcpHttp(offer: BusinessOffer, port = 3847): Promise<void> {
  const mcpServer = createAgentWebMcpServer(offer);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  await mcpServer.connect(transport);

  const httpServer = createHttpServer(async (req, res) => {
    if (req.url?.startsWith("/mcp")) {
      await transport.handleRequest(req, res);
      return;
    }
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", name: offer.identity.name }));
      return;
    }
    res.writeHead(404);
    res.end("Not found");
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(port, "127.0.0.1", () => {
      console.log(`AgentWeb MCP HTTP listening on http://127.0.0.1:${port}/mcp`);
      resolve();
    });
  });
}
