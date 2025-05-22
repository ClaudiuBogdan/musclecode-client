import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2, Mail, Bell } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "@/lib/api/notifications";
import { ApiError } from "@/types/api";

export const Route = createLazyFileRoute("/settings/notifications")({
  component: NotificationSettings,
});

function NotificationSettings() {
  const queryClient = useQueryClient();

  // Fetch notification settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notificationSettings"],
    queryFn: fetchNotificationSettings,
  });

  // Update notification settings mutation
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["notificationSettings"], data);
      toast.success("Notification settings updated");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update notification settings");
      }
    },
  });

  const handleToggle = useCallback(
    (category: keyof NotificationSettings, setting: string, value: boolean) => {
      if (!settings) return;

      updateSettings({
        [category]: {
          ...settings[category],
          [setting]: value,
        },
      });
    },
    [settings, updateSettings]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading notification settings...</span>
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
              : "Failed to load notification settings"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-8">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what updates you want to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="marketing" className="flex flex-col space-y-1">
              <span>Marketing emails</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive emails about new features and improvements
              </span>
            </Label>
            <Switch
              id="marketing"
              checked={settings?.email.marketing}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("email", "marketing", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="security" className="flex flex-col space-y-1">
              <span>Security updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified about security updates and login attempts
              </span>
            </Label>
            <Switch
              id="security"
              checked={settings?.email.security}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("email", "security", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="updates" className="flex flex-col space-y-1">
              <span>Product updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified when we release updates to your algorithms
              </span>
            </Label>
            <Switch
              id="updates"
              checked={settings?.email.updates}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("email", "updates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="weeklyReport" className="flex flex-col space-y-1">
              <span>Weekly summary</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive a weekly report of your algorithm performance and
                activity
              </span>
            </Label>
            <Switch
              id="weeklyReport"
              checked={settings?.email.weeklyReport}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("email", "weeklyReport", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure your browser push notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="newAlgorithm" className="flex flex-col space-y-1">
              <span>New algorithms</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified when new algorithms are available
              </span>
            </Label>
            <Switch
              id="newAlgorithm"
              checked={settings?.push.newAlgorithm}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("push", "newAlgorithm", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="algorithmUpdates"
              className="flex flex-col space-y-1"
            >
              <span>Algorithm updates</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications about algorithm performance and updates
              </span>
            </Label>
            <Switch
              id="algorithmUpdates"
              checked={settings?.push.algorithmUpdates}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("push", "algorithmUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dailyProgress" className="flex flex-col space-y-1">
              <span>Daily progress</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get a daily summary of your algorithm performance and
                achievements
              </span>
            </Label>
            <Switch
              id="dailyProgress"
              checked={settings?.push.dailyProgress}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleToggle("push", "dailyProgress", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
