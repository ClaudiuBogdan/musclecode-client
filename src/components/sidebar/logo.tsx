import { FC } from "react";
import { Dumbbell } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { Link } from "@tanstack/react-router";

const Logo: FC = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuButton size="lg">
            <Link href="/" className="flex gap-2 m-auto">
              <Dumbbell className="h-6 w-6 text-green-500" />
              <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
                Muscle Code
              </span>
            </Link>
          </SidebarMenuButton>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default Logo;
