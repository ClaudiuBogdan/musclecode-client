import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"

const problemDescription = `
# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers in the array such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Constraints:

- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.
`

export const ProblemDescription: FC = () => {
  return (
    <div className={cn(
      "prose prose-sm max-w-none overflow-auto",
      "prose-headings:text-foreground",
      "prose-p:text-muted-foreground",
      "prose-strong:text-foreground",
      "prose-code:text-foreground",
      "prose-ul:text-muted-foreground"
    )}>
      <ReactMarkdown>{problemDescription}</ReactMarkdown>
    </div>
  )
}
