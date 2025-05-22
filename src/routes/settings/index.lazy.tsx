import { Outlet } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createLazyFileRoute("/settings/")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <Outlet />
    </div>
  );
}
