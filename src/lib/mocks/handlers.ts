import { daily } from "./api/algorithms/daily";
import { all } from "./api/algorithms";
import { byId } from "./api/algorithms/$id";
import { runCode } from "./api/code/run";
import { codeSubmissions, getSubmission } from "./api/code/submission";

export const handlers = [
  daily,
  all,
  byId,
  runCode,
  codeSubmissions,
  getSubmission,
];
