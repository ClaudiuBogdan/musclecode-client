import { Collapsible } from "@radix-ui/react-collapsible";
import { Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../ui/sidebar";

import type { FC } from "react";



const Logo: FC = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 p-0 ml-1">
          <Collapsible asChild defaultOpen={true} className="group/collapsible">
            <SidebarMenuButton size={"lg"} className="p-0">
              <Link to="/" className="flex justify-start gap-2">
                <Dumbbell className="h-6 w-6 text-black dark:text-white" />
                <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden whitespace-nowrap">
                  Muscle Code
                </span>
              </Link>
            </SidebarMenuButton>
          </Collapsible>
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default Logo;
