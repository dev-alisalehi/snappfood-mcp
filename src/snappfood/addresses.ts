import { AppError, EndpointNotMappedError } from "../errors.js";
import { endpoints } from "./endpoints.js";
import type { SavedAddress } from "./types.js";
import type { SnappfoodClient } from "./client.js";

export interface GetSavedAddressesOptions {
  latitude?: number;
  longitude?: number;
}

export async function getSavedAddresses(
  client: SnappfoodClient,
  options: GetSavedAddressesOptions = {}
): Promise<SavedAddress[]> {
  const endpoint = endpoints.getSavedAddresses;

  if (!endpoint) {
    throw new EndpointNotMappedError("getSavedAddresses");
  }

  const response = await client.request<unknown>(endpoint, {
    query: {
      lat: options.latitude,
      long: options.longitude,
      optionalClient: "PWA",
      client: "PWA",
      deviceType: "PWA",
      appVersion: "6.0.0"
    }
  });

  return mapSavedAddresses(response);
}

function mapSavedAddresses(response: unknown): SavedAddress[] {
  if (!isRecord(response)) {
    throw unexpectedAddressResponse();
  }

  if (response.status !== true) {
    throw new AppError("SNAPPFOOD_API_ERROR", "Snappfood returned an unsuccessful address response.");
  }

  const data = response.data;

  if (!isRecord(data) || !Array.isArray(data.addresses)) {
    throw unexpectedAddressResponse();
  }

  return data.addresses.map(mapSavedAddress);
}

function mapSavedAddress(item: unknown, index: number): SavedAddress {
  if (!isRecord(item)) {
    throw unexpectedAddressResponse();
  }

  const city = isRecord(item.city) ? stringValue(item.city.title) : undefined;
  const id = stringValue(item.id) ?? String(index);

  return {
    id,
    title: stringValue(item.label),
    city,
    addressLine: stringValue(item.address),
    addressExtra: stringValue(item.addressExtra),
    latitude: numberValue(item.latitude),
    longitude: numberValue(item.longitude),
    isConfirmed: booleanValue(item.isConfirmed),
    score: numberValue(item.score)
  };
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

function unexpectedAddressResponse(): AppError {
  return new AppError("UNEXPECTED_RESPONSE", "Snappfood returned an unexpected saved-address response shape.");
}
