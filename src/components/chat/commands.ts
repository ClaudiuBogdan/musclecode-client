import type { Command } from "@/types/chat";

export const INPUT_COMMANDS = Object.freeze([
  {
    name: "quiz",
    command: "/quiz",
    description: "Start a quiz",
    prompt: `
Write a quiz with 5 questions for this algorithm.

Use the following format to write each individual question.

JSON format:

{
  "question": "Question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "hint": "Hint text",
  "explanation": "Explanation text",
  "answer": "Correct answer"
}

Surround the JSON object with <quiz-question> html tags, but never include it in a code block. Don't include any other text in between the tags. Don't use markdown to format the quiz questions. Avoid this sequence at all costs: \`\`\`\n

Here is an example:

<quiz-question> 
{ 
  "question": "Which of the following is a prerequisite for performing a binary search algorithm on an array?",
  "options": [
    "The array must be sorted",
    "The array must contain only integers",
    "The array must have an odd number of elements",
    "The array must be implemented as a linked list",
    "The array must contain unique elements"
    ],
  "hint": "Think about how binary search divides the search space and makes decisions.",
  "explanation": "Binary search requires the array to be sorted because the algorithm works by comparing the target value with the middle element and determining whether to search in the left or right half. This decision is only valid if elements are arranged in a specific order (ascending or descending).", 
  "answer": "The array must be sorted" 
} 
</quiz-question>

<quiz-question> 
{ 
  "question": "What is the key characteristic that makes linear search more versatile than binary search?",
  "options": [
    "Linear search can be performed on unsorted arrays",
    "Linear search always has better time complexity",
    "Linear search requires less memory",
    "Linear search can only find unique elements",
    "Linear search always returns the index of the first occurrence"
    ],
  "hint": "Consider what prerequisites each algorithm requires before it can be used effectively.",
  "explanation": "Unlike binary search which requires a sorted array, linear search can be performed on any array regardless of whether it's sorted or not. While binary search is more efficient with O(log n) time complexity compared to linear search's O(n), linear search has the advantage of working directly on unsorted data without requiring preprocessing. This makes linear search more versatile and appropriate for one-time searches on unsorted data or small arrays where the overhead of sorting would be inefficient.", 
  "answer": "Linear search can be performed on unsorted arrays" 
} 
</quiz-question>

Remember to always use the <quiz-question> tags and don't use any code block to surround the <quiz-question> tags.
`,
  },
]) as Command[];
