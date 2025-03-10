import { AlgorithmFile } from "@/types/algorithm";
import { CodeExecutionResponse } from "@/types/testRunner";

interface HintContext {
  description: string;
  code: Record<string, AlgorithmFile>;
  testFile?: AlgorithmFile;
  solutionFile?: AlgorithmFile;
  executionResult?: CodeExecutionResponse | null;
}

/**
 * Generates a personalized hint for the user based on their current algorithm state
 * @param context All relevant algorithm context needed to generate a hint
 * @returns A personalized hint as a string
 */
export async function generateHint(context: HintContext): Promise<string> {
  const { description, code, testFile, solutionFile, executionResult } =
    context;

  // Get the main user code file (assuming it's the first non-test file)
  const userCodeFile = Object.values(code).find(
    (file) => !file.name.includes("test") && !file.readOnly
  );

  // Build prompt with all relevant context
  let prompt = `
You are a helpful coding assistant providing a hint for a user working on an algorithm problem.

PROBLEM DESCRIPTION:
<problem_description>
${description}
</problem_description>

`;

  if (userCodeFile) {
    prompt += `
USER'S CURRENT CODE (${userCodeFile.language}):
<user_code>
\`\`\`${userCodeFile.language}
${userCodeFile.content}
\`\`\`
</user_code>
`;
  } else {
    prompt += `
The user hasn't written any code yet.
`;
  }

  if (testFile) {
    prompt += `
TEST FILE:
<test_file>
\`\`\`${testFile.language}
${testFile.content}
\`\`\`
</test_file>
`;
  }

  // Only include solution file in special development/testing scenarios
  // In production, we wouldn't want to send the solution to the AI
  if (solutionFile && process.env.NODE_ENV === "development") {
    prompt += `
SOLUTION FILE (ONLY FOR YOUR REFERENCE, DO NOT REVEAL THE SOLUTION):
<solution_file>
\`\`\`${solutionFile.language}
${solutionFile.content}
\`\`\`
</solution_file>
`;
  }

  if (executionResult) {
    prompt += `
EXECUTION RESULT:
${executionResult.result?.passed ? "PASSED" : "FAILED"}
${executionResult.result?.error || ""}
${executionResult.result?.output || ""}
`;
  }

  prompt += `
Based on the information above, provide ONE concise, helpful hint that will guide the user toward solving the problem without giving away the complete solution. Focus on:

1. If there's no code yet, suggest a starting approach or data structure
2. If there are errors, point out what might be causing ONE specific error
3. If the solution is inefficient, suggest an optimization for ONE part
4. If tests are failing, explain what ONE test case is checking for

You should also look at the user code for comments and see if the user is asking for help in the comments. If so, use that to generate a hint.

Keep your hint under 3 sentences and make it specific to their current progress.
`;

  // Call the OpenAI API using the shared function
  // const hint = await chatCompletion(prompt);
  const hint = "This is a test hint";
  // TODO: Implement the logic to generate a hint
  return hint;
}
