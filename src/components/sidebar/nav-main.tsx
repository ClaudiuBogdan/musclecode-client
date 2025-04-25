"use client";

import {
  Settings,
  CreditCard,
  User,
  LayoutDashboard,
  Code2,
  Library,
  BookOpen,
} from "lucide-react";
import { Link, useMatches } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface SettingsItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Algorithms",
    url: "/algorithms",
    icon: Code2,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Library,
  },
  {
    title: "Learning",
    url: "/learning",
    icon: BookOpen,
  },
];

const settingsItems = {
  title: "Settings",
  icon: Settings,
  subItems: [
    {
      title: "Profile",
      url: "/settings/profile",
      icon: User,
    },
    {
      title: "Billing",
      url: "/settings/billing",
      icon: CreditCard,
    },
    // TODO: Add notifications
    // {
    //   title: "Notifications",
    //   url: "/settings/notifications",
    //   icon: Bell,
    // },
    // {
    //   title: "Security",
    //   url: "/settings/security",
    //   icon: Shield,
    // },
    // {
    //   title: "Preferences",
    //   url: "/settings/preferences",
    //   icon: Settings,
    // },
  ] as SettingsItem[],
};

export function NavMain() {
  const matches = useMatches();
  const currentPath =
    matches.length > 0 ? matches[matches.length - 1].pathname : "/";
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Platform</SidebarGroupLabel>}
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start gap-2",
                      isActive(item.url) && "bg-muted font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>

      <div className="border-t py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Settings</SidebarGroupLabel>}
          <SidebarMenu>
            {settingsItems.subItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start gap-2",
                      isActive(item.url) && "bg-muted font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>
    </div>
  );
}
