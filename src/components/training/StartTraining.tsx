"use client";

import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Brain,
  Trophy,
  Calendar,
  Star,
  ChevronRight,
} from "lucide-react";
import React from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDailyAlgorithms } from "@/services/algorithms/hooks/useDailyAlgorithms";


import { categories, difficulties } from "../algorithms/data";

export default function AlgorithmGymDashboard() {
  const { data: dailyAlgorithms, isLoading, error } = useDailyAlgorithms();
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);
  // const [streak, setStreak] = useState(0);

  const firstAlgorithmId = dailyAlgorithms?.[0]?.algorithmPreview.id;
  const completedAlgorithms =
    dailyAlgorithms?.filter((algo) => algo.completed).length || 0;
  const totalAlgorithms = dailyAlgorithms?.length || 0;
  const progressPercentage = (completedAlgorithms / totalAlgorithms) * 100;

  const difficultyIcons = difficulties;
  const categoryIcons = categories;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/30 border-none shadow-2xl">
        <CardHeader className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-emerald-400 opacity-20"></div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className="text-5xl font-extrabold mb-2">
              <span className="text-gray-900 dark:text-gray-300">
                Algorithm Gym
              </span>
            </CardTitle>
            <CardDescription className="text-xl text-gray-700 dark:text-gray-300">
              Level up your coding skills daily!
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-8 relative z-10 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/20 rounded-xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-400 rounded-full p-2">
                <Trophy className="w-6 h-6 text-yellow-900" />
              </div>
              <div>
                {/* TODO: Add streak */}
                {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Streak
                </h3>
                <p className="text-3xl font-bold text-yellow-300">
                  {streak} days
                </p> */}
              </div>
            </div>
            <div className="flex-1 flex items-center space-x-3 max-w-md">
              <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <div className="flex-1">
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Today's Progress</span>
                  <span>
                    {completedAlgorithms}/{totalAlgorithms}
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-gray-200 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Dumbbell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </motion.div>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">
                Preparing your workout...
              </p>
            </div>
          )}
          {error && (
            <div className="text-center py-12 text-red-300">
              <p className="text-lg">Oops! We hit a snag: {error.message}</p>
              <Button
                variant="outline"
                className="mt-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Try Again
              </Button>
            </div>
          )}

          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyAlgorithms?.map((algorithm, index) => {
                const { algorithmPreview } = algorithm;
                return (
                  <motion.div
                    key={algorithm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to="/algorithms/$algorithmId"
                      params={{ algorithmId: algorithmPreview.id }}
                      className="group block"
                    >
                      <Card
                        className={`h-full cursor-pointer transition-all duration-300 overflow-hidden
                          ${hoveredExercise === algorithm.id ? "shadow-lg shadow-white/10 scale-105" : ""}
                          ${algorithm.completed ? "bg-emerald-400/20" : "bg-white/10"}
                          border-2 ${algorithm.completed ? "border-emerald-400/50" : "border-transparent"}
                          hover:border-blue-400/50 dark:hover:border-blue-300/50`}
                        onMouseEnter={() => setHoveredExercise(algorithm.id)}
                        onMouseLeave={() => setHoveredExercise(null)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-semibold text-gold-900 dark:text-gold-900 group-hover:text-gold-900 transition-colors">
                            {algorithmPreview.title}
                          </CardTitle>
                          {Array.from(
                            new Set(
                              algorithmPreview.categories.map(
                                (category) =>
                                  categoryIcons.find(
                                    (cat) => cat.value === category
                                  )?.icon || Brain
                              )
                            )
                          ).map((Icon, index) => (
                            <Icon className="w-6 h-6" key={index} />
                          ))}
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`capitalize ${
                                  algorithmPreview.difficulty === "easy"
                                    ? "border-green-400 text-green-400"
                                    : algorithmPreview.difficulty === "medium"
                                      ? "border-yellow-400 text-yellow-400"
                                      : "border-red-400 text-red-400"
                                }`}
                              >
                                {/* Difficulty Icon */}
                                <div
                                  className={`p-1 rounded ${
                                    algorithmPreview.difficulty === "easy"
                                      ? "text-green-400"
                                      : algorithmPreview.difficulty === "medium"
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                  }`}
                                >
                                  {(() => {
                                    const icon =
                                      difficultyIcons.find(
                                        (diff) =>
                                          diff.value ===
                                          algorithmPreview.difficulty
                                      )?.icon || Brain;
                                    return React.createElement(icon, {
                                      className: "w-4 h-4",
                                    });
                                  })()}
                                </div>
                                {algorithmPreview.difficulty}
                              </Badge>
                            </div>
                            {algorithm.completed && (
                              <Badge className="bg-emerald-500 text-white dark:text-white">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {algorithmPreview.categories}
                          </p>
                        </CardContent>
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          {firstAlgorithmId && (
            <Link
              to="/algorithms/$algorithmId"
              params={{ algorithmId: firstAlgorithmId }}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white dark:text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
              >
                Start Today's Workout <Dumbbell className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
