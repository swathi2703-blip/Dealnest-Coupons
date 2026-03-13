import { auth } from "@/lib/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface CouponListing {
  id: string;
  brand_name: string;
  description: string | null;
  coupon_code?: string | null;
  original_value: number;
  selling_price: number;
  discount_percentage: number | null;
  category: string;
  expiry_date: string | null;
  website_link: string | null;
  payout_method: "UPI" | "BANK";
  account_holder_name: string;
  payout_upi_id: string | null;
  payout_bank_name: string | null;
  payout_bank_account_number: string | null;
  payout_bank_ifsc: string | null;
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
  website_link: string;
  payout_method: "UPI" | "BANK";
  account_holder_name: string;
  payout_upi_id: string | null;
  payout_bank_name: string | null;
  payout_bank_account_number: string | null;
  payout_bank_ifsc: string | null;
}

export interface TransactionRecord {
  id: string;
  transaction_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  payment_reference: string | null;
  status: "PENDING" | "SUCCESS" | "CANCELLED";
  platform_fee_amount?: number;
  seller_payout_amount?: number;
  seller_payout_status?: string | null;
  seller_payout_reference?: string | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
  reveal_expires_at: string | null;
}

export interface PublicWebsiteStats {
  savings_generated: number;
  active_listings: number;
  happy_users: number;
}

export interface InitiateTransactionResponse {
  data: TransactionRecord;
  form_url: string;
  qr_url: string;
  listing: CouponListing;
}

export interface ConfirmTransactionResponse {
  data: TransactionRecord;
  reveal_link: string;
  reveal_expires_at: string;
  email_sent: boolean;
}

export interface RevealCouponResponse {
  coupon_code: string | null;
  website_link: string | null;
  reveal_expires_at: string;
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

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  razorpay_key: string;
}

export interface PaymentVerificationPayload {
  order_id: string;
  payment_id: string;
  signature: string;
  listing_id: string;
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
    const error = new Error(body.error || "Request failed") as Error & { status?: number };
    error.status = response.status;
    throw error;
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
  getListingById: async (id: string) => {
    try {
      return await request<{ data: CouponListing }>(`/api/listings/${id}`);
    } catch (error: any) {
      // Backward compatibility for servers that only expose DELETE /api/listings/{id}
      // and do not support GET by id.
      if (error?.status === 405) {
        const listingsResponse = await request<{ data: CouponListing[] }>("/api/listings");
        const listing = listingsResponse.data.find((item) => item.id === id);
        if (listing) {
          return { data: listing };
        }
      }
      throw error;
    }
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
  initiateTransaction: (listingId: string) =>
    request<InitiateTransactionResponse>("/api/transactions/initiate", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId }),
    }, true),
  confirmTransaction: (payload: { transaction_id: string; payment_transaction_id: string; email: string; roll_number: string }) =>
    request<ConfirmTransactionResponse>("/api/transactions/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  revealCoupon: (token: string) =>
    request<RevealCouponResponse>(`/api/transactions/reveal?token=${encodeURIComponent(token)}`, undefined, true),
  createPaymentOrder: (listingId: string) =>
    request<PaymentOrder>("/api/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId }),
    }, true),
  verifyPayment: (payload: PaymentVerificationPayload) =>
    request<{ success: boolean; transaction_id: string; message: string }>("/api/payments/verify-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  getPublicWebsiteStats: () =>
    request<{ data: PublicWebsiteStats }>("/api/public/stats"),
};
