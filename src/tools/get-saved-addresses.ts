import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getSavedAddresses } from "../snappfood/addresses.js";
import { savedAddressesToMarkdown } from "../snappfood/transformers/addresses.js";
import type { SnappfoodClient } from "../snappfood/client.js";
import { errorResult, markdownResult } from "../utils/tool-result.js";

export function registerGetSavedAddressesTool(server: McpServer, client: SnappfoodClient): void {
  server.registerTool(
    "get_saved_addresses",
    {
      title: "Get Saved Addresses",
      description: "Get the user's saved Snappfood addresses so one can be selected for restaurant searches.",
      inputSchema: {
        latitude: z.number().optional().describe("Optional current latitude to send to Snappfood for address scoring."),
        longitude: z.number().optional().describe("Optional current longitude to send to Snappfood for address scoring.")
      }
    },
    async ({ latitude, longitude }) => {
      try {
        const addresses = await getSavedAddresses(client, { latitude, longitude });
        const result = {
          ok: true,
          addresses
        };

        return markdownResult(savedAddressesToMarkdown(addresses), result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
