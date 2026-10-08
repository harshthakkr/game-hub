"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { OvIcon } from "./OvIcon";
import { cx } from "@/utils/cx";

const SUGGESTIONS = [
  "Games like Elden Ring",
  "Best RPGs right now",
  "What's live right now?",
  "Short games under ₹1,000",
];

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I can help you find something to play, compare games, or catch up on events. What are you in the mood for?",
};

type Message = { role: string; content: string };

const PROSE =
  "prose prose-invert max-w-none text-body leading-relaxed text-ov-text break-words prose-p:my-2.5 prose-headings:mt-5 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-ov-white prose-h1:text-lg prose-h2:text-base prose-h3:text-body prose-a:text-ov-teal prose-a:underline-offset-2 hover:prose-a:text-ov-teal-hover prose-strong:font-semibold prose-strong:text-ov-white prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1 prose-li:marker:text-ov-teal prose-blockquote:border-ov-teal prose-blockquote:text-ov-dim prose-code:bg-ov-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-ov-teal-hover prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-ov-border prose-pre:bg-ov-bg prose-table:text-ui prose-th:border-ov-border prose-th:text-ov-white prose-td:border-ov-border";

/// The Concierge: a streamed chat with the game-recommendation model. An
/// `initialQuery` (from ⌘K or the Discover prompt) is sent once on mount.
export function AIChat({
  initialMessages,
  initialQuery,
}: {
  initialMessages?: Message[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    initialMessages?.length ? initialMessages : [WELCOME]
  );
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const next = [...messages, { role: "user", content: text.trim() }];
      setMessages([...next, { role: "assistant", content: "" }]);
      setQuery("");
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error("Unable to start stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          const chunk = decoder.decode(value, { stream: !done });
          if (chunk) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated.length - 1;
              updated[last] = { ...updated[last], content: updated[last].content + chunk };
              return updated;
            });
          }
          if (done) break;
        }
      } catch (error) {
        // A stop keeps whatever already streamed in; real failures replace
        // the empty reply with an apology.
        if ((error as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              role: "assistant",
              content: "Something went wrong reaching the Concierge. Try again in a moment.",
            },
          ]);
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  useEffect(() => {
    if (initialQuery && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQuery);
    }
  }, [initialQuery, send]);

  const showChips = messages.every((m) => m.role !== "user");

  const newChat = async () => {
    abortRef.current?.abort();
    await fetch("/api/ai", { method: "DELETE" }).catch(() => {});
    setMessages([WELCOME]);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--ov-topbar-h)-64px)] max-w-[880px] flex-col gap-4 px-4 pt-4 md:px-8 lg:min-h-[calc(100dvh-var(--ov-topbar-h))] lg:gap-5 lg:pt-8">
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 font-mono text-label tracking-[0.1em] text-ov-teal">
          <OvIcon name="sparkles" className="text-sm" />
          AI CONCIERGE
        </h1>
        {!showChips && (
          <button
            type="button"
            onClick={newChat}
            className="ml-auto flex h-11 items-center border-ov-border-strong text-ui text-ov-dim hover:text-ov-white lg:h-auto lg:border lg:px-2.5 lg:py-1.5"
          >
            New chat
          </button>
        )}
      </div>

      <div role="log" aria-label="Conversation" className="flex flex-1 flex-col gap-5 pb-3">
        {messages.map((msg, idx) => {
          const last = idx === messages.length - 1;
          if (msg.role === "user") {
            return (
              <div
                key={idx}
                className="ov-chamfer-bl ov-chamfer-sm max-w-[85%] animate-ov-fade-up self-end border border-ov-border-strong bg-ov-raised px-3.5 py-2.5 text-body leading-normal text-ov-white lg:max-w-[75%] lg:border-0 lg:bg-ov-teal lg:px-4 lg:py-3 lg:font-medium lg:text-ov-teal-ink"
              >
                {msg.content}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="animate-ov-fade-up self-start lg:max-w-[88%] lg:border lg:border-ov-border lg:bg-ov-panel lg:px-4.5 lg:py-4"
            >
              {msg.content ? (
                <div className={PROSE}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  {last && streaming && (
                    <span aria-hidden className="inline-block h-4 w-2 animate-ov-pulse bg-ov-teal align-middle" />
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-2.5 font-mono text-ui text-ov-muted">
                  <span aria-hidden className="size-2 rotate-45 animate-ov-pulse bg-ov-teal" />
                  Checking the catalogue…
                </span>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Phones: pinned just above the tab bar. */}
      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] flex flex-col gap-2 bg-linear-to-t from-ov-bg from-75% to-transparent pt-3 pb-2.5 lg:bottom-0 lg:gap-3 lg:pt-4 lg:pb-7">
        {showChips && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="h-11 shrink-0 border border-ov-border bg-ov-raised px-3.5 text-sm whitespace-nowrap text-ov-text transition-colors hover:border-ov-border-strong hover:text-ov-white lg:h-auto lg:py-1.5"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(query);
          }}
          className="flex h-[52px] items-center gap-2 border border-ov-border-strong bg-ov-field pr-1 pl-3.5 focus-within:border-ov-teal lg:h-14 lg:gap-2.5 lg:pr-2 lg:pl-4.5"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about games, prices or events"
            aria-label="Message the Concierge"
            className="min-w-0 flex-1 bg-transparent text-base text-ov-white outline-none"
          />
          {streaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="flex h-10 items-center gap-2 border border-ov-border-strong px-3.5 text-ui font-medium text-ov-white hover:bg-ov-raised"
            >
              <span aria-hidden className="size-[9px] bg-ov-white" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!query.trim()}
              className={cx(
                "ov-chamfer ov-chamfer-sm flex size-10 shrink-0 items-center justify-center transition-colors",
                query.trim()
                  ? "bg-ov-teal text-ov-teal-ink hover:bg-ov-teal-hover"
                  : "bg-ov-raised text-ov-muted"
              )}
            >
              <OvIcon name="arrow-up" className="text-lg" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
