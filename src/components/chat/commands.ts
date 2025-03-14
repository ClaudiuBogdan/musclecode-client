import { Command } from "@/types/chat";

export const INPUT_COMMANDS = Object.freeze([
  {
    name: "quiz",
    command: "/quiz",
    description: "Start a quiz",
    prompt: `
Write a quiz with 5 questions for this algorithm.
Remember that the text you generate is markdown, so use the following format to write each individual question:

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

The opening and closing tags are required. The inner text should be a valid JSON object.
`,
  },
]) as Command[];
