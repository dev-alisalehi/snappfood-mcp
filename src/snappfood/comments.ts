import { AppError, EndpointNotMappedError } from "../errors.js";
import { endpoints } from "./endpoints.js";
import type { SnappfoodClient } from "./client.js";
import type { ProductReviewComment, ProductReviewReply, ProductReviewsResult } from "./types.js";

export interface GetProductReviewsOptions {
  variationIds: string[];
  maxComments?: number;
}

export async function getProductReviews(
  client: SnappfoodClient,
  options: GetProductReviewsOptions
): Promise<ProductReviewsResult> {
  const endpoint = endpoints.getProductReviews;

  if (!endpoint) {
    throw new EndpointNotMappedError("getProductReviews");
  }

  const variationIds = normalizeVariationIds(options.variationIds);

  if (variationIds.length === 0) {
    throw new AppError("UNEXPECTED_RESPONSE", "At least one variation id is required to fetch product reviews.");
  }

  const response = await client.request<unknown>(endpoint, {
    query: {
      variationIds: variationIds.join(",")
    }
  });

  return mapProductReviews(variationIds, response, options.maxComments);
}

function mapProductReviews(variationIds: string[], response: unknown, maxComments: number | undefined): ProductReviewsResult {
  if (!isRecord(response)) {
    throw unexpectedProductReviewsResponse();
  }

  if (response.status !== true) {
    throw new AppError("SNAPPFOOD_API_ERROR", "Snappfood returned an unsuccessful product-review response.");
  }

  const data = response.data;

  if (!isRecord(data) || !Array.isArray(data.comments)) {
    throw unexpectedProductReviewsResponse();
  }

  const comments = data.comments.flatMap(mapProductReviewComment);

  return {
    variationIds,
    hasNextPage: booleanValue(data.hasNextPage),
    pageSize: numberValue(data.pageSize),
    comments: typeof maxComments === "number" ? comments.slice(0, maxComments) : comments
  };
}

function mapProductReviewComment(comment: unknown, index: number): ProductReviewComment[] {
  if (!isRecord(comment)) {
    return [];
  }

  const text = stringValue(comment.commentText);

  if (!text) {
    return [];
  }

  return [
    {
      id: stringValue(comment.commentId) ?? String(index),
      text,
      date: stringValue(comment.date),
      deliveryComment: stringValue(comment.deliveryComment),
      feeling: stringValue(comment.feeling),
      sender: stringValue(comment.sender),
      rating: numberValue(comment.rating) ?? numberValue(comment.rate),
      foods: mapFoodTitles(comment.foods),
      replies: mapReplies(comment.replies)
    }
  ];
}

function mapFoodTitles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((food) => (isRecord(food) ? stringValue(food.title) : undefined))
    .filter((title): title is string => title !== undefined);
}

function mapReplies(value: unknown): ProductReviewReply[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((reply): ProductReviewReply[] => {
    if (!isRecord(reply)) {
      return [];
    }

    const text = stringValue(reply.commentText);

    if (!text) {
      return [];
    }

    return [
      {
        source: stringValue(reply.source),
        text,
        date: stringValue(reply.date)
      }
    ];
  });
}

function normalizeVariationIds(variationIds: string[]): string[] {
  return Array.from(new Set(variationIds.map((id) => id.trim()).filter(Boolean)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function unexpectedProductReviewsResponse(): AppError {
  return new AppError("UNEXPECTED_RESPONSE", "Snappfood returned an unexpected product-review response shape.");
}
