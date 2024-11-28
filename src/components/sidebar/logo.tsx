import { FC } from "react";
import { Dumbbell } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { Link } from "@tanstack/react-router";

const Logo: FC = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Collapsible asChild defaultOpen={true} className="group/collapsible">
            <SidebarMenuButton size={"lg"}>
              <Link href="/" className="flex gap-2 m-auto">
                <Dumbbell className="h-6 w-6 text-green-500" />
                <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
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
