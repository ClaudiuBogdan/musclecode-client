import ChatSession from "../chat-session";
import { ChatMessage } from "../chat-message";
import ChatInput from "../chat-input";

export { ChatSession, ChatMessage, ChatInput };

/**
 * Chat component that integrates with Canvas
 *
 * This module provides a complete chat interface similar to ChatGPT or Claude.
 * It consists of three main components:
 *
 * - ChatSession: Manages the overall chat state and interactions
 * - ChatMessage: Renders individual messages in the chat log
 * - ChatInput: Provides the text input interface for users
 *
 * The components work together to provide a seamless chat experience,
 * and can be integrated with the Canvas to enable file editing capabilities.
 */
export default ChatSession;
