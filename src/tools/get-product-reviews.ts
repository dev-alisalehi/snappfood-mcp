import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getProductReviews } from "../snappfood/comments.js";
import type { SnappfoodClient } from "../snappfood/client.js";
import { productReviewsToMarkdown } from "../snappfood/transformers/comments.js";
import { errorResult, markdownResult } from "../utils/tool-result.js";

export function registerGetProductReviewsTool(server: McpServer, client: SnappfoodClient): void {
  server.registerTool(
    "get_product_reviews",
    {
      title: "Get Product Reviews",
      description: "Get compact Snappfood reviews for one or more menu variation ids returned by get_restaurant_menu.",
      inputSchema: {
        variationIds: z.array(z.string().trim().min(1)).min(1).max(50).describe("Menu variation ids returned by get_restaurant_menu."),
        maxComments: z.number().int().min(1).max(50).optional().describe("Optional local limit for returned comments.")
      }
    },
    async ({ variationIds, maxComments }) => {
      try {
        const reviews = await getProductReviews(client, { variationIds, maxComments });
        const result = {
          ok: true,
          reviews
        };

        return markdownResult(productReviewsToMarkdown(reviews), result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
