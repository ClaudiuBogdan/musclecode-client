# ChatInput Component

A modular chat input component with context selection capability.

## Component Structure

The ChatInput is split into multiple components for better maintainability:

- **ChatInput (`index.tsx`)**: Main component that combines the editor and context selector
- **ChatEditor (`ChatEditor.tsx`)**: Encapsulates the CodeMirror editor functionality
- **ContextSelector (`ContextSelector.tsx`)**: Handles the context selection UI and logic
- **types.ts**: Contains type definitions and helper functions for context items
- **theme.ts**: Defines the CodeMirror editor themes

## Usage

```tsx
import ChatInput from "../components/canvas/chat-input";
import { ContextReference } from "../components/canvas/chat/types";

function MyComponent() {
  const handleSubmit = (value: string, contexts: ContextReference[]) => {
    console.log("Message:", value);
    console.log("Selected contexts:", contexts);
    // Process message and contexts
  };

  return (
    <ChatInput 
      initialValue=""
      placeholder="Type your message here"
      onSubmit={handleSubmit}
    />
  );
}
```

## Props

### ChatInput Props

| Prop | Type | Description |
|------|------|-------------|
| `initialValue` | `string` | Initial value for the editor |
| `initialContexts` | `ContextReference[]` | Initial contexts to select |
| `onSubmit` | `(value: string, contexts: ContextReference[]) => void` | Called when user submits a message (Ctrl+Enter) |
| `onChange` | `(value: string) => void` | Called when editor value changes |
| `onContextsChange` | `(contexts: ContextReference[]) => void` | Called when selected contexts change |
| `placeholder` | `string` | Placeholder text for the editor |

## Features

- Command+Slash (⌘/) hotkey to open context selector menu
- Context selection with dropdown options for key-value contexts
- Keyboard navigation and accessibility
- Theme integration with light/dark modes
- Focus management between editor and context UI 