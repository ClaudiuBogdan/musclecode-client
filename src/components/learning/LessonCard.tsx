import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentStatus } from "@/services/content/api";

import type { LessonEntity } from "@/services/content/api";


interface LessonCardProps {
  moduleId: string;
  lesson: LessonEntity;
  index: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({ moduleId, lesson, index }) => {
  const navigate = useNavigate();
  
  // Access body properties safely with optional chaining and defaults
  const title = lesson.body?.title as string || "Untitled Lesson";
  
  const navigateToLesson = () => {
    void navigate({ to: "/learning/modules/$moduleId/lessons/$lessonId", params: { moduleId, lessonId: lesson.id } });
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
          <div className="flex justify-between items-center">
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