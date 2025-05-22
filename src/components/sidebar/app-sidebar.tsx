import { useLocation } from "@tanstack/react-router";
import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";

import Logo from "./logo";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { user } = useAuthStore();

  // Hide sidebar on onboarding pages
  if (location.pathname.includes("/onboarding")) {
    return null;
  }

  // Map auth user to the format expected by NavUser
  const navUser = user
    ? {
        name: user.username,
        email: user.username,
        avatar: `/avatars/${user.id}.jpg`,
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex flex-1 flex-col">
        <div className="flex-1">
          <NavMain />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="group-data-[state=collapsed]:visible invisible">
          <SidebarTrigger />
        </div>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
