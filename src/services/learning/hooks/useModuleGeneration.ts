import { useMutation } from "@tanstack/react-query";

import {
  learningApi
} from "../api";

import type {
  GenerateModuleRequestDto,
  GenerateModuleResponseDto} from "../api";

export function useModuleGeneration() {
  return useMutation<
    GenerateModuleResponseDto,
    Error,
    GenerateModuleRequestDto
  >({
    mutationFn: (data) => learningApi.generateModule(data),
  });
}
