import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/settings/billing")({
  component: BillingSettings,
});

function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">$29/month</p>
              </div>
              <Button variant="outline">Change Plan</Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Your next billing date is August 1, 2024
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods and billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">•••• •••• •••• 4242</h3>
                <p className="text-sm text-muted-foreground">Expires 12/2024</p>
              </div>
              <Button variant="outline">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
