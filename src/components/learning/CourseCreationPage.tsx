import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { BoltIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DifficultyLevel
} from "@/services/learning/api";
import { useModuleGeneration } from "@/services/learning/hooks/useModuleGeneration";

import type {
  GenerateModuleResponseDto,
  Lesson} from "@/services/learning/api";

export function CourseCreationPage() {
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    DifficultyLevel.BEGINNER
  );
  const [generatedCourse, setGeneratedCourse] =
    useState<GenerateModuleResponseDto | null>(null);

  const moduleGeneration = useModuleGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    moduleGeneration.mutate(
      { prompt, difficulty },
      {
        onSuccess: (data) => {
          setGeneratedCourse(data);
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Course Generation</CardTitle>
              <CardDescription>
                Describe the course you want to create. Be specific about the
                topic, target audience, and learning objectives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Course Description
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="E.g., Create a comprehensive course on JavaScript promises for beginners, covering async/await, error handling, and practical examples"
                    className="min-h-[200px] resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty Level
                  </label>
                  <Select
                    value={difficulty}
                    onValueChange={(value) =>
                      setDifficulty(value as DifficultyLevel)
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DifficultyLevel.BEGINNER}>
                        Beginner
                      </SelectItem>
                      <SelectItem value={DifficultyLevel.INTERMEDIATE}>
                        Intermediate
                      </SelectItem>
                      <SelectItem value={DifficultyLevel.ADVANCED}>
                        Advanced
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={moduleGeneration.isPending || !prompt.trim()}
                >
                  {moduleGeneration.isPending ? (
                    <>
                      <BoltIcon className="mr-2 h-4 w-4 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    "Generate Course"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Course Draft</CardTitle>
              <CardDescription>
                Preview of your generated course content
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {moduleGeneration.isPending && (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2 mt-6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}

              {moduleGeneration.isError && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to generate course. Please try again with a different
                    prompt.
                  </AlertDescription>
                </Alert>
              )}

              {generatedCourse && !moduleGeneration.isPending && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {generatedCourse.title}
                    </h2>
                    {generatedCourse.difficulty && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Difficulty:{" "}
                        {generatedCourse.difficulty.charAt(0).toUpperCase() +
                          generatedCourse.difficulty.slice(1)}
                      </p>
                    )}
                    <p className="mt-2">{generatedCourse.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Course Lessons</h3>
                    {generatedCourse.lessons.map((lesson: Lesson, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">{lesson.title}</h4>
                        <p className="text-sm">{lesson.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!generatedCourse &&
                !moduleGeneration.isPending &&
                !moduleGeneration.isError && (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-muted-foreground">
                      Enter a prompt and click "Generate Course" to see the
                      result here.
                    </p>
                  </div>
                )}
            </CardContent>
            {generatedCourse && (
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Edit Draft
                </Button>
                <Button>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Save Course
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
