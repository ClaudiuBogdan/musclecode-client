# Canvas Chat Component

A modern chat interface for Canvas, similar to ChatGPT or Claude, with support for file editing commands and contextual interactions.

## Components

### ChatSession

The main container component that manages the entire chat interface:

- Displays messages in a scrollable area
- Provides input for user messages
- Handles commands for file editing
- Manages loading states and errors
- Supports message retry functionality

```tsx
import { ChatSession } from "@/components/canvas/chat";

// Example usage
<ChatSession 
  onSendMessageToBackend={handleSendMessage}
  onSendCommand={handleCommand}
  inputPlaceholder="Ask something about your code..."
/>
```

### ChatMessage

Renders individual messages in the chat timeline:

- Supports different message types (user/assistant)
- Renders markdown content with code syntax highlighting
- Provides copy functionality for code snippets
- Shows different styling based on the sender

```tsx
import { ChatMessage } from "@/components/canvas/chat";
import { ChatMessage as ChatMessageType } from "@/components/canvas/chat/types";

// Example message
const message: ChatMessageType = {
  id: "123",
  role: "assistant",
  content: [
    {
      type: "text",
      value: "Here's the code for a simple React component:",
    },
    {
      type: "code",
      language: "typescript",
      value: "const Button = () => <button>Click me</button>;",
    }
  ],
  createdAt: new Date().toISOString(),
};

// Usage
<ChatMessage message={message} />
```

### ChatInput

Provides a rich text input area for user messages:

- Supports context selection
- Handles submission via Ctrl/Cmd+Enter
- Displays placeholder text

```tsx
import { ChatInput } from "@/components/canvas/chat";

// Example usage
<ChatInput 
  placeholder="Type a message or command..."
  onSubmit={(value, contexts) => console.log(value, contexts)}
/>
```

## Integration with Canvas

To integrate the chat with canvas file editing functionality:

1. Implement a command handler in your Canvas component:

```tsx
const handleCommand = (command: string, args: any) => {
  switch(command) {
    case "edit":
      // Handle file editing
      editFile(args.file, args.content);
      break;
    case "create":
      // Handle file creation
      createFile(args.path, args.content);
      break;
    // Add more commands as needed
  }
};
```

2. Pass the handler to the ChatSession:

```tsx
<ChatSession
  onSendCommand={handleCommand}
  onSendMessageToBackend={sendToAI}
/>
```

## Command Format

Commands are messages that start with a forward slash `/` followed by the command name and arguments.

Examples:
- `/edit file.tsx --content "const x = 1;"`
- `/create newfile.tsx --content "export default function() {}"`

## Dependencies

This component uses:
- shadcn/ui for UI components
- tailwindcss for styling
- react-markdown for markdown rendering
- react-syntax-highlighter for code highlighting
- framer-motion for animations (optional) 