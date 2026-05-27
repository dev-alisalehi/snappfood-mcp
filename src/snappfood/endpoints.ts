export type EndpointKey =
  | "getSavedAddresses"
  | "searchRestaurants"
  | "getRestaurantMenu"
  | "getProductReviews";

export const endpoints: Partial<Record<EndpointKey, string>> = {
  getSavedAddresses: "/mobile/v4/user/user-addresses",
  searchRestaurants: "/search/api/v4/restaurant/vendors-list",
  getRestaurantMenu: "https://apigw.snappfood.ir/menu-read-model/",
  getProductReviews: "/mobile/v3/restaurant/productReviews",
  // Fill these after API discovery from Snappfood web traffic.
  // Example shape only:
};
