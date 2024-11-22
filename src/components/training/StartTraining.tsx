import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDailyAlgorithms } from "@/services/algorithms/hooks/useDailyAlgorithms";

export default function AlgorithmGymDashboard() {
  const { data: dailyAlgorithms, isLoading, error } = useDailyAlgorithms();
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);

  const firstAlgorithmId = dailyAlgorithms?.[0]?.id;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Algorithm Gym</CardTitle>
        <CardDescription>
          Train your coding muscles daily with algorithm and data structure
          workouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {dailyAlgorithms?.map((algorithm) => (
            <Link
              key={algorithm.id}
              to="/algorithm/$id"
              params={{ id: algorithm.id }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  hoveredExercise === algorithm.id ? "shadow-lg scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredExercise(algorithm.id)}
                onMouseLeave={() => setHoveredExercise(null)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {algorithm.title}
                  </CardTitle>
                  <Dumbbell className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      variant={
                        algorithm.difficulty === "easy"
                          ? "secondary"
                          : algorithm.difficulty === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {algorithm.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {algorithm.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {firstAlgorithmId && (
          <Link to="/algorithm/$id" params={{ id: firstAlgorithmId }}>
            <Button size="lg" className="w-full sm:w-auto">
              Start Today's Workout <Dumbbell className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
