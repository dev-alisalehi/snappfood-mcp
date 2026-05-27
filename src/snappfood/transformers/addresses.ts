import type { SavedAddress } from "../types.js";

export function savedAddressesToMarkdown(addresses: SavedAddress[]): string {
  if (addresses.length === 0) {
    return "# Saved Addresses\n\nNo saved Snappfood addresses were returned.";
  }

  const lines = ["# Saved Addresses", ""];

  for (const [index, address] of addresses.entries()) {
    lines.push(`## ${index + 1}. ${formatTitle(address)}`);
    lines.push(`- ID: ${address.id}`);

    if (address.city) {
      lines.push(`- City: ${address.city}`);
    }

    if (address.addressLine) {
      lines.push(`- Address: ${address.addressLine}`);
    }

    if (address.addressExtra) {
      lines.push(`- Extra: ${address.addressExtra}`);
    }

    if (typeof address.latitude === "number" && typeof address.longitude === "number") {
      lines.push(`- Location: ${address.latitude}, ${address.longitude}`);
    }

    if (typeof address.isConfirmed === "boolean") {
      lines.push(`- Confirmed: ${address.isConfirmed ? "yes" : "no"}`);
    }

    if (typeof address.score === "number") {
      lines.push(`- Score: ${address.score}`);
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function formatTitle(address: SavedAddress): string {
  return address.title ?? address.addressLine ?? `Address ${address.id}`;
}
