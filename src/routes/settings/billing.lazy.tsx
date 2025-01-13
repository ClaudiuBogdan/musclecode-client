import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertCircle, CreditCard, Loader2, Receipt, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchBillingInfo,
  redirectToCustomerPortal,
  cancelSubscription,
  resumeSubscription,
  availablePlans,
  type BillingInfo,
  type Plan,
} from "@/lib/api/billing";
import { ApiError } from "@/types/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/settings/billing")({
  component: BillingSettings,
});

function BillingSettings() {
  const queryClient = useQueryClient();

  // Fetch billing data
  const {
    data: billing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["billing"],
    queryFn: fetchBillingInfo,
  }) as UseQueryResult<BillingInfo, Error>;

  // Stripe portal redirect mutation
  const { mutate: redirectToPortal, isPending: isRedirecting } = useMutation({
    mutationFn: redirectToCustomerPortal,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to redirect to billing portal");
      }
    },
  });

  // Cancel subscription mutation
  const { mutate: cancelSubscriptionMutation, isPending: isCanceling } =
    useMutation({
      mutationFn: cancelSubscription,
      onSuccess: (data) => {
        queryClient.setQueryData(["billing"], data);
        toast.success("Your subscription has been canceled");
      },
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to cancel subscription");
        }
      },
    });

  // Resume subscription mutation
  const { mutate: resumeSubscriptionMutation, isPending: isResuming } =
    useMutation({
      mutationFn: resumeSubscription,
      onSuccess: (data) => {
        queryClient.setQueryData(["billing"], data);
        toast.success("Your subscription has been resumed");
      },
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to resume subscription");
        }
      },
    });

  const handleManageSubscription = useCallback(() => {
    redirectToPortal();
  }, [redirectToPortal]);

  const handleCancelSubscription = useCallback(() => {
    cancelSubscriptionMutation();
  }, [cancelSubscriptionMutation]);

  const handleResumeSubscription = useCallback(() => {
    resumeSubscriptionMutation();
  }, [resumeSubscriptionMutation]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading billing information...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof ApiError
              ? error.message
              : "Failed to load billing information"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isSubscriptionActive = billing?.subscription.status === "active";
  const willCancel = billing?.subscription.cancelAtPeriodEnd;
  const periodEnd = billing?.subscription.currentPeriodEnd
    ? format(new Date(billing.subscription.currentPeriodEnd), "MMMM d, yyyy")
    : null;
  const currentPlanId = billing?.subscription.plan?.id;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pt-8">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isSubscriptionActive
              ? willCancel
                ? "Your subscription will end on"
                : "Your subscription will renew on"
              : "Choose the plan that's right for you"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Plan Status */}
          {isSubscriptionActive && (
            <div className="mb-8 pb-6 border-b">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium text-lg">
                    {billing?.subscription.plan?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${billing?.subscription.plan?.price}/
                    {billing?.subscription.plan?.interval}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {willCancel ? (
                    <Button
                      variant="default"
                      onClick={handleResumeSubscription}
                      disabled={isResuming}
                    >
                      {isResuming && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Resume Subscription
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                    >
                      {isCanceling && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>

              {periodEnd && (
                <p className="text-sm text-muted-foreground mt-4">
                  {willCancel ? "Access until" : "Next billing date"}:{" "}
                  {periodEnd}
                </p>
              )}
            </div>
          )}

          {/* Available Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlanId;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-lg border p-6",
                    isCurrentPlan && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="font-medium text-lg flex items-center justify-between">
                          {plan.name}
                          {isCurrentPlan && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Current Plan
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ${plan.price}/{plan.interval}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isCurrentPlan && (
                      <div className="pt-6">
                        <Button
                          className="w-full"
                          variant={plan.price > 0 ? "default" : "outline"}
                          onClick={handleManageSubscription}
                          disabled={isRedirecting}
                        >
                          {isRedirecting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {(() => {
                            const currentPlanPrice =
                              billing?.subscription.plan?.price ?? 0;
                            if (plan.price === currentPlanPrice)
                              return "Current Plan";
                            if (plan.price > currentPlanPrice) return "Upgrade";
                            return "Downgrade";
                          })()}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method - Only show if user has payment methods */}
      {billing?.paymentMethods?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billing.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">
                        {method.card.brand} •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card.expiryMonth}/
                        {method.card.expiryYear}
                      </p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
              ))}

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                >
                  {isRedirecting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Receipt className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
