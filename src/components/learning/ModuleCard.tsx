import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, BookIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentStatus, ModuleEntity } from "@/services/content/api";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface ModuleCardProps {
  module: ModuleEntity;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const navigate = useNavigate();
  const lessonCount = module.lessons?.length || 0;
  const exerciseCount = (module.exercises?.length || 0) + 
    (module.lessons?.reduce((acc, lesson) => acc + (lesson.exercises?.length || 0), 0) || 0);
  
  // Access body properties safely with optional chaining and defaults
  const title = module.body?.title as string || "Untitled Module";
  const description = module.body?.description as string || "No description available";

  const navigateToModule = () => {
    navigate({ to: "/learning/modules/$id", params: { id: module.id } });
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
            <div className="flex items-center gap-1">
              <BookIcon className="h-4 w-4" />
              <span>{exerciseCount} {exerciseCount === 1 ? "Exercise" : "Exercises"}</span>
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