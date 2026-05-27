import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getSavedAddresses } from "../snappfood/addresses.js";
import type { SnappfoodClient } from "../snappfood/client.js";
import type { SelectedAddressState } from "../state/selected-address.js";
import { errorResult, jsonResult } from "../utils/tool-result.js";

export function registerSelectAddressTool(
  server: McpServer,
  client: SnappfoodClient,
  selectedAddressState: SelectedAddressState
): void {
  server.registerTool(
    "select_address",
    {
      title: "Select Address",
      description: "Select one of the user's saved Snappfood addresses by id for the current MCP session.",
      inputSchema: {
        addressId: z.string().min(1).describe("The id returned by get_saved_addresses.")
      }
    },
    async ({ addressId }) => {
      try {
        const addresses = await getSavedAddresses(client);
        const address = addresses.find((candidate) => candidate.id === addressId);

        if (!address) {
          return jsonResult({
            ok: false,
            error: {
              code: "ADDRESS_NOT_FOUND",
              message: `No saved address was found for id "${addressId}".`
            }
          });
        }

        const selected = selectedAddressState.set({
          id: address.id,
          title: address.title,
          city: address.city,
          district: address.district,
          latitude: address.latitude,
          longitude: address.longitude
        });

        return jsonResult({
          ok: true,
          selectedAddress: selected
        });
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
