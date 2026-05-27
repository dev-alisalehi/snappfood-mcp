import type { MenuItem, MenuVariation, RestaurantMenu } from "../types.js";

export function restaurantMenuToMarkdown(menu: RestaurantMenu): string {
  const lines = ["# Restaurant Menu", "", `Vendor code: ${menu.vendorCode}`];

  if (menu.categories.length === 0) {
    lines.push("", "No menu categories were returned.");
    return lines.join("\n");
  }

  const itemCount = menu.categories.reduce((count, category) => count + category.items.length, 0);
  lines.push(`Categories: ${menu.categories.length}`);
  lines.push(`Items: ${itemCount}`);
  lines.push("");

  for (const category of menu.categories) {
    lines.push(`## ${category.title}`);

    for (const item of category.items) {
      lines.push(formatItem(item));

      if (item.description) {
        lines.push(`  - Description: ${item.description}`);
      }

      const details = formatItemDetails(item);
      if (details.length > 0) {
        lines.push(`  - Details: ${details.join("; ")}`);
      }

      if (item.variations.length > 1) {
        lines.push(`  - Variations: ${item.variations.map(formatVariation).join(" | ")}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatItem(item: MenuItem): string {
  const price = formatPrice(item.price, item.discountPrice);
  return price ? `- ${item.title} (${price})` : `- ${item.title}`;
}

function formatItemDetails(item: MenuItem): string[] {
  const details: string[] = [`id ${item.id}`];

  if (item.alias) {
    details.push(`alias ${item.alias}`);
  }

  if (typeof item.discountRatio === "number") {
    details.push(`${item.discountRatio}% discount`);
  }

  if (typeof item.stock === "number") {
    details.push(`stock ${item.stock}`);
  }

  if (item.isAvailable === false) {
    details.push("unavailable");
  }

  if (typeof item.rate === "number") {
    details.push(`rating ${round(item.rate)}`);
  }

  if (item.popularityBadge) {
    details.push(`badge ${item.popularityBadge}`);
  }

  return details;
}

function formatVariation(variation: MenuVariation): string {
  const parts = [variation.title || variation.id];
  const price = formatPrice(variation.price, variation.discountPrice);

  if (price) {
    parts.push(price);
  }

  if (typeof variation.discountRatio === "number") {
    parts.push(`${variation.discountRatio}% off`);
  }

  if (variation.isAvailable === false) {
    parts.push("unavailable");
  }

  return parts.join(", ");
}

function formatPrice(price: number | undefined, discountPrice: number | undefined): string | undefined {
  if (price === undefined) {
    return undefined;
  }

  if (discountPrice !== undefined && discountPrice !== price) {
    return `${discountPrice} toman after discount, originally ${price}`;
  }

  return `${price} toman`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
