import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/types/api";
import {
  updatePassword,
  fetchTwoFactorStatus,
  enableTwoFactor,
  disableTwoFactor,
} from "@/lib/api/security";

export const Route = createLazyFileRoute("/settings/security")({
  component: SecuritySettings,
});

function SecuritySettings() {
  const queryClient = useQueryClient();

  // Fetch 2FA status
  const { data: twoFactorStatus, isLoading } = useQuery({
    queryKey: ["2fa-status"],
    queryFn: fetchTwoFactorStatus,
  });

  // Password update mutation
  const { mutate: handleUpdatePassword, isPending: isUpdatingPassword } =
    useMutation({
      mutationFn: updatePassword,
      onSuccess: () => {
        toast.success("Password updated successfully");
        // Reset form
        const form = document.querySelector("form");
        if (form) form.reset();
      },
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update password");
        }
      },
    });

  // 2FA mutations
  const { mutate: handleEnable2FA, isPending: isEnabling2FA } = useMutation({
    mutationFn: enableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(["2fa-status"], data);
      toast.success("Two-factor authentication enabled");
    },
    onError: () => {
      toast.error("Failed to enable two-factor authentication");
    },
  });

  const { mutate: handleDisable2FA, isPending: isDisabling2FA } = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(["2fa-status"], data);
      toast.success("Two-factor authentication disabled");
    },
    onError: () => {
      toast.error("Failed to disable two-factor authentication");
    },
  });

  const handlePasswordUpdate = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get("currentPassword") as string;
      const newPassword = formData.get("newPassword") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      handleUpdatePassword({ currentPassword, newPassword });
    },
    [handleUpdatePassword]
  );

  const isToggling2FA = isEnabling2FA || isDisabling2FA;

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                disabled={isUpdatingPassword}
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isUpdatingPassword}
              />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Protect your account with an authentication app
              </p>
            </div>
            <Switch
              checked={twoFactorStatus?.enabled ?? false}
              onCheckedChange={(checked) =>
                checked ? handleEnable2FA() : handleDisable2FA()
              }
              disabled={isLoading || isToggling2FA}
            />
          </div>

          {twoFactorStatus?.qrCode && (
            <div className="mt-6 rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Setup Instructions</h4>
              <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Install an authenticator app like Google Authenticator</li>
                <li>Scan the QR code below with your authenticator app</li>
                <li>Enter the 6-digit code from your app when signing in</li>
              </ol>
              <div className="mt-4 flex flex-col items-center gap-4">
                <img
                  src={twoFactorStatus.qrCode}
                  alt="QR Code"
                  className="h-48 w-48"
                />
                {twoFactorStatus.secret && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Can't scan the QR code? Enter this code manually:
                    </p>
                    <code className="mt-1 block rounded bg-muted px-2 py-1 font-mono text-sm">
                      {twoFactorStatus.secret}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
