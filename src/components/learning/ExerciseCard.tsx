import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRightIcon, CodeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentStatus } from "@/services/content/api";

import type { ExerciseEntity } from "@/services/content/api";


interface ExerciseCardProps {
  exercise: ExerciseEntity;
  index: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index }) => {
  const navigate = useNavigate();
  
  // Access body properties safely with optional chaining and defaults
  const title = exercise.body?.title as string || "Untitled Exercise";
  const description = exercise.body?.description as string || "No description available";

  const navigateToExercise = () => {
    void navigate({ to: "/learning/exercises/$id", params: { id: exercise.id } });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToExercise}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                {index}
              </Badge>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {exercise.status === ContentStatus.CREATED && 
              <Badge>Published</Badge>
            }
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {description}
          </CardDescription>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <CodeIcon className="h-4 w-4" />
              <span>Coding Exercise</span>
            </div>
            
            <Button 
              variant="ghost" 
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigateToExercise();
              }}
            >
              Start <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 