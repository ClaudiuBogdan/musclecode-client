import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2, Monitor } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  fetchPreferences,
  updatePreferences,
  type Preferences,
} from "@/lib/api/preferences";
import { ApiError } from "@/types/api";

export const Route = createLazyFileRoute("/settings/preferences")({
  component: PreferencesSettings,
});

function PreferencesSettings() {
  const queryClient = useQueryClient();

  // Fetch preferences
  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  });

  // Update preferences mutation
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["preferences"], data);
      toast.success("Preferences updated");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update preferences");
      }
    },
  });

  const handleChange = useCallback(
    (setting: keyof Preferences, value: Preferences[keyof Preferences]) => {
      if (!preferences) return;
      updateSettings({ [setting]: value });
    },
    [preferences, updateSettings]
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading preferences...</span>
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
              : "Failed to load preferences"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={preferences?.theme}
                onValueChange={(value) =>
                  handleChange("theme", value as Preferences["theme"])
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Daily Algorithms ({preferences?.dailyAlgorithms})</Label>
              <Slider
                value={[preferences?.dailyAlgorithms ?? 3]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) =>
                  handleChange("dailyAlgorithms", value)
                }
                disabled={isUpdating}
              />
              <p className="text-sm text-muted-foreground">
                Number of algorithms you want to solve each day
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Difficulty</Label>
              <Select
                value={preferences?.difficulty}
                onValueChange={(value) =>
                  handleChange("difficulty", value as Preferences["difficulty"])
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="all">All Levels</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Default difficulty level for new algorithms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
