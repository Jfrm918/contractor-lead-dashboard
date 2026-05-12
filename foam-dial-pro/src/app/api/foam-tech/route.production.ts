/**
 * PRODUCTION VERSION — Anthropic API SDK
 *
 * To activate: rename this file to route.ts (and rename current route.ts to route.cli.ts)
 * Requires: ANTHROPIC_API_KEY in .env
 *
 * Cost tracking: each response logs input_tokens + output_tokens to the chat message.
 * Roll up per company per month for billing.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Same system prompt as CLI version — import from shared file when ready
const FOAM_TECH_SYSTEM = `You are **FoamTech**, the AI spray foam technician built into FoamDial Pro. You talk like a seasoned installer who's been spraying for 15+ years — direct, practical, no fluff. You speak the installer's language.

## Who you are
- You're the virtual tech standing next to the installer on the job
- You know open-cell and closed-cell spray foam inside and out
- You know equipment (Graco reactors, proportioners, guns, tips, hoses)
- You give field-ready answers, not textbook answers
- Keep responses SHORT and actionable — these guys are on a job site, not reading an essay
- Use bullet points and bold for key numbers
- If you don't know something specific, say so — don't guess on safety-critical stuff

## Foam Systems You Know In Detail

### Enverge EasySeal .5 (Open Cell, 0.5 pcf)
- **R-value**: 3.8/inch | **Mix ratio**: 1:1 by volume
- **Ambient range**: 40-120°F | **Hose temp**: 120-150°F (sweet spot: 145°F)
- **Drum pre-heat**: 95°F | **Pressure**: 1000-1400 PSI dynamic, A/B within 100-200 PSI
- **Max humidity**: 85% RH | **Max substrate moisture**: 18% | **Max pass**: ~5.5"

### AccuFoam AF1 (Open Cell, 0.40-0.45 pcf, Ultra Low Density)
- **R-value**: 3.7/inch | **Mix ratio**: 1:1 by volume
- **Ambient range**: 30-120°F | **Hose temp**: 120-140°F (sweet spot: 130°F)
- **Drum temp**: 70-90°F | **Pressure**: 1100-1400 PSI dynamic, A/B within 100 PSI
- **Max humidity**: 85% RH | **Max substrate moisture**: 19%
- **Max pass**: 6" standard, 8" with ignition barrier | **One year-round formula**

## How to respond
1. If they describe a problem → diagnose it, give most likely cause first, then the fix
2. If they ask about settings → give specific numbers for their foam system
3. If conditions are provided → reference them in your answer
4. Always think about safety`;

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const { messages, conditions } = await request.json() as {
      messages: ChatMessage[];
      conditions?: Record<string, unknown>;
    };

    if (!messages?.length) {
      return NextResponse.json(
        { success: false, error: { message: "No messages provided" } },
        { status: 400 }
      );
    }

    // Build condition + job + user context (same as CLI version)
    let conditionContext = "";
    if (conditions) {
      const parts: string[] = [];
      if (conditions.ambient != null) parts.push(`Ambient: ${conditions.ambient}°F`);
      if (conditions.substrate != null) parts.push(`Substrate: ${conditions.substrate}°F`);
      if (conditions.humidity != null) parts.push(`Humidity: ${conditions.humidity}%`);
      if (conditions.foamSystem) {
        const name = conditions.foamSystem === "enverge_easyseal" ? "Enverge EasySeal .5" : conditions.foamSystem === "accufoam_af1" ? "AccuFoam AF1" : String(conditions.foamSystem);
        parts.push(`Foam: ${name}`);
      }
      if (parts.length > 0) {
        conditionContext = `\n\n[LIVE CONDITIONS: ${parts.join(" | ")}]`;
      }
    }

    const user = await prisma.foamUser.findUnique({
      where: { id: session.userId },
      select: { name: true, role: true },
    });
    const userContext = user ? `\n\n[USER: ${user.name}, role: ${user.role}]` : "";
    const systemPrompt = FOAM_TECH_SYSTEM + conditionContext + userContext;

    // Save user message
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.role === "user") {
      await prisma.foamChatMessage.create({
        data: {
          userId: session.userId,
          role: "user",
          content: lastUserMsg.content,
          context: conditions ? JSON.parse(JSON.stringify(conditions)) : undefined,
        },
      });
    }

    // Stream response from Anthropic API
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        let inputTokens = 0;
        let outputTokens = 0;

        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullResponse += event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
            if (event.type === "message_delta" && event.usage) {
              outputTokens = event.usage.output_tokens;
            }
          }

          // Get final usage from the stream
          const finalMessage = await stream.finalMessage();
          inputTokens = finalMessage.usage?.input_tokens ?? 0;
          outputTokens = finalMessage.usage?.output_tokens ?? 0;

          // Save assistant response + token usage for cost tracking
          if (fullResponse) {
            await prisma.foamChatMessage.create({
              data: {
                userId: session.userId,
                role: "assistant",
                content: fullResponse,
                context: { inputTokens, outputTokens, model: "claude-sonnet-4-20250514" },
              },
            });
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[FoamTech API stream]", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[FoamTech]", err);
    return NextResponse.json({ success: false, error: { message: "Chat failed" } }, { status: 500 });
  }
}

// GET: same as CLI version
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const messages = await prisma.foamChatMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: { id: true, role: true, content: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    console.error("[FoamTech GET]", err);
    return NextResponse.json({ success: false, error: { message: "Failed to load history" } }, { status: 500 });
  }
}
