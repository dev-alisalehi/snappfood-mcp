import { AppError, EndpointNotMappedError } from "../errors.js";
import { endpoints } from "./endpoints.js";
import type { SnappfoodClient } from "./client.js";
import type { MenuItem, MenuVariation, RestaurantMenu } from "./types.js";

export async function getRestaurantMenu(
  client: SnappfoodClient,
  vendorCode: string
): Promise<RestaurantMenu> {
  const endpoint = endpoints.getRestaurantMenu;

  if (!endpoint) {
    throw new EndpointNotMappedError("getRestaurantMenu");
  }

  const response = await client.request<unknown>(`${endpoint}${encodeURIComponent(vendorCode)}`);

  return mapRestaurantMenu(vendorCode, response);
}

function mapRestaurantMenu(vendorCode: string, response: unknown): RestaurantMenu {
  if (!isRecord(response)) {
    throw unexpectedMenuResponse();
  }

  const data = response.data;

  if (!isRecord(data) || !Array.isArray(data.menuCategories)) {
    throw unexpectedMenuResponse();
  }

  return {
    vendorCode,
    categories: data.menuCategories.flatMap(mapMenuCategory)
  };
}

function mapMenuCategory(category: unknown, categoryIndex: number) {
  if (!isRecord(category)) {
    return [];
  }

  const products = Array.isArray(category.products) ? category.products : [];
  const items = products.flatMap((product, productIndex) =>
    mapMenuProduct(product, stringValue(category.title), productIndex)
  );

  if (items.length === 0) {
    return [];
  }

  return [
    {
      id: stringValue(category.id) ?? String(categoryIndex),
      title: stringValue(category.title) ?? `Category ${categoryIndex + 1}`,
      items
    }
  ];
}

function mapMenuProduct(product: unknown, categoryTitle: string | undefined, productIndex: number): MenuItem[] {
  if (!isRecord(product)) {
    return [];
  }

  const variations = mapVariations(product.variations);
  const primaryVariation = variations[0];
  const id = primaryVariation?.id ?? stringValue(product.id) ?? stringValue(product.alias) ?? String(productIndex);

  return [
    {
      id,
      alias: stringValue(product.alias),
      title: stringValue(product.title) ?? `Item ${productIndex + 1}`,
      description: firstText([stringValue(product.description), primaryVariation?.description]),
      price: primaryVariation?.price,
      discountPrice: primaryVariation?.discountPrice,
      discountAmount: primaryVariation?.discountAmount,
      discountRatio: primaryVariation?.discountRatio,
      isAvailable: variations.length > 0 ? variations.some((variation) => variation.isAvailable !== false) : undefined,
      categoryTitle,
      rate: numberValue(product.rate) ?? primaryVariation?.rate,
      stock: primaryVariation?.stock,
      popularityBadge: stringValue(product.popularityBadge),
      variations
    }
  ];
}

function mapVariations(value: unknown): MenuVariation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((variation, index) => {
    if (!isRecord(variation)) {
      return [];
    }

    const price = numberValue(variation.price);
    const discount = isRecord(variation.discount) ? variation.discount : undefined;
    const discountAmount = numberValue(discount?.amount);
    const discountRatio = numberValue(discount?.ratio);

    return [
      {
        id: stringValue(variation.id) ?? String(index),
        title: stringValue(variation.title),
        description: stringValue(variation.description),
        price,
        discountPrice: price !== undefined && discountAmount !== undefined ? price - discountAmount : undefined,
        discountAmount,
        discountRatio,
        isAvailable: availabilityValue(variation),
        stock: numberValue(variation.stock),
        rate: numberValue(variation.rate)
      }
    ];
  });
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

function availabilityValue(variation: Record<string, unknown>): boolean | undefined {
  if (booleanValue(variation.active) === false) {
    return false;
  }

  if (variation.disabledUntil !== undefined && variation.disabledUntil !== false) {
    return false;
  }

  if (booleanValue(variation.active) === true || variation.disabledUntil === false) {
    return true;
  }

  return undefined;
}

function firstText(values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined);
}

function unexpectedMenuResponse(): AppError {
  return new AppError("UNEXPECTED_RESPONSE", "Snappfood returned an unexpected restaurant menu response shape.");
}
