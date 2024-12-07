import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";
import React from "react";
import { GripVerticalIcon } from "lucide-react";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.Panel
    ref={ref}
    className={cn("min-w-[200px] min-h-[200px]", className)}
    {...props}
  />
));
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "group/handle relative flex items-center justify-center",
      // Base styles
      "w-[1px] bg-border transition-all z-10",
      "data-[panel-group-direction=vertical]:h-[1px] data-[panel-group-direction=vertical]:w-full",
      // Hover effect area
      "after:absolute after:inset-0 after:w-1 after:-translate-x-1/2 after:bg-blue-500/20",
      "hover:after:bg-blue-500/50",
      "data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      // Focus styles
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-4 items-center justify-center rounded-sm bg-accent/50 opacity-0 group-hover/handle:opacity-100 transition-opacity">
        <GripVerticalIcon className="h-2.5 w-2.5 text-accent-foreground" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
