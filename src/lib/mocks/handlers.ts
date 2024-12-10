import { daily } from "./api/algorithms/daily";
import { all } from "./api/algorithms";
import { byId } from "./api/algorithms/$id";
import { runCode } from "./api/code/run";
import { codeSubmissions, getSubmission } from "./api/code/submission";
import { sendMessage, streamMessage } from "./api/chat";
import { createAlgorithmApi } from "./api/algorithms/createAlgorithm";

export const handlers = [
  daily,
  all,
  byId,
  createAlgorithmApi,
  runCode,
  codeSubmissions,
  getSubmission,
  sendMessage,
  streamMessage,
];
