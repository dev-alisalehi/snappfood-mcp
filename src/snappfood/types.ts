export interface SavedAddress {
  id: string;
  title?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  addressExtra?: string;
  latitude?: number;
  longitude?: number;
  isConfirmed?: boolean;
  score?: number;
}

export interface SelectedAddress {
  id: string;
  title?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface RestaurantSearchFilters {
  query?: string;
  cuisine?: string;
  limit: number;
  offset: number;
}

export interface RestaurantSearchResult {
  count?: number;
  openCount?: number;
  restaurants: RestaurantSummary[];
}

export interface RestaurantSummary {
  id: string;
  vendorCode: string;
  title: string;
  description?: string;
  rating?: number;
  normalizedRating?: number;
  voteCount?: number;
  commentCount?: number;
  deliveryFee?: number;
  deliveryFeeAfterDiscount?: number;
  deliveryTimeMinutes?: number;
  isOpen?: boolean;
  noOrder?: boolean;
  onlineOrder?: boolean;
  minOrder?: number;
  discountText?: string;
  bestCoupon?: string;
  budgetClass?: string;
  vendorTypeTitle?: string;
  city?: string;
  area?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  cuisines?: string[];
  badges?: string[];
}

export interface MenuItem {
  id: string;
  alias?: string;
  title: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  discountAmount?: number;
  discountRatio?: number;
  isAvailable?: boolean;
  categoryTitle?: string;
  rate?: number;
  stock?: number;
  popularityBadge?: string;
  variations: MenuVariation[];
}

export interface MenuVariation {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  discountAmount?: number;
  discountRatio?: number;
  isAvailable?: boolean;
  stock?: number;
  rate?: number;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface RestaurantMenu {
  vendorCode: string;
  title?: string;
  categories: MenuCategory[];
}

export interface ProductReviewsResult {
  variationIds: string[];
  hasNextPage?: boolean;
  pageSize?: number;
  comments: ProductReviewComment[];
}

export interface ProductReviewComment {
  id: string;
  text: string;
  date?: string;
  deliveryComment?: string;
  feeling?: string;
  sender?: string;
  rating?: number;
  foods: string[];
  replies: ProductReviewReply[];
}

export interface ProductReviewReply {
  source?: string;
  text: string;
  date?: string;
}
