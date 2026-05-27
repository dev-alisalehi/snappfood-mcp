import type { ProductReviewComment, ProductReviewsResult } from "../types.js";

export function productReviewsToMarkdown(result: ProductReviewsResult): string {
  const lines = ["# Product Reviews", "", `Variation IDs: ${result.variationIds.join(", ")}`];

  if (typeof result.pageSize === "number") {
    lines.push(`Page size: ${result.pageSize}`);
  }

  if (typeof result.hasNextPage === "boolean") {
    lines.push(`Has next page: ${result.hasNextPage ? "yes" : "no"}`);
  }

  if (result.comments.length === 0) {
    lines.push("", "No product reviews were returned.");
    return lines.join("\n");
  }

  lines.push(`Comments: ${result.comments.length}`);
  lines.push(`Average rating: ${formatAverageRating(result.comments)}`);
  lines.push(`Feelings: ${formatFeelingCounts(result.comments)}`);
  lines.push("");

  for (const [index, comment] of result.comments.entries()) {
    lines.push(`## ${index + 1}. Review ${comment.id}`);
    lines.push(`- Rating: ${formatRating(comment.rating)}`);

    if (comment.feeling) {
      lines.push(`- Feeling: ${comment.feeling}`);
    }

    if (comment.date) {
      lines.push(`- Date: ${comment.date}`);
    }

    if (comment.sender) {
      lines.push(`- Sender: ${comment.sender}`);
    }

    lines.push(`- Comment: ${formatText(comment.text)}`);

    if (comment.deliveryComment) {
      lines.push(`- Delivery comment: ${formatText(comment.deliveryComment)}`);
    }

    if (comment.foods.length > 0) {
      lines.push(`- Foods: ${comment.foods.join(", ")}`);
    }

    if (comment.replies.length > 0) {
      lines.push("- Replies:");
      for (const reply of comment.replies) {
        const source = reply.source ?? "Reply";
        const date = reply.date ? ` (${reply.date})` : "";
        lines.push(`  - ${source}${date}: ${formatText(reply.text)}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatAverageRating(comments: ProductReviewComment[]): string {
  const ratings = comments
    .map((comment) => comment.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (ratings.length === 0) {
    return "unknown";
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return `${round(average)}/10`;
}

function formatFeelingCounts(comments: ProductReviewComment[]): string {
  const counts = new Map<string, number>();

  for (const comment of comments) {
    if (comment.feeling) {
      counts.set(comment.feeling, (counts.get(comment.feeling) ?? 0) + 1);
    }
  }

  if (counts.size === 0) {
    return "unknown";
  }

  return Array.from(counts.entries())
    .map(([feeling, count]) => `${feeling} ${count}`)
    .join(", ");
}

function formatRating(rating: number | undefined): string {
  return typeof rating === "number" ? `${rating}/10` : "unknown";
}

function formatText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
