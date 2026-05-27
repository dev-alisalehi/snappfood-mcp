# snappfood-mcp

MCP server for exploring Snappfood saved addresses, nearby restaurants, menus, and product reviews from Codex, Claude Desktop, or any stdio-compatible MCP client.

This package is intentionally API-discovery-first. Snappfood endpoints are not documented here yet, so the source tree has explicit endpoint placeholders in `src/snappfood/endpoints.ts`. Once real browser requests are captured, those paths and response mappers can be filled without changing the MCP tool layer.

## Scope

Version 0.1 focuses on browsing workflows:

- `get_saved_addresses`
- `select_address`
- `search_restaurants`
- `get_restaurant_menu`
- `get_product_reviews`

Checkout, order placement, and payment gateway link generation are intentionally out of scope for the first version.

## Configuration

The server reads the user's Snappfood JWT from the MCP client environment:

```txt
SNAPPFOOD_JWT=your-jwt-here
```

If Snappfood returns `401` or `403`, the server returns an `AUTH_EXPIRED` error and does not attempt token refresh or OTP login.

Optional:

```txt
SNAPPFOOD_BASE_URL=https://snappfood.ir
DEBUG=snappfood-mcp
```

Debug mode avoids printing JWTs and phone numbers where possible, but it should still be used only during local development.

## Claude Desktop

```json
{
  "mcpServers": {
    "snappfood": {
      "command": "npx",
      "args": ["snappfood-mcp"],
      "env": {
        "SNAPPFOOD_JWT": "your-jwt-here"
      }
    }
  }
}
```

## Local Development

```sh
npm install
npm run build
SNAPPFOOD_JWT=your-jwt-here node dist/index.js
```

The server uses stdio, so do not write normal logs to stdout. Use stderr for diagnostics.

## API Discovery

To map the real Snappfood API:

1. Log in to Snappfood web.
2. Open DevTools Network.
3. Capture requests for saved addresses, restaurant search, and restaurant menu.
4. Copy selected requests as cURL or export a HAR.
5. Redact tokens, cookies, phone numbers, and full addresses before committing samples.
6. Fill `src/snappfood/endpoints.ts` and the mappers in `src/snappfood/addresses.ts`, `src/snappfood/restaurants.ts`, and `src/snappfood/menus.ts`.

## Architecture

```txt
src/
  index.ts                  # stdio entrypoint
  server.ts                 # MCP server and tool registration
  config.ts                 # env config
  errors.ts                 # normalized English errors
  snappfood/
    client.ts               # JWT-authenticated HTTP client
    endpoints.ts            # captured endpoint paths
    types.ts                # domain types
    addresses.ts            # saved-address API wrapper
    restaurants.ts          # restaurant search wrapper
    menus.ts                # menu wrapper
    comments.ts             # product review wrapper
  state/
    selected-address.ts     # in-memory session address selection
  tools/
    get-saved-addresses.ts
    select-address.ts
    search-restaurants.ts
    get-restaurant-menu.ts
    get-product-reviews.ts
  utils/
    redact.ts
    schemas.ts
    tool-result.ts
```
