import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentStatus, LessonEntity } from "@/services/content/api";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface LessonCardProps {
  moduleId: string;
  lesson: LessonEntity;
  index: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({ moduleId, lesson, index }) => {
  const navigate = useNavigate();
  const exerciseCount = lesson.exercises?.length || 0;
  
  // Access body properties safely with optional chaining and defaults
  const title = lesson.body?.title as string || "Untitled Lesson";
  const content = lesson.body?.content as string || "";
  
  // Create a safe short content preview
  const contentPreview = content ? content.slice(0, 100) + (content.length > 100 ? '...' : '') : 'No content available';

  const navigateToLesson = () => {
    navigate({ to: "/learning/modules/$moduleId/lessons/$lessonId", params: { moduleId, lessonId: lesson.id } });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToLesson}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                {index}
              </Badge>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {lesson.status === ContentStatus.CREATED && 
              <Badge>Published</Badge>
            }
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {contentPreview}
          </CardDescription>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <BookIcon className="h-4 w-4" />
              <span>{exerciseCount} {exerciseCount === 1 ? "Exercise" : "Exercises"}</span>
            </div>
            
            <Button 
              variant="ghost" 
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigateToLesson();
              }}
            >
              Continue <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 