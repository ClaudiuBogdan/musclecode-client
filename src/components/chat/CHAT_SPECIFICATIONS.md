# Chat Interface Specifications

## Overview

A streamlined chat interface integrated into the left tabs of the algorithm page, providing contextual AI assistance for learning and debugging algorithms, with enhanced user interaction features.

## Core Features

1. Chat Tab

   1. Located in the left sidebar alongside other algorithm-related tabs
   2. Clearly labeled for easy access

2. Message Display

   1. Scrollable area showing the conversation history
   2. Clear visual distinction between user and AI messages
   3. Support for code snippets with syntax highlighting

3. Input Area

   1. Text input field for user questions and comments
   2. Send button and keyboard shortcut (Enter) to submit messages

4. Predefined Questions

   1. A set of common questions related to the current algorithm
   2. Clickable buttons or links to quickly ask these questions

5. Code Integration

   1. Ability to display and highlight code snippets in messages
   2. Option to copy code snippets to the main editor

6. New Chat Option

   1. Button or option to start a fresh chat session

7. Question Editing

   1. Ability to edit user's previously sent messages

8. Response Rating

   1. Upvote and downvote buttons for AI responses
   2. Optional feedback field for downvotes

9. Copy Functionality

   1. Option to copy entire messages or specific parts of the conversation

10. Retry Functionality

    1. Ability to regenerate AI responses for specific questions

## User Stories

1. As a learner, I want to access a chat interface within the algorithm page to ask questions about the current algorithm.
2. As a user, I want to see my conversation history for the current algorithm session.
3. As a developer, I want to share code snippets in the chat and receive syntax-highlighted responses.
4. As a student, I want quick access to common questions about the algorithm to jumpstart my learning.
5. As a user, I want to easily copy code suggestions from the chat to my main editor.
6. As a learner, I want to start a new chat session when I switch topics or need a fresh start.
7. As a user, I want to edit my questions if I made a mistake or need to clarify my query.
8. As a student, I want to provide feedback on AI responses to improve the learning experience.
9. As a user, I want to copy entire messages or parts of the conversation for reference or sharing.
10. As a learner, I want to retry getting an answer if the initial response wasn't satisfactory.

## UX Specifications

1. Chat Accessibility

   1. Chat tab is clearly visible in the left sidebar
   2. Clicking the tab opens the chat interface in the main content area

2. Message Display

   1. Messages are displayed chronologically, with the most recent at the bottom
   2. User messages and AI responses have distinct styles for easy differentiation
   3. Code snippets are formatted with appropriate syntax highlighting

3. Input Interaction

   1. A text input field is located at the bottom of the chat interface
   2. Users can send messages by clicking a send button or pressing Enter
   3. The input field supports multi-line input for longer messages or code snippets

4. Predefined Questions

   1. A section above the chat history displays 3-5 predefined questions relevant to the current algorithm
   2. Clicking a predefined question automatically sends it as a user message

5. Code Integration

   1. Code snippets in messages are visually distinct and syntax-highlighted
   2. A "Copy" button appears next to code snippets for easy transfer to the main editor

6. Context Awareness

   1. The chat interface displays the name of the current algorithm at the top
   2. AI responses are tailored to the context of the current algorithm (handled by backend)

7. New Chat Functionality

   1. A "New Chat" button is prominently displayed at the top of the chat interface
   2. Clicking it clears the current conversation and starts a fresh chat session
   3. A confirmation dialog appears to prevent accidental clearing of the chat

8. Question Editing

   1. An "Edit" option appears when hovering over user messages
   2. Clicking "Edit" transforms the message into an editable text field
   3. "Save" and "Cancel" options are provided to confirm or discard edits

9. Response Rating

   1. Upvote and downvote buttons appear below each AI response
   2. Clicking downvote opens a small text field for optional feedback
   3. A subtle animation or color change indicates when a vote has been cast

10. Copy Functionality

    1. A "Copy" icon appears when hovering over messages
    2. Clicking the icon copies the entire message content to the clipboard
    3. For longer messages, an option to copy selected text is available
    4. A tooltip confirms when content has been copied

11. Retry Functionality

    1. A "Retry" icon appears next to each AI response
    2. Clicking "Retry" regenerates the AI's answer to the corresponding user question
    3. The new response replaces the old one, with an indicator that it's a regenerated answer
    4. A loading indicator is shown while the new response is being generated

12. Responsiveness

    1. The chat interface adjusts appropriately to different screen sizes
    2. On smaller screens, the chat may become a full-screen overlay

## Technical Considerations

- Implement the chat interface using React components
- Utilize Shadcn/ui for consistent styling with the rest of the application
- Integrate with TanStack Router for seamless navigation and state management
- Use CodeMirror for syntax highlighting of code snippets within the chat
- Implement state management for editing messages, handling ratings, and managing retries
- Ensure proper error handling for network issues or AI service unavailability
- Use a clipboard API for the copy functionality
- Implement optimistic UI updates for better user experience, especially for ratings and retries
