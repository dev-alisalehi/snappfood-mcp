import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type { SnappfoodClient } from "../snappfood/client.js";
import { getRestaurantMenu } from "../snappfood/menus.js";
import { restaurantMenuToMarkdown } from "../snappfood/transformers/menus.js";
import { errorResult, markdownResult } from "../utils/tool-result.js";

export function registerGetRestaurantMenuTool(server: McpServer, client: SnappfoodClient): void {
  server.registerTool(
    "get_restaurant_menu",
    {
      title: "Get Restaurant Menu",
      description: "Get compact menu categories and items for a Snappfood restaurant by vendor code.",
      inputSchema: {
        vendorCode: z.string().min(1).describe("Vendor code returned by search_restaurants.")
      }
    },
    async ({ vendorCode }) => {
      try {
        const menu = await getRestaurantMenu(client, vendorCode);
        const result = {
          ok: true,
          menu
        };

        return markdownResult(restaurantMenuToMarkdown(menu), result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
