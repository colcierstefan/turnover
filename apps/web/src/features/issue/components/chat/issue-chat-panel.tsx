"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

const transport = new DefaultChatTransport({ api: "/chat/messages" });

export default function IssueChatPanel({
  language,
}: Readonly<{ language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].chat;
  const [question, setQuestion] = useState("");
  const { messages, sendMessage, status, error } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";

  const ask = (value: string) => {
    if (!value.trim() || isBusy) return;
    sendMessage({ text: value.trim() });
    setQuestion("");
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <ul className="flex flex-col gap-2">
          {text.examples.map((example) => (
            <li key={example}>
              <button
                type="button"
                className="w-full rounded border border-foreground/20 px-3 py-2 text-left text-sm"
                onClick={() => ask(example)}
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ol className="flex flex-col gap-3">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`flex flex-col gap-1 rounded p-3 ${message.role === "user" ? "bg-foreground/5" : "border border-foreground/10"}`}
          >
            <span className="text-xs font-medium opacity-70">
              {message.role === "user" ? text.you : text.assistant}
            </span>
            <p className="whitespace-pre-wrap">
              {message.parts
                .map((part) => (part.type === "text" ? part.text : ""))
                .join("")}
            </p>
          </li>
        ))}
      </ol>
      {status === "submitted" && (
        <p className="text-sm opacity-70">{text.thinking}</p>
      )}
      {error && <p className="text-sm text-red-600">{text.failed}</p>}
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <Input
          label={text.messageLabel}
          value={question}
          maxLength={2000}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <Button type="submit" disabled={isBusy || !question.trim()}>
          {text.send}
        </Button>
      </form>
    </div>
  );
}
