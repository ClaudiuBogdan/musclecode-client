import { all } from "./api/algorithms";
import { byId } from "./api/algorithms/$id";
import { createAlgorithmApi } from "./api/algorithms/createAlgorithm";
import { daily } from "./api/algorithms/daily";
import { sendMessage, streamMessage } from "./api/chat";
import { runCode } from "./api/code/run";
import { codeSubmissions, getSubmission } from "./api/code/submission";

export const handlers = [
  daily,
  all,
  ...byId,
  createAlgorithmApi,
  runCode,
  codeSubmissions,
  getSubmission,
  sendMessage,
  streamMessage,
];
