import React, { useState, useEffect, useRef } from "react";
import { useAvatarStore } from "@/stores/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const { messages, processMessage, isProcessing } = useAvatarStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      processMessage(inputValue);
      setInputValue("");
      playSound("send");
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    if (
      messages.length > 0 &&
      messages[messages.length - 1].sender === "avatar"
    ) {
      playSound("receive");
    }
  }, [messages]);

  const playSound = (type: "send" | "receive") => {
    if (audioRef.current) {
      audioRef.current.src =
        type === "send" ? "/sounds/send.mp3" : "/sounds/receive.mp3";
      audioRef.current.play();
    }
  };

  return (
    <div className="w-80 h-96 flex flex-col bg-background border rounded-lg shadow-lg">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${
              message.sender === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-secondary"
            }`}
            style={{ maxWidth: "80%" }}
          >
            {message.text}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
      <audio ref={audioRef} />
    </div>
  );
}
