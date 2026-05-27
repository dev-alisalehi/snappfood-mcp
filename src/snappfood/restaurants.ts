import { AppError, EndpointNotMappedError } from "../errors.js";
import { endpoints } from "./endpoints.js";
import type { SnappfoodClient } from "./client.js";
import type { RestaurantSearchFilters, RestaurantSearchResult, RestaurantSummary, SelectedAddress } from "./types.js";

export async function searchRestaurants(
  client: SnappfoodClient,
  address: SelectedAddress,
  filters: RestaurantSearchFilters
): Promise<RestaurantSearchResult> {
  const endpoint = endpoints.searchRestaurants;

  if (!endpoint) {
    throw new EndpointNotMappedError("searchRestaurants");
  }

  if (typeof address.latitude !== "number" || typeof address.longitude !== "number") {
    throw new AppError(
      "NO_ADDRESS_SELECTED",
      "The selected Snappfood address does not include latitude and longitude. Call get_saved_addresses and select an address that has coordinates."
    );
  }

  const response = await client.request<unknown>(endpoint, {
    query: {
      lat: address.latitude,
      long: address.longitude,
      page_size: filters.limit,
      page: pageFromOffset(filters.limit, filters.offset),
      q: filters.query,
      query: filters.query,
      cuisine: filters.cuisine
    }
  });

  return mapRestaurantSearch(response);
}

function mapRestaurantSearch(response: unknown): RestaurantSearchResult {
  if (!isRecord(response)) {
    throw unexpectedRestaurantResponse();
  }

  if (response.status !== true) {
    throw new AppError("SNAPPFOOD_API_ERROR", "Snappfood returned an unsuccessful restaurant search response.");
  }

  const data = response.data;

  if (!isRecord(data) || !Array.isArray(data.finalResult)) {
    throw unexpectedRestaurantResponse();
  }

  return {
    count: numberValue(data.count),
    openCount: numberValue(data.open_count),
    restaurants: data.finalResult.flatMap(mapRestaurantResultItem)
  };
}

function mapRestaurantResultItem(item: unknown, index: number): RestaurantSummary[] {
  if (!isRecord(item) || item.type !== "VENDOR" || !isRecord(item.data)) {
    return [];
  }

  return [mapRestaurant(item.data, index)];
}

function mapRestaurant(record: Record<string, unknown>, index: number): RestaurantSummary {
  const id = stringValue(record.id) ?? String(index);
  const vendorCode = stringValue(record.vendorCode) ?? id;
  const discountText = firstText([
    stringValue(record.best_coupon),
    discountValueText(numberValue(record.discountValueForView)),
    discountValueText(numberValue(record.discountValue))
  ]);

  return {
    id,
    vendorCode,
    title: stringValue(record.title) ?? `Restaurant ${index + 1}`,
    description: stringValue(record.description),
    rating: numberValue(record.rate),
    normalizedRating: numberValue(record.rating) ?? numberValue(record.normalized_rating),
    voteCount: numberValue(record.voteCount),
    commentCount: numberValue(record.commentCount) ?? numberValue(record.countReview),
    deliveryFee: numberValue(record.deliveryFee),
    deliveryFeeAfterDiscount: numberValue(record.deliveryFeeAfterDiscount),
    deliveryTimeMinutes: positiveNumberValue(record.eta) ?? positiveNumberValue(record.deliveryTime),
    isOpen: booleanValue(record.isOpen),
    noOrder: booleanValue(record.noOrder),
    onlineOrder: booleanValue(record.onlineOrder),
    minOrder: numberValue(record.minOrder),
    discountText,
    bestCoupon: stringValue(record.best_coupon),
    budgetClass: stringValue(record.budgetClass),
    vendorTypeTitle: stringValue(record.vendorTypeTitle),
    city: stringValue(record.city),
    area: stringValue(record.area),
    address: stringValue(record.address),
    latitude: numberValue(record.lat),
    longitude: numberValue(record.lon),
    cuisines: mapCuisineTitles(record.cuisinesArray),
    badges: mapBadgeTexts(record.badge_list)
  };
}

function mapCuisineTitles(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const titles = value
    .map((item) => (isRecord(item) ? stringValue(item.title) : undefined))
    .filter((title): title is string => title !== undefined);

  return titles.length > 0 ? titles : undefined;
}

function mapBadgeTexts(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const texts = value
    .map((item) => (isRecord(item) ? stringValue(item.text) : undefined))
    .filter((text): text is string => text !== undefined);

  return texts.length > 0 ? Array.from(new Set(texts)) : undefined;
}

function pageFromOffset(limit: number, offset: number): number | undefined {
  if (offset <= 0) {
    return undefined;
  }

  return Math.floor(offset / limit) + 1;
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

function positiveNumberValue(value: unknown): number | undefined {
  const number = numberValue(value);
  return number !== undefined && number > 0 ? number : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function firstText(values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined);
}

function discountValueText(value: number | undefined): string | undefined {
  return value && value > 0 ? `${value}% discount` : undefined;
}

function unexpectedRestaurantResponse(): AppError {
  return new AppError("UNEXPECTED_RESPONSE", "Snappfood returned an unexpected restaurant search response shape.");
}
