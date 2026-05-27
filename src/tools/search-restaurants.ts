import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type { SnappfoodClient } from "../snappfood/client.js";
import { searchRestaurants } from "../snappfood/restaurants.js";
import { restaurantSearchToMarkdown } from "../snappfood/transformers/restaurants.js";
import type { SelectedAddressState } from "../state/selected-address.js";
import { PaginationSchema } from "../utils/schemas.js";
import { errorResult, markdownResult } from "../utils/tool-result.js";

export function registerSearchRestaurantsTool(
  server: McpServer,
  client: SnappfoodClient,
  selectedAddressState: SelectedAddressState
): void {
  server.registerTool(
    "search_restaurants",
    {
      title: "Search Restaurants",
      description: "Search Snappfood restaurants near the currently selected saved address.",
      inputSchema: {
        query: z.string().trim().min(1).optional().describe("Free-text search such as pizza, burger, sushi, or restaurant name."),
        cuisine: z.string().trim().min(1).optional().describe("Cuisine/category filter if Snappfood supports it for the mapped endpoint."),
        ...PaginationSchema
      }
    },
    async ({ query, cuisine, limit, offset }) => {
      try {
        const address = selectedAddressState.get();
        const result = await searchRestaurants(client, address, {
          query,
          cuisine,
          limit,
          offset
        });

        const data = {
          ok: true,
          selectedAddress: address,
          ...result
        };

        return markdownResult(restaurantSearchToMarkdown(result, address), data);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
