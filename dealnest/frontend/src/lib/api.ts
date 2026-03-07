import { auth } from "@/lib/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface CouponListing {
  id: string;
  brand_name: string;
  description: string | null;
  original_value: number;
  selling_price: number;
  discount_percentage: number | null;
  category: string;
  expiry_date: string | null;
  created_at: string;
  seller_id: string;
  is_sold: boolean;
  is_active: boolean;
}

export interface CreateListingPayload {
  brand_name: string;
  description: string | null;
  coupon_code: string | null;
  original_value: number;
  selling_price: number;
  category: string;
  expiry_date: string | null;
}

export interface UpsertProfilePayload {
  full_name: string;
  phone_number: string;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
}

async function request<T>(path: string, init?: RequestInit, includeAuth = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (includeAuth) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Authentication required");
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  getListings: (params: { category?: string; sellerId?: string; active?: boolean }) => {
    const search = new URLSearchParams();
    if (params.category && params.category !== "All") search.set("category", params.category);
    if (params.sellerId) search.set("sellerId", params.sellerId);
    if (params.active) search.set("active", "true");
    return request<{ data: CouponListing[] }>(`/api/listings?${search.toString()}`, undefined, Boolean(params.sellerId));
  },
  createListing: (payload: CreateListingPayload) =>
    request<{ data: CouponListing }>("/api/listings", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  deleteListing: (id: string) =>
    request<{ success: boolean }>(`/api/listings/${id}`, {
      method: "DELETE",
    }, true),
  upsertProfile: (payload: UpsertProfilePayload) =>
    request<{ data: UserProfile }>("/api/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  getProfile: () =>
    request<{ data: UserProfile }>("/api/profile", undefined, true),
};
