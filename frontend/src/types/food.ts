export interface FoodItem {
  id?: string;
  _id?: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  addedAt: string;
  status?: string;
  addedVia?: string;
  confidenceScore?: number;
  expirySource?: string;
  notes?: string;
}

export interface DonationItem {
  id: string;
  restaurantName: string;
  foodDescription: string;
  quantity: string;
  pickupLocation: string;
  availableUntil: string;
  status: "available" | "claimed" | "picked_up";
  createdAt: string;
}

export const FOOD_CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Grains",
  "Beverages",
  "Snacks",
  "Condiments",
  "Frozen",
  "Other",
] as const;
