interface ResponseTemplate {
  pattern: RegExp;
  response: string | ((match: RegExpMatchArray) => string);
}

const responseTemplates: ResponseTemplate[] = [
  {
    pattern: /how does (.*?) work/i,
    response: (match) => {
      const algorithm = match[1].toLowerCase();
      return `${algorithm} is an algorithm that solves [specific problem]. Here's how it works:

1. First, it [first step]
2. Then, it [second step]
3. Finally, it [final step]

The time complexity is O(n), and space complexity is O(1).

Would you like to see a code example?`;
    },
  },
  {
    pattern: /explain (.*?)(algorithm|sort|search)/i,
    response: (match) => {
      const name = `${match[1]}${match[2]}`;
      return `Let me explain ${name}:

1. Overview:
   - Purpose: [what problem it solves]
   - Use cases: [when to use it]

2. Time Complexity:
   - Best case: O(n)
   - Average case: O(n log n)
   - Worst case: O(n²)

3. Space Complexity:
   - O(n) auxiliary space

4. Key Characteristics:
   - [characteristic 1]
   - [characteristic 2]
   - [characteristic 3]

Would you like me to elaborate on any of these points?`;
    },
  },
  {
    pattern: /code example for (.*?)/i,
    response: (match) => {
      const topic = match[1];
      return `Here's a code example for ${topic}:

\`\`\`typescript
function example<T>(input: T[]): T[] {
  // Implementation details
  const result = input.map(item => {
    // Processing logic
    return transform(item);
  });
  
  return result;
}

// Usage example:
const input = [1, 2, 3, 4, 5];
const result = example(input);
\`\`\`

Would you like me to explain how this code works?`;
    },
  },
  {
    pattern: /debug (.*?)/i,
    response: (match) => {
      const code = match[1];
      return `Let's debug your ${code} code. Here are some common issues to check:

1. Input validation
2. Edge cases
3. Type checking
4. Error handling
5. Performance considerations

Would you like me to help you with any specific issue?`;
    },
  },
];

export function generateResponse(userMessage: string): string {
  // Check for matches in templates
  for (const template of responseTemplates) {
    const match = userMessage.match(template.pattern);
    if (match) {
      return typeof template.response === "function"
        ? template.response(match)
        : template.response;
    }
  }

  // Default response if no pattern matches
  return `I understand you're asking about algorithms. To help you better, could you:

1. Specify which algorithm you're interested in
2. Ask about a specific aspect (implementation, complexity, use cases)
3. Share any code you'd like me to review

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

How would you like to proceed?`;
}
