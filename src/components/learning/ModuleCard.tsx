import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpenIcon, CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentStatus } from "@/services/content/api";

import type { ModuleEntity } from "@/services/content/api";


interface ModuleCardProps {
  module: ModuleEntity;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const navigate = useNavigate();
  const lessons = module.body?.lessons as { id: string }[];
  const lessonCount = lessons.length;

  // Access body properties safely with optional chaining and defaults
  const title = module.body?.title as string || "Untitled Module";
  const description = module.body?.description as string || "No description available";

  const navigateToModule = () => {
    void navigate({ to: "/learning/modules/$moduleId", params: { moduleId: module.id } });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow"
        onClick={navigateToModule}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle>{title}</CardTitle>
            <Badge variant={module.status === ContentStatus.CREATED ? "default" : "outline"}>
              {module.status === ContentStatus.CREATED ? "Published" : "Draft"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpenIcon className="h-4 w-4" />
              <span>{lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}</span>
            </div>
          </div>
          <Button
            variant="default"
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation();
              navigateToModule();
            }}
          >
            <CheckIcon className="mr-2 h-4 w-4" /> Start Learning
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 