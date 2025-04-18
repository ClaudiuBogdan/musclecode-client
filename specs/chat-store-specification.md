# Chat Store Specification

## 1. Overview

This document outlines the design for a Zustand-based chat store responsible for managing chat threads and messages. The goals are to create a maintainable, modular, and robust store that supports optimistic UI updates, efficient synchronization, and clear error handling for a chat application.

## 2. Core Entities

*   **`ChatThread`**: Represents a single conversation thread.
    *   `id`: Unique identifier (string, UUID generated client-side).
    *   `title`: User-defined or generated title (string).
    *   `createdAt`: Timestamp of creation (ISO string).
    *   `updatedAt`: Timestamp of the last update (ISO string).
    *   `messages`: Array of `ChatMessage` objects belonging to this thread.
    *   `attachedContext`: Array of `ContextReference` objects linked to the thread.
    *   `metadata`: Thread-specific metadata (e.g., `userId`, potentially other flags).

*   **`ChatMessage`**: Represents a single message within a thread.
    *   `id`: Unique identifier (string, **UUIDv4 generated by the client** before sending).
    *   `threadId`: Identifier of the `ChatThread` this message belongs to (string).
    *   `parentId`: Identifier of the message this one is a reply to (string, optional - for threading within a thread).
    *   `role`: Sender role (`'user'` | `'assistant'`).
    *   `content`: Message content (Array of `ContentElement` - allows rich content).
    *   `status`: Status of the message (`'pending'` | `'completed'` | `'error'` | `'streaming'` - potentially for assistant).
    *   `createdAt`: Timestamp of creation (ISO string).
    *   `errorDetails`: Information about an error if `status` is `'error'` (object, optional).
    *   `metadata`: Message-specific metadata (object, optional).

## 3. State (`ChatStoreState`)

*   `threads`: `Record<string, ChatThread>` - A dictionary mapping thread IDs to thread objects.
*   `currentThreadId`: `string | null` - The ID of the currently active thread.
*   `isLoading`: `boolean` - Global loading state, primarily for initial hydration.
*   `error`: `Error | null` - Global store-level error.

## 4. Actions (`ChatStoreActions`)

*   **`initializeStore()`**:
    *   Called on app startup.
    *   Attempts to hydrate state from persistent storage (localStorage).
    *   Determines the `currentThreadId` (last active, or the first available).
    *   Creates a new thread if none exists.

*   **`createThread(title?: string, context?: ContextReference[])`**:
    *   Generates a new UUID for the thread ID.
    *   Creates a new thread object with the given title (or default), context, and metadata.
    *   Adds the new thread to the `threads` state.
    *   Sets `currentThreadId` to the new thread's ID.
    *   No API call is made - threads are created client-side and will be sent to the server when the first message is added.

*   **`switchThread(threadId: string)`**:
    *   Checks if the `threadId` exists in `threads`.
    *   Sets `currentThreadId` to `threadId`.

*   **`deleteThread(threadId: string)`**:
    *   Removes the thread from `threads` state and updates `currentThreadId` if necessary.
    *   No API call is made - thread deletion is handled client-side.
    *   Deleted threads will be removed from server during synchronization.

*   **`sendMessage(data: { threadId: string; content: ContentElement[]; parentId?: string; /* other relevant context */ })`**:
    *   Validates that the thread (`data.threadId`) exists.
    *   Generates a final `messageId` (UUIDv4).
    *   Creates an optimistic user message object (`role: 'user'`, `status: 'pending'`, **the generated `id`**, `createdAt`, `content`, `threadId`, `parentId`).
    *   Calls `_addOrUpdateMessage` to add the optimistic message to the UI.
    *   Calls `api.sendMessageAPI({ **id: messageId,** threadId, messageContent: data.content, parentId: data.parentId, /* include other necessary data */ })`.
    *   **On API Success:**
        *   Receives confirmation/potential updates for the user message (using the **same `id`**) and the assistant's response message from the API.
        *   Updates the original user message using `_addOrUpdateMessage` (setting `status: 'completed'`).
        *   Adds the assistant's message using `_addOrUpdateMessage`.
    *   **On API Error:**
        *   Updates the optimistic user message using `_addOrUpdateMessage` (setting `status: 'error'`, adding `errorDetails`).
        *   The UI should observe the `'error'` status and `errorDetails` to display an error and potentially a retry button.

*   **`retrySendMessage(messageId: string, threadId: string)`**:
    *   Finds the message with the given `messageId` (which should have `status: 'error'`).
    *   Resets its status to `'pending'` using `_addOrUpdateMessage`.
    *   Re-initiates the API call sequence from `sendMessage` using the existing message data.

*   **`attachContext(threadId: string, context: ContextReference)`**:
    *   Adds or updates context reference locally in `threads[threadId].attachedContext`.
    *   Updates the thread's `updatedAt` timestamp.

*   **`removeContext(threadId: string, contextId: string)`**:
    *   Removes context reference locally.
    *   Updates the thread's `updatedAt` timestamp.

*   **`clearError()`**: Sets `error` state to `null`.

*   **`_addOrUpdateMessage(message: ChatMessage)`**:
    *   Internal helper. Finds message by `message.id`.
    *   Updates or adds the message to the correct thread's `messages` array.
    *   Ensures messages remain sorted by `createdAt`.
    *   Updates the thread's `updatedAt` timestamp.

## 5. Synchronization Strategy

*   **Client-Side Creation**: Thread creation happens client-side by generating a UUID. No API calls are made until the first message is sent to that thread.

*   **Backend Thread Creation**: On the backend, threads are created when the first message with a new thread ID is received.

*   **Synchronization Process**:
    *   The client will periodically request a list of threads from the server along with message counts per thread.
    *   If the server has more threads than the client, or if the message count for any thread differs, the client will request the full data for those threads.
    *   The client will then merge the server data with the local state, preserving pending messages and local-only threads.
    *   This synchronization mechanism allows for offline operation and multi-device usage, while maintaining consistency when online.

## 6. Optimistic Updates

*   User messages are added immediately with `status: 'pending'`.
*   Assistant responses are added when received from the API after sending a user message.

## 7. Error Handling

*   Global errors are stored in `state.error`.
*   Message-specific errors are handled via the `status: 'error'` and `errorDetails` field on the `ChatMessage` object.
*   UI components should react to the `'error'` status to display issues and potentially trigger `retrySendMessage`.

## 8. API Interaction (`chatApi`)

The store relies on an API service (`chatApi`) with methods like:

*   `sendMessageAPI(payload: SendMessagePayload)`: Returns `Promise<ChatMessage>` (the assistant's reply). Payload needs `threadId`, `content`, `parentId?`, context etc.
*   `fetchThreadSummaries()`: Returns thread IDs and message counts for synchronization.
*   `fetchThreads()`: Returns full thread data including messages.

## Next Steps

1. Implement the synchronization mechanism described in section 5:
   - Add an API endpoint to fetch thread summaries (IDs and message counts)
   - Add a method to selectively fetch full thread data based on differences
   - Create a periodic sync mechanism in the client

2. Update the UI components to work with the new thread creation model.

3. Implement multi-device support by properly handling message conflicts during synchronization. 