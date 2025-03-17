import { FC, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Info,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Flame,
  Bug,
  Quote,
  Bookmark,
  Zap,
  ShieldQuestion,
  ChevronDown,
  CloudLightning,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced callout types with Obsidian-inspired design
const CALLOUT_TYPES = {
  note: { icon: Lightbulb, color: "blue" },
  info: { icon: Info, color: "sky" },
  tip: { icon: Flame, color: "emerald" },
  success: { icon: CheckCircle, color: "green" },
  question: { icon: HelpCircle, color: "purple" },
  warning: { icon: AlertTriangle, color: "amber" },
  danger: { icon: CloudLightning, color: "rose" },
  bug: { icon: Bug, color: "red" },
  quote: { icon: Quote, color: "slate" },
  important: { icon: Zap, color: "violet" },
  bookmark: { icon: Bookmark, color: "pink" },
  faq: { icon: ShieldQuestion, color: "amber" },
} as const;

interface CalloutProps {
  type: string;
  title?: string;
  foldable?: boolean;
  expanded?: boolean;
  children: ReactNode;
  iconSize?: number;
}

const Callout: FC<CalloutProps> = ({
  type = "note",
  title,
  foldable = false,
  expanded = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(foldable ? expanded : true);
  const parsedType = type.trim().toLowerCase() as keyof typeof CALLOUT_TYPES;
  const calloutConfig = CALLOUT_TYPES[parsedType] || CALLOUT_TYPES.note;
  const Icon = calloutConfig.icon;

  return (
    <div
      className={cn(
        "my-4 rounded-xl p-4 backdrop-blur-sm",
        "border-2 bg-opacity-30 dark:bg-opacity-20",
        // Light mode colors
        {
          "border-blue-100 bg-blue-50/30": calloutConfig.color === "blue",
          "border-sky-100 bg-sky-50/30": calloutConfig.color === "sky",
          "border-emerald-100 bg-emerald-50/30":
            calloutConfig.color === "emerald",
          "border-green-100 bg-green-50/30": calloutConfig.color === "green",
          "border-purple-100 bg-purple-50/30": calloutConfig.color === "purple",
          "border-amber-100 bg-amber-50/30": calloutConfig.color === "amber",
          "border-rose-100 bg-rose-50/30": calloutConfig.color === "rose",
          "border-red-100 bg-red-50/30": calloutConfig.color === "red",
          "border-slate-100 bg-slate-50/30": calloutConfig.color === "slate",
          "border-violet-100 bg-violet-50/30": calloutConfig.color === "violet",
          "border-pink-100 bg-pink-50/30": calloutConfig.color === "pink",
        },
        // Dark mode colors
        {
          "dark:border-blue-800/30 dark:bg-blue-900/20":
            calloutConfig.color === "blue",
          "dark:border-sky-800/30 dark:bg-sky-900/20":
            calloutConfig.color === "sky",
          "dark:border-emerald-800/30 dark:bg-emerald-900/20":
            calloutConfig.color === "emerald",
          "dark:border-green-800/30 dark:bg-green-900/20":
            calloutConfig.color === "green",
          "dark:border-purple-800/30 dark:bg-purple-900/20":
            calloutConfig.color === "purple",
          "dark:border-amber-800/30 dark:bg-amber-900/20":
            calloutConfig.color === "amber",
          "dark:border-rose-800/30 dark:bg-rose-900/20":
            calloutConfig.color === "rose",
          "dark:border-red-800/30 dark:bg-red-900/20":
            calloutConfig.color === "red",
          "dark:border-slate-800/30 dark:bg-slate-800/20":
            calloutConfig.color === "slate",
          "dark:border-violet-800/30 dark:bg-violet-900/20":
            calloutConfig.color === "violet",
          "dark:border-pink-800/30 dark:bg-pink-900/20":
            calloutConfig.color === "pink",
        }
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div
            className={cn("flex items-center gap-2", {
              "cursor-pointer": foldable,
            })}
            onClick={() => foldable && setIsExpanded(!isExpanded)}
          >
            <div
              className={cn(
                "shrink-0 rounded-lg backdrop-blur-sm",
                "bg-white/50 dark:bg-black/30",
                // Icon container colors
                {
                  "text-blue-600": calloutConfig.color === "blue",
                  "text-sky-600": calloutConfig.color === "sky",
                  "text-emerald-600": calloutConfig.color === "emerald",
                  "text-green-600": calloutConfig.color === "green",
                  "text-purple-600": calloutConfig.color === "purple",
                  "text-amber-600": calloutConfig.color === "amber",
                  "text-rose-600": calloutConfig.color === "rose",
                  "text-red-600": calloutConfig.color === "red",
                  "text-slate-600": calloutConfig.color === "slate",
                  "text-violet-600": calloutConfig.color === "violet",
                  "text-pink-600": calloutConfig.color === "pink",
                },
                {
                  "dark:text-blue-400": calloutConfig.color === "blue",
                  "dark:text-sky-400": calloutConfig.color === "sky",
                  "dark:text-emerald-400": calloutConfig.color === "emerald",
                  "dark:text-green-400": calloutConfig.color === "green",
                  "dark:text-purple-400": calloutConfig.color === "purple",
                  "dark:text-amber-400": calloutConfig.color === "amber",
                  "dark:text-rose-400": calloutConfig.color === "rose",
                  "dark:text-red-400": calloutConfig.color === "red",
                  "dark:text-slate-300": calloutConfig.color === "slate",
                  "dark:text-violet-400": calloutConfig.color === "violet",
                  "dark:text-pink-400": calloutConfig.color === "pink",
                }
              )}
            >
              <Icon className={`h-4 w-4`} />
            </div>
            {title && (
              <div
                className={cn(
                  "text-base font-semibold tracking-tight flex items-center gap-2",
                  // Title text colors (matches icon)
                  {
                    "text-blue-600": calloutConfig.color === "blue",
                    "text-sky-600": calloutConfig.color === "sky",
                    "text-emerald-600": calloutConfig.color === "emerald",
                    "text-green-600": calloutConfig.color === "green",
                    "text-purple-600": calloutConfig.color === "purple",
                    "text-amber-600": calloutConfig.color === "amber",
                    "text-rose-600": calloutConfig.color === "rose",
                    "text-red-600": calloutConfig.color === "red",
                    "text-slate-600": calloutConfig.color === "slate",
                    "text-violet-600": calloutConfig.color === "violet",
                    "text-pink-600": calloutConfig.color === "pink",
                  },
                  {
                    "dark:text-blue-400": calloutConfig.color === "blue",
                    "dark:text-sky-400": calloutConfig.color === "sky",
                    "dark:text-emerald-400": calloutConfig.color === "emerald",
                    "dark:text-green-400": calloutConfig.color === "green",
                    "dark:text-purple-400": calloutConfig.color === "purple",
                    "dark:text-amber-400": calloutConfig.color === "amber",
                    "dark:text-rose-400": calloutConfig.color === "rose",
                    "dark:text-red-400": calloutConfig.color === "red",
                    "dark:text-slate-300": calloutConfig.color === "slate",
                    "dark:text-violet-400": calloutConfig.color === "violet",
                    "dark:text-pink-400": calloutConfig.color === "pink",
                  }
                )}
              >
                {title}
                {foldable && (
                  <motion.div
                    initial={false}
                    animate={{ rotate: isExpanded ? 360 : 270 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 font-bold stroke-[3]",
                        {
                          "text-blue-600": calloutConfig.color === "blue",
                          "text-sky-600": calloutConfig.color === "sky",
                          "text-emerald-600": calloutConfig.color === "emerald",
                          "text-green-600": calloutConfig.color === "green",
                          "text-purple-600": calloutConfig.color === "purple",
                          "text-amber-600": calloutConfig.color === "amber",
                          "text-rose-600": calloutConfig.color === "rose",
                          "text-red-600": calloutConfig.color === "red",
                          "text-slate-600": calloutConfig.color === "slate",
                          "text-violet-600": calloutConfig.color === "violet",
                          "text-pink-600": calloutConfig.color === "pink",
                        },
                        {
                          "dark:text-blue-400": calloutConfig.color === "blue",
                          "dark:text-sky-400": calloutConfig.color === "sky",
                          "dark:text-emerald-400":
                            calloutConfig.color === "emerald",
                          "dark:text-green-400":
                            calloutConfig.color === "green",
                          "dark:text-purple-400":
                            calloutConfig.color === "purple",
                          "dark:text-amber-400":
                            calloutConfig.color === "amber",
                          "dark:text-rose-400": calloutConfig.color === "rose",
                          "dark:text-red-400": calloutConfig.color === "red",
                          "dark:text-slate-300":
                            calloutConfig.color === "slate",
                          "dark:text-violet-400":
                            calloutConfig.color === "violet",
                          "dark:text-pink-400": calloutConfig.color === "pink",
                        }
                      )}
                    />
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {(!foldable || isExpanded) && (
              <motion.div
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { height: "auto" },
                  collapsed: { height: 0 },
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="text-muted-foreground [&>:first-child]:mt-2 [&>:last-child]:mb-0 w-full">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Callout;
