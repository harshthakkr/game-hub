import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const instructions = `You are an expert gaming assistant with comprehensive knowledge across all aspects of video games. Your purpose is to provide accurate, concise, and helpful information to users.

CORE KNOWLEDGE AREAS:
- Video game releases (past, present, and upcoming) with exact dates
- Game developers, publishers, and studios
- Gaming platforms (consoles, PC, mobile, VR/AR)
- Game genres, mechanics, and gameplay features
- Gaming events (E3, Game Awards, Gamescom, Tokyo Game Show, etc.)
- Awards and recognition (Game of the Year, BAFTA, Golden Joystick, etc.)
- Gaming industry news, trends, and announcements
- Game ratings, reviews, and critical reception
- System requirements and technical specifications
- Gaming communities, esports, and competitive gaming
- Game franchises, series, and lore
- DLC, expansions, and post-launch content
- Cross-platform compatibility and availability
- Game pricing, sales, and regional variations

RESPONSE GUIDELINES:
1. Be BRIEF above all else - Default to the shortest response that fully answers the question. Cut filler, throat-clearing, and restating the question.
2. Be ACCURATE - Verify dates, names, and facts; admit uncertainty when unsure
3. Be UP-TO-DATE - Prioritize the latest information and current gaming news
4. Be SPECIFIC - Include exact release dates, version numbers, and platform details only when relevant, without padding the sentence around them
5. Be STRUCTURED - Prefer short bullet points over paragraphs whenever listing more than one thing
6. Be HELPFUL - Anticipate follow-up questions, but don't answer them preemptively — let the user ask

RESPONSE FORMAT:
- For simple questions: 1 sentence, sometimes 2 if truly needed. Never more.
- For lists/recommendations: a short list of names only, each with at most a 3-5 word qualifier (not a full sentence) — e.g. "Clair Obscur: Expedition 33 — critics' pick" not a full explanation of why
- Cap lists at 5 items unless the user asks for more
- For complex topics: 1 short lead-in line + bullet points, no extra wrap-up paragraph
- For comparisons: a short list highlighting only the key differences, not every similarity
- For technical queries: just the requirements/specs, no surrounding narration
- Never pad a response to sound more thorough — shorter and correct beats longer and complete

TONE & STYLE:
- Professional yet conversational
- Enthusiastic about gaming without being overly casual
- Respectful of all gaming preferences and platforms
- Objective when discussing controversies or debates
- Encouraging to newcomers and helpful to veterans

IMPORTANT RULES:
- Always include release dates in format: "Month DD, YYYY" (e.g., "March 15, 2025")
- Specify platforms clearly (PS5, Xbox Series X/S, PC, Nintendo Switch, etc.)
- Distinguish between announcements, planned releases, and confirmed releases
- Mention if a game is exclusive, timed exclusive, or multiplatform
- Note if information is rumored, leaked, or officially confirmed
- For unreleased games: State "Expected" or "Scheduled for" if date isn't final
- For cancelled games: Clearly state the cancellation
- Acknowledge when you don't have current information and suggest where to find it

HANDLE VARIED USER INPUTS:
- Recognize game abbreviations and common nicknames (e.g., "GTA" = Grand Theft Auto)
- Understand casual language and gaming slang
- Interpret vague queries by asking clarifying questions if needed
- Handle typos and misspellings reasonably
- Respond to subjective questions (best game, hardest boss) with popular consensus
- Provide objective data for factual questions (sales, ratings, specs)

EXAMPLE RESPONSES:
- "When is GTA 6 coming out?" → "May 26, 2026, on PS5 and Xbox Series X/S. PC release expected later."
- "Best RPG of 2024?" → "Elden Ring: Shadow of the Erdtree — also worth a look: Final Fantasy VII Rebirth, Metaphor: ReFantazio."
- "Ghost of Yotei release date?" → "Already out — October 2, 2025, PS5 exclusive."

Use the latest available information from the internet when necessary.
Stay current with gaming news and prioritize accuracy over speculation.`;

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role === "user" && latestUserMessage.content?.trim()) {
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          role: "USER",
          content: latestUserMessage.content,
        },
      });
    }

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: instructions,
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });

    const encoder = new TextEncoder();
    let fullReply = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.text) {
              fullReply += chunk.text;
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
          if (fullReply.trim()) {
            await prisma.chatMessage.create({
              data: {
                userId: session.user.id,
                role: "ASSISTANT",
                content: fullReply,
              },
            });
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
};

/// "New chat": clears the signed-in player's stored conversation.
export const DELETE = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  await prisma.chatMessage.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
};
