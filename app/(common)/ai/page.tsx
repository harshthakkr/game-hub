import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { AIChat } from "@/components/overdrive/AIChat";

export const metadata: Metadata = {
  title: "AI Concierge",
  description: "Ask for game recommendations by mood, budget or a game you loved.",
};

export default async function AIPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  if (!session) {
    const back = q ? `/ai?q=${encodeURIComponent(q)}` : "/ai";
    redirect(`/register?mode=login&callbackUrl=${encodeURIComponent(back)}`);
  }

  const history = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const initialMessages = history.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  return <AIChat initialMessages={initialMessages} initialQuery={q?.slice(0, 500)} />;
}
