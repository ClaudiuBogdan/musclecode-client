import { motion, AnimatePresence } from "framer-motion";
import { Check, Link, Settings, Share, Users, X, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useShareSettings,
  useUpdateShareSettings,
  useUpdateUserAccess,
  useRemoveUserAccess,
} from "@/hooks/useSharing";
import { useAuthStore } from "@/stores/auth";

interface ShareDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  resourceType?: string;
  resourceId?: string;
}

const accessLevelOptions = [
  { value: "view", label: "Can View", description: "Can view content" },
  { value: "edit", label: "Can Edit", description: "Can view and edit content" },
  { value: "admin", label: "Full Access", description: "Can view, edit, and manage sharing" },
];

export function ShareDialog({
  trigger,
  title = "Learning Modules",
  resourceType = "modules",
  resourceId = "main"
}: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [openAccessDropdown, setOpenAccessDropdown] = useState<string | null>(null);

  // API hooks
  const { data: shareSettings, isLoading, error } = useShareSettings(resourceType, resourceId);
  const updateSettingsMutation = useUpdateShareSettings(resourceType, resourceId);
  const updateUserAccessMutation = useUpdateUserAccess(resourceType, resourceId);
  const removeUserMutation = useRemoveUserAccess(resourceType, resourceId);
  const { user: currentUser } = useAuthStore();
  const shareLink = window.location.href;

  const handleCopyLink = () => {
    if (shareLink) {
      void navigator.clipboard.writeText(shareLink);
    }
  };

  const handleLinkSharingToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({ linkSharingEnabled: enabled });
  };

  const handleDefaultAccessChange = (newLevel: "view" | "edit") => {
    updateSettingsMutation.mutate({ defaultAccessLevel: newLevel });
  };

  const handleUpdateUserAccess = (userId: string, accessLevel: "view" | "edit" | "admin") => {
    updateUserAccessMutation.mutate({ userId, accessLevel });
    setOpenAccessDropdown(null);
  };

  const handleRemoveUser = (userId: string) => {
    removeUserMutation.mutate(userId);
    setUserToRemove(null);
    setOpenAccessDropdown(null);
  };

  const handleConfirmRemoval = (userId: string) => {
    setUserToRemove(userId);
  };

  const handleCancelRemoval = () => {
    setUserToRemove(null);
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "admin": return "Can Edit";
      case "edit": return "Can Edit";
      case "view": return "Can View";
      default: return "Can View";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2 transition-all">
            <Share className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Share className="h-5 w-5 text-primary" />
            </div>
            Share {title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sharing settings. Please try again.
            </AlertDescription>
          </Alert>
        ) : shareSettings ? (
          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Share Link Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                    <Link className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-medium">Share with link</span>
                    <p className="text-sm text-muted-foreground">
                      Anyone with the link can {shareSettings.defaultAccessLevel === "view" ? "view" : "edit"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={shareSettings.linkSharingEnabled}
                  onCheckedChange={handleLinkSharingToggle}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <AnimatePresence>
                {shareSettings.linkSharingEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={shareLink}
                          readOnly
                          className="text-sm font-mono pr-24 bg-muted/30"
                        />
                        <div className="absolute right-1 top-1 flex gap-1">
                          <CopyButton onCopy={handleCopyLink} className="h-7 w-7 p-0" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/20">
                      <span className="text-sm text-muted-foreground">
                        Default access level for link users
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto gap-2 font-medium p-2"
                            disabled={updateSettingsMutation.isPending}
                          >
                            {accessLevelOptions.find(opt => opt.value === shareSettings.defaultAccessLevel)?.label}
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {accessLevelOptions
                            .filter(option => option.value !== "admin")
                            .map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleDefaultAccessChange(option.value as "view" | "edit")}
                                className="flex items-center justify-between p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                  </div>
                                </div>
                                {shareSettings.defaultAccessLevel === option.value && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <Separator />

            {/* Users with Access Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/5">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="font-medium">People with access</span>
                  <p className="text-sm text-muted-foreground">
                    Manage who can access this resource
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {shareSettings.users.length}
                </Badge>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {shareSettings.users.map((user) => (
                  <div
                    key={user.id}
                    className="group relative flex items-center gap-4 p-3 rounded-lg border hover:shadow-sm transition-all bg-background"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-muted">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">{user.name}</div>
                        {user.accessLevel === "admin" && (
                          <Badge variant="outline" className="text-xs">Owner</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.id === currentUser?.id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                      {user.id === currentUser?.id ? (
                        <Badge
                          variant={"outline"}
                          className="gap-1 font-medium"
                        >
                          {getAccessLevelLabel(user.accessLevel)}
                        </Badge>
                      ) : (
                        <DropdownMenu
                          open={openAccessDropdown === user.id}
                          onOpenChange={(open) => setOpenAccessDropdown(open ? user.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-auto p-0 hover:bg-transparent"
                              disabled={updateUserAccessMutation.isPending || removeUserMutation.isPending}
                            >
                              <Badge
                                variant={"outline"}
                                className="gap-1 font-medium cursor-pointer hover:bg-opacity-80 transition-all"
                              >
                                {getAccessLevelLabel(user.accessLevel)}
                                <ChevronDown className="h-3 w-3" />
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
                            {accessLevelOptions
                              .filter(option => option.value !== "admin")
                              .map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() => handleUpdateUserAccess(user.id, option.value as "view" | "edit")}
                                  className="flex items-center justify-between p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <div className="font-medium">{option.label}</div>
                                      <div className="text-xs text-muted-foreground">{option.description}</div>
                                    </div>
                                  </div>
                                  {user.accessLevel === option.value && (
                                    <Check className="h-4 w-4 text-green-600" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleConfirmRemoval(user.id)}
                              className="text-destructive focus:text-destructive p-3"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Removal confirmation dialog */}
                    <AnimatePresence>
                      {userToRemove === user.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg border-2 border-destructive/20 flex items-center justify-center z-10"
                        >
                          <div className="bg-background rounded-md border shadow-lg p-4 max-w-sm mx-4">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">Remove access?</div>
                                <div className="text-xs text-muted-foreground">
                                  {user.name} will no longer be able to access this {resourceType.slice(0, -1)}.
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                  disabled={removeUserMutation.isPending}
                                  className="flex-1"
                                >
                                  {removeUserMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : null}
                                  Remove
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelRemoval}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : null
        }
      </DialogContent >
    </Dialog >
  );
} 