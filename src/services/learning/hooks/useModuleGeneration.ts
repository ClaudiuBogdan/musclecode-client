import { useMutation } from "@tanstack/react-query";
import {
  learningApi,
  GenerateModuleRequestDto,
  GenerateModuleResponseDto,
} from "../api";

export function useModuleGeneration() {
  return useMutation<
    GenerateModuleResponseDto,
    Error,
    GenerateModuleRequestDto
  >({
    mutationFn: (data) => learningApi.generateModule(data),
  });
}
