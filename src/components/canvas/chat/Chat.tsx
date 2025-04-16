import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import { MessageInput } from "./MessageInput";

export const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <ChatHeader />
      <ChatThread className="flex-1 overflow-y-auto" />
      <MessageInput className="bg-gray-100 dark:bg-gray-900" />
    </div>
  );
};
