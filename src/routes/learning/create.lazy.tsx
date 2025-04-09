import { createLazyFileRoute } from "@tanstack/react-router";
import { CourseCreationPage } from "@/components/learning/CourseCreationPage";

export const Route = createLazyFileRoute("/learning/create")({
  component: CourseCreationPage,
});
