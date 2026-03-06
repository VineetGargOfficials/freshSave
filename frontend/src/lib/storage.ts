import { FoodItem, DonationItem } from "@/types/food";

const FOOD_STORAGE_KEY = "freshsave_foods";
const DONATION_STORAGE_KEY = "freshsave_donations";

export function getFoodItems(): FoodItem[] {
  const data = localStorage.getItem(FOOD_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveFoodItems(items: FoodItem[]) {
  localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(items));
}

export function addFoodItem(item: Omit<FoodItem, "id" | "addedAt">): FoodItem {
  const items = getFoodItems();
  const newItem: FoodItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveFoodItems(items);
  return newItem;
}

export function removeFoodItem(id: string) {
  const items = getFoodItems().filter((i) => i.id !== id);
  saveFoodItems(items);
}

export function getDonations(): DonationItem[] {
  const data = localStorage.getItem(DONATION_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDonations(items: DonationItem[]) {
  localStorage.setItem(DONATION_STORAGE_KEY, JSON.stringify(items));
}

export function addDonation(item: Omit<DonationItem, "id" | "createdAt">): DonationItem {
  const donations = getDonations();
  const newItem: DonationItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  donations.push(newItem);
  saveDonations(donations);
  return newItem;
}

export function getExpiringItems(withinDays: number = 3): FoodItem[] {
  const items = getFoodItems();
  const now = new Date();
  return items.filter((item) => {
    const expiry = new Date(item.expiryDate);
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= withinDays && diffDays >= 0;
  });
}

export function getExpiredItems(): FoodItem[] {
  const items = getFoodItems();
  const now = new Date();
  return items.filter((item) => new Date(item.expiryDate) < now);
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: string): "fresh" | "warning" | "urgent" | "expired" {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 1) return "urgent";
  if (days <= 3) return "warning";
  return "fresh";
}
