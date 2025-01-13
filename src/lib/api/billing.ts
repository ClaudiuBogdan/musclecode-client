import { z } from "zod";
import { apiClient } from "./client";
import { ApiError } from "@/types/api";

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  interval: z.enum(["month", "year"]),
  features: z.array(z.string()),
  isCurrent: z.boolean(),
});

export const subscriptionSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["active", "canceled", "past_due", "inactive"]),
  currentPeriodEnd: z.string().optional(),
  plan: planSchema.optional(),
  cancelAtPeriodEnd: z.boolean(),
});

export const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(["card"]),
  card: z.object({
    brand: z.string(),
    last4: z.string(),
    expiryMonth: z.number(),
    expiryYear: z.number(),
  }),
  isDefault: z.boolean(),
});

export const billingSchema = z.object({
  subscription: subscriptionSchema,
  paymentMethods: z.array(paymentMethodSchema),
});

export type Plan = z.infer<typeof planSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type BillingInfo = z.infer<typeof billingSchema>;

// Mock data for development
const mockSubscribedState: BillingInfo = {
  subscription: {
    id: "sub_123",
    status: "active",
    currentPeriodEnd: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(), // 30 days from now
    plan: {
      id: "pro_monthly",
      name: "Pro Plan",
      price: 29,
      interval: "month",
      features: [
        "All algorithms included",
        "Priority support",
        "Advanced analytics",
        "Team collaboration",
      ],
      isCurrent: true,
    },
    cancelAtPeriodEnd: false,
  },
  paymentMethods: [
    {
      id: "pm_123",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2024,
      },
      isDefault: true,
    },
  ],
};

const mockUnsubscribedState: BillingInfo = {
  subscription: {
    status: "inactive",
    cancelAtPeriodEnd: false,
    plan: {
      id: "free",
      name: "Free Plan",
      price: 0,
      interval: "month",
      features: [
        "Basic algorithms included",
        "Community support",
        "Basic analytics",
        "Single user only",
      ],
      isCurrent: true,
    },
  },
  paymentMethods: [],
};

// Toggle this to switch between subscribed and unsubscribed states
const USE_SUBSCRIBED_STATE = false;

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid billing data", 422, error.issues);
  }
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError(
    "An unexpected error occurred",
    500,
    error instanceof Error ? error.message : String(error)
  );
};

export async function fetchBillingInfo(): Promise<BillingInfo> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500); // Simulate network delay
      return USE_SUBSCRIBED_STATE ? mockSubscribedState : mockUnsubscribedState;
    }

    const { data } = await apiClient.get<BillingInfo>("/api/billing");
    return billingSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function redirectToCustomerPortal(): Promise<{ url: string }> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(500); // Simulate network delay
      return { url: "https://billing.stripe.com/p/session/test_123" };
    }

    const { data } = await apiClient.post<{ url: string }>(
      "/api/billing/portal"
    );
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function cancelSubscription(): Promise<BillingInfo> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(800); // Simulate network delay
      return {
        ...mockSubscribedState,
        subscription: {
          ...mockSubscribedState.subscription,
          cancelAtPeriodEnd: true,
        },
      };
    }

    const { data } = await apiClient.post<BillingInfo>("/api/billing/cancel");
    return billingSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function resumeSubscription(): Promise<BillingInfo> {
  try {
    // TODO: Replace with actual API call when backend is ready
    if (process.env.NODE_ENV === "development") {
      await delay(800); // Simulate network delay
      return {
        ...mockSubscribedState,
        subscription: {
          ...mockSubscribedState.subscription,
          cancelAtPeriodEnd: false,
        },
      };
    }

    const { data } = await apiClient.post<BillingInfo>("/api/billing/resume");
    return billingSchema.parse(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

// Available plans for upgrade
export const availablePlans: Plan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    interval: "month",
    features: [
      "Basic algorithms included",
      "Community support",
      "Basic analytics",
      "Single user only",
    ],
    isCurrent: false,
  },
  {
    id: "pro_monthly",
    name: "Pro Plan",
    price: 29,
    interval: "month",
    features: [
      "All algorithms included",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
    isCurrent: false,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 99,
    interval: "month",
    features: [
      "Custom algorithms",
      "24/7 Premium support",
      "Advanced analytics & reporting",
      "Unlimited team members",
      "Custom integrations",
      "SLA guarantee",
    ],
    isCurrent: false,
  },
];
