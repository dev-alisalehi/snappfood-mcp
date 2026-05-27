import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { Config } from "./config.js";
import { SnappfoodClient } from "./snappfood/client.js";
import { SelectedAddressState } from "./state/selected-address.js";
import { registerGetRestaurantMenuTool } from "./tools/get-restaurant-menu.js";
import { registerGetProductReviewsTool } from "./tools/get-product-reviews.js";
import { registerGetSavedAddressesTool } from "./tools/get-saved-addresses.js";
import { registerSearchRestaurantsTool } from "./tools/search-restaurants.js";
import { registerSelectAddressTool } from "./tools/select-address.js";

export function createServer(config: Config): McpServer {
  const server = new McpServer({
    name: "snappfood-mcp",
    version: "0.1.0"
  });

  const client = new SnappfoodClient(config);
  const selectedAddressState = new SelectedAddressState();

  registerGetSavedAddressesTool(server, client);
  registerSelectAddressTool(server, client, selectedAddressState);
  registerSearchRestaurantsTool(server, client, selectedAddressState);
  registerGetRestaurantMenuTool(server, client);
  registerGetProductReviewsTool(server, client);

  return server;
}
