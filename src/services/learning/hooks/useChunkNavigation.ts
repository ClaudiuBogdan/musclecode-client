import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const useChunkNavigation = () => {
    const navigate = useNavigate();
    const { chunk: initialChunkIndex } = useSearch({
        from: "/learning/modules/$moduleId/lessons/$lessonId",
        select: (search: Record<string, unknown>) => ({
          chunk: (search.chunk as number) || 0,
        }),
      });

    const [index, setIndex] = useState(initialChunkIndex);
    
    useEffect(() => {
        navigate({
            to: ".",
            search: (prev) => ({ ...prev, chunk: index }),
            replace: true,
        });
    }, [index, navigate]);

    return [index, setIndex] as const;
};