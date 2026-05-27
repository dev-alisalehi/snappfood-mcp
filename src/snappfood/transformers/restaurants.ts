import type { RestaurantSearchResult, RestaurantSummary, SelectedAddress } from "../types.js";

export function restaurantSearchToMarkdown(result: RestaurantSearchResult, selectedAddress: SelectedAddress): string {
  const lines = ["# Restaurants", ""];

  lines.push(`Selected address: ${selectedAddress.title ?? selectedAddress.id}`);

  if (typeof selectedAddress.latitude === "number" && typeof selectedAddress.longitude === "number") {
    lines.push(`Search location: ${selectedAddress.latitude}, ${selectedAddress.longitude}`);
  }

  if (typeof result.count === "number" || typeof result.openCount === "number") {
    lines.push(
      `Result counts: ${formatCount(result.openCount, "open")} / ${formatCount(result.count, "total")}`
    );
  }

  if (result.restaurants.length === 0) {
    lines.push("", "No restaurants were returned.");
    return lines.join("\n");
  }

  lines.push("");

  for (const [index, restaurant] of result.restaurants.entries()) {
    lines.push(`## ${index + 1}. ${restaurant.title}`);
    lines.push(`- Vendor code: ${restaurant.vendorCode}`);
    lines.push(`- ID: ${restaurant.id}`);

    const summary = formatSummary(restaurant);
    if (summary.length > 0) {
      lines.push(`- Summary: ${summary.join("; ")}`);
    }

    if (restaurant.description) {
      lines.push(`- Food types: ${restaurant.description}`);
    }

    if (restaurant.cuisines?.length) {
      lines.push(`- Cuisines: ${restaurant.cuisines.join(", ")}`);
    }

    if (restaurant.discountText) {
      lines.push(`- Offer: ${restaurant.discountText}`);
    }

    if (restaurant.badges?.length) {
      lines.push(`- Badges: ${restaurant.badges.join(", ")}`);
    }

    if (restaurant.address) {
      lines.push(`- Address: ${restaurant.address}`);
    }

    if (typeof restaurant.latitude === "number" && typeof restaurant.longitude === "number") {
      lines.push(`- Location: ${restaurant.latitude}, ${restaurant.longitude}`);
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatSummary(restaurant: RestaurantSummary): string[] {
  const parts: string[] = [];

  if (typeof restaurant.rating === "number") {
    parts.push(`rating ${restaurant.rating}`);
  }

  if (typeof restaurant.voteCount === "number") {
    parts.push(`${restaurant.voteCount} votes`);
  }

  if (typeof restaurant.isOpen === "boolean") {
    parts.push(restaurant.isOpen ? "open" : "closed");
  }

  if (restaurant.noOrder === true) {
    parts.push("not accepting orders");
  }

  if (typeof restaurant.deliveryFee === "number") {
    parts.push(`delivery ${restaurant.deliveryFee} toman`);
  }

  if (typeof restaurant.deliveryFeeAfterDiscount === "number" && restaurant.deliveryFeeAfterDiscount > 0) {
    parts.push(`discounted delivery ${restaurant.deliveryFeeAfterDiscount} toman`);
  }

  if (typeof restaurant.deliveryTimeMinutes === "number") {
    parts.push(`delivery time ${restaurant.deliveryTimeMinutes} min`);
  }

  if (typeof restaurant.minOrder === "number") {
    parts.push(`min order ${restaurant.minOrder} toman`);
  }

  if (restaurant.budgetClass) {
    parts.push(`budget ${restaurant.budgetClass}`);
  }

  if (restaurant.area || restaurant.city) {
    parts.push([restaurant.area, restaurant.city].filter(Boolean).join(", "));
  }

  return parts;
}

function formatCount(value: number | undefined, label: string): string {
  return typeof value === "number" ? `${value} ${label}` : `unknown ${label}`;
}
