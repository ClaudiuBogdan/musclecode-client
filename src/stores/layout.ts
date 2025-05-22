import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "LayoutStore" });

interface LayoutState {
  sizes: [number, number];
  editorSizes: [number, number];
  sidebarState: {
    open: boolean;
    openMobile: boolean;
  };
  setSizes: (sizes: [number, number]) => void;
  setEditorSizes: (sizes: [number, number]) => void;
  setSidebarState: (state: { open?: boolean; openMobile?: boolean }) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sizes: [40, 60],
      editorSizes: [70, 30],
      sidebarState: {
        open: true,
        openMobile: false,
      },
      setSizes: (sizes: [number, number]) => {
        if (Math.abs(sizes[0] + sizes[1] - 100) > 1) {
          logger.error("Invalid Layout Sizes", {
            sizes,
            sum: sizes[0] + sizes[1],
            expectedSum: 100,
          });
          return;
        }
        set({ sizes });
      },
      setEditorSizes: (sizes: [number, number]) => {
        if (Math.abs(sizes[0] + sizes[1] - 100) > 1) {
          logger.error("Invalid Editor Sizes", {
            sizes,
            sum: sizes[0] + sizes[1],
            expectedSum: 100,
          });
          return;
        }
        set({ editorSizes: sizes });
      },
      setSidebarState: (state) =>
        set((prev) => ({
          sidebarState: { ...prev.sidebarState, ...state },
        })),
    }),
    {
      name: "layout-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
