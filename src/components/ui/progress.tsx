import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value: propValue, ...props }, ref) => {
  const [indicatorTransform, setIndicatorTransform] = React.useState("translateX(-100%)");
  const clampedValue = Math.max(0, Math.min(propValue ?? 0, 100));

  React.useEffect(() => {
    setIndicatorTransform(`translateX(-${100 - clampedValue}%)`);
  }, [clampedValue]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: indicatorTransform }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
