"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, Spinner } from "@/components/ui";

const SUGGESTIONS = [
  "Best RPGs of 2025",
  "What's live right now?",
  "Games like Elden Ring",
];

const WELCOME = {
  role: "assistant",
  content:
    "Welcome to the grid. I can help you discover games, compare titles, track events, or build a wishlist. What are you in the mood for?",
};

export function AIChat({
  initialMessages,
}: {
  initialMessages?: Array<{ role: string; content: string }>;
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >(initialMessages?.length ? initialMessages : [WELCOME]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage = { role: "user", content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setQuery("");
    setLoading(true);
    try {
      setMessages([...next, { role: "assistant", content: "" }]);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("Unable to start stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let complete = false;

      while (!complete) {
        const { value, done } = await reader.read();
        complete = done;
        const chunk = decoder.decode(value, { stream: !done });
        if (!chunk) continue;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          updated[last] = {
            ...updated[last],
            content: updated[last].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Signal lost — try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--ov-topbar-h))] max-w-[900px] flex-col px-4 py-7 lg:px-6">
      <div className="mb-[18px] flex items-center gap-3">
        <span className="font-orbitron text-xl font-black tracking-hud text-ov-teal">
          A.I. CONCIERGE
        </span>
        <span className="animate-ov-pulse flex items-center border border-ov-rose px-2 py-0.5 text-label text-ov-rose">
          <span aria-hidden className="mr-1.5 size-1.5 rounded-full bg-current" />
          ONLINE
        </span>
      </div>

      {/* The chamfered frame stays still; the log inside it scrolls, so the
          corner hairline doesn't scroll away with the messages. */}
      <div className="ov-chamfer ov-chamfer-lg flex min-h-0 flex-1 flex-col border border-ov-border bg-ov-sunken">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`animate-ov-fade-up flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "ov-chamfer-bl ov-chamfer-sm bg-ov-teal text-ov-bg"
                      : "ov-chamfer ov-chamfer-sm border border-ov-border bg-ov-panel text-ov-text"
                  }`}
                >
                  {isUser ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none break-words prose-p:my-3 prose-headings:mb-2 prose-headings:mt-5 prose-headings:font-orbitron prose-headings:tracking-wide prose-headings:text-white prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-a:text-ov-teal prose-a:underline-offset-2 hover:prose-a:text-white prose-strong:text-white prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:marker:text-ov-teal prose-blockquote:my-3 prose-blockquote:border-ov-teal prose-blockquote:text-ov-dim prose-code:rounded-sm prose-code:bg-ov-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:text-ov-teal prose-code:before:content-none prose-code:after:content-none prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-ov-border prose-pre:bg-ov-bg prose-pre:p-3 prose-table:my-3 prose-table:text-xs prose-th:border-ov-border prose-th:text-white prose-td:border-ov-border">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2.5 text-ui text-ov-muted">
              <Spinner className="text-sm text-ov-teal" />
              Scanning the grid…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="my-3.5 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} size="sm" variant="secondary" disabled={loading} onClick={() => send(s)}>
            {s}
          </Button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(query);
        }}
        className="ov-chamfer-x flex items-center gap-3 border border-ov-border bg-ov-panel px-4 py-3 transition-colors duration-200 focus-within:border-ov-teal"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me about games, events, or recommendations…"
          aria-label="Message the AI concierge"
          disabled={loading}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-ov-white outline-none placeholder:text-ov-muted"
        />
        <Button
          type="submit"
          variant="primary"
          iconRight="send"
          chamfer={false}
          disabled={!query.trim()}
          loading={loading}
        >
          SEND
        </Button>
      </form>
    </div>
  );
}
