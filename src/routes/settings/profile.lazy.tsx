import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchProfile,
  updateProfile,
  connectProvider,
  disconnectProvider,
  profileSchema,
  type Profile,
} from "@/lib/api/profile";
import { ApiError } from "@/types/api";

export const Route = createLazyFileRoute("/settings/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Profile>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch profile data
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  }) as UseQueryResult<Profile, Error>;

  // Reset form when profile data changes
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  // Update profile mutation
  const { mutate: updateProfileMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    },
  });

  // Provider connection mutations
  const { mutate: connectProviderMutation, isPending: isConnecting } =
    useMutation({
      mutationFn: connectProvider,
      onSuccess: (data) => {
        queryClient.setQueryData(["profile"], data);
        toast.success("Provider connected successfully");
      },
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to connect provider");
        }
      },
    });

  const { mutate: disconnectProviderMutation, isPending: isDisconnecting } =
    useMutation({
      mutationFn: disconnectProvider,
      onSuccess: (data) => {
        queryClient.setQueryData(["profile"], data);
        toast.success("Provider disconnected successfully");
      },
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to disconnect provider");
        }
      },
    });

  const onSubmit = useCallback(
    (data: Profile) => {
      updateProfileMutation(data);
    },
    [updateProfileMutation]
  );

  const handleProviderConnection = useCallback(
    (provider: "github" | "google") => {
      if (profile?.connections[provider]) {
        disconnectProviderMutation(provider);
      } else {
        connectProviderMutation(provider);
      }
    },
    [profile?.connections, connectProviderMutation, disconnectProviderMutation]
  );

  // Handle loading state
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {profileError instanceof ApiError
              ? profileError.message
              : "Failed to load profile"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Profile Header */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profile?.avatar} alt={profile?.name} />
              <AvatarFallback className="text-2xl">
                {profile?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl sm:text-3xl">
                {profile?.name}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {profile?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and how others see you on the
            platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  rows={3}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected accounts and identity providers
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* GitHub Connection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">
                {profile?.connections.github
                  ? "Your GitHub account is connected"
                  : "Connect your GitHub account to sync your profile"}
              </p>
            </div>
            <Button
              variant={profile?.connections.github ? "destructive" : "outline"}
              className="sm:w-auto w-full"
              onClick={() => handleProviderConnection("github")}
              disabled={isConnecting || isDisconnecting}
            >
              {isConnecting || isDisconnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {profile?.connections.github ? "Disconnect" : "Connect"}
            </Button>
          </div>

          <Separator />

          {/* Google Connection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">Google</p>
              <p className="text-sm text-muted-foreground">
                {profile?.connections.google
                  ? "Your Google account is connected"
                  : "Use your Google account for quick sign-in"}
              </p>
            </div>
            <Button
              variant={profile?.connections.google ? "destructive" : "outline"}
              className="sm:w-auto w-full"
              onClick={() => handleProviderConnection("google")}
              disabled={isConnecting || isDisconnecting}
            >
              {isConnecting || isDisconnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {profile?.connections.google ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
