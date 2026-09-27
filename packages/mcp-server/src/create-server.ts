import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { BusinessOffer } from "@agentweb/core";
import {
  getBookingOptions,
  getBusinessInfo,
  getOpeningHours,
  getPrices,
  listServices,
  searchOffer,
} from "./tools.js";

export function createAgentWebMcpServer(offer: BusinessOffer): Server {
  const server = new Server(
    { name: "agentweb", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_business_info",
        description: "Identité, coordonnées et métadonnées du commerce (lecture seule).",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
      },
      {
        name: "list_services",
        description: "Liste des prestations / produits structurés.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
      },
      {
        name: "get_prices",
        description: "Prix connus pour les offres extraites.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
      },
      {
        name: "get_opening_hours",
        description: "Horaires d'ouverture structurés.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
      },
      {
        name: "search_offer",
        description: "Recherche textuelle dans les offres et pages.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string", description: "Terme de recherche" } },
          required: ["query"],
          additionalProperties: false,
        },
      },
      {
        name: "get_booking_options",
        description: "Liens de prise de RDV / devis (aucune soumission de formulaire).",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    let payload: unknown;
    switch (name) {
      case "get_business_info":
        payload = getBusinessInfo(offer);
        break;
      case "list_services":
        payload = listServices(offer);
        break;
      case "get_prices":
        payload = getPrices(offer);
        break;
      case "get_opening_hours":
        payload = getOpeningHours(offer);
        break;
      case "search_offer":
        payload = searchOffer(offer, String(args.query ?? ""));
        break;
      case "get_booking_options":
        payload = getBookingOptions(offer);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    };
  });

  return server;
}
