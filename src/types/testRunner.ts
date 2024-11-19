export interface TestItem {
  t: "describe" | "it" | "failed" | "passed" | "completedin" | "error";
  v: string;
  p: boolean;
  items?: TestItem[];
}

export interface TestResult {
  serverError: boolean;
  completed: boolean;
  output: TestItem[];
  successMode: "assertions";
  passed: number;
  failed: number;
  errors: number;
  error: string | null;
  assertions: {
    passed: number;
    failed: number;
    hidden: {
      passed: number;
      failed: number;
    };
  };
  specs: {
    passed: number;
    failed: number;
    hidden: {
      passed: number;
      failed: number;
    };
  };
  unweighted: {
    passed: number;
    failed: number;
  };
  weighted: {
    passed: number;
    failed: number;
  };
  timedOut: boolean;
  wallTime: number;
  testTime: number;
  tags: string[] | null;
}

export interface CodeExecutionResponse {
  type: "execution success" | "execution error";
  stdout: string;
  stderr: string;
  exitCode: number;
  wallTime: number;
  timedOut: boolean;
  message: string;
  token: string;
  result: TestResult;
}
