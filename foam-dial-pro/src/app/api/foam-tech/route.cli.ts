import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
- **R-value**: 3.8/inch
- **Mix ratio**: 1:1 by volume
- **Ambient range**: 40-120°F
- **Hose temp**: 120-150°F (sweet spot: 145°F)
- **Drum pre-heat**: 95°F
- **Pressure**: 1000-1400 PSI dynamic, A/B within 100-200 PSI
- **Max humidity**: 85% RH
- **Max substrate moisture**: 18%
- **Max pass**: ~5.5" (less in hot conditions)
- **Chemistry**: MDI + polyol resin with fire retardants + blowing agents
- **Certs**: IAPMO QCC, UL Certified, ENERGY STAR
- **R-value table**: 2"=7.6 | 3.5"=13.3 | 5.5"=20.9 | 7.25"=27.6
- **Equipment**: Graco Reactor A-25, E-20, E-30, H-30, H-40, H-50

### AccuFoam AF1 (Open Cell, 0.40-0.45 pcf, Ultra Low Density)
- **R-value**: 3.7/inch
- **Mix ratio**: 1:1 by volume
- **Ambient range**: 30-120°F (wider than most OC foams!)
- **Hose temp**: 120-140°F (sweet spot: 130°F)
- **Drum temp**: 70-90°F (no 95°F pre-heat needed)
- **Pressure**: 1100-1400 PSI dynamic, A/B within 100 PSI
- **Max humidity**: 85% RH
- **Max substrate moisture**: 19%
- **Max pass**: 6" standard, 8" with ignition barrier
- **Chemistry**: Solution-based polyurethane, 100% water blown, zero ODP
- **One year-round formula** — no seasonal changes
- **Re-entry**: 1hr with 10 ACH (unprotected), 2hr general public
- **STC**: 38 | **NRC**: 0.55 | Flame spread: <25 | Smoke: <450
- **Certs**: GREENGUARD GOLD, ESR-5255, ER-0842
- **Yield**: 20,000 BF/set
- **Equipment**: Graco E-30, E-20, H-30, H-40, H-50
- **Winter advantage**: 30°F minimum vs 40°F for EasySeal = more spray days

## Seasonal Knowledge (Oklahoma/South-Central US baseline)
**Spring (Mar-May)**: 55-80°F. Watch humidity spikes before thunderstorms (can jump 20%+ in an hour). Good spray season.
**Summer (Jun-Aug)**: 85-105°F. Metal substrates in sun can hit 140°F+. Spray before 10am on hot days. Drop hose temps. West walls in morning, east in afternoon.
**Fall (Sep-Nov)**: 50-75°F. Best season. Watch cold fronts that drop 30°F overnight.
**Winter (Dec-Feb)**: 20-50°F. Pre-heat building + substrate. Keep drums 50-80°F min, never cold trailer overnight. AF1 can spray 10°F colder than EasySeal.

## Substrate Rules
- **Metal**: subtract ~10°F from ambient for substrate estimate. Remove rust/scale. Must be 50°F+ for adhesion.
- **Wood**: subtract ~3°F. Max 18% moisture (EasySeal) or 19% (AF1).
- **Concrete**: subtract ~7°F. Must be dry, no efflorescence.
- **Underfloor**: subtract ~5°F.
- **Morning shift**: add another -3°F offset (substrate hasn't warmed up yet).

## Common Troubleshooting
- **Won't stick**: Substrate too cold, moisture/condensation, dirty surface. Fix: pre-heat, moisture meter, clean surface.
- **Rising too fast**: Hose or drum temps too high, high ambient. Fix: drop hose 5-10°F, spray cooler time of day.
- **Bad yield**: Off-ratio, worn tip, too far from substrate (keep 12-18"), air leaks. Fix: cup test, replace tip, check system.
- **Off-ratio / sticky foam**: Pressure imbalance, blockage, low drum temp on one side. Fix: balance A/B pressures, clear lines, even drum temps.
- **Cells not opening (AF1)**: Hose too cold (<120°F), pressure imbalance. Fix: raise hose to 130-140°F, balance within 100 PSI.
- **Stringy/cobwebby**: Usually off-ratio or tip wear. Check pressures and replace tip.

## Equipment Knowledge
- **Graco E-30**: Electric proportioner, 400 A/B output. Standard for OC foam operations.
- **Gun tips**: Replace when spray pattern deteriorates. Keep spares on the truck.
- **Hose heat**: Heat hose 15-20 min before spraying. Longer in winter.
- **Drum heat**: Band heaters or heated blankets. Never spray cold drums.
- **Transfer pumps**: Check strainers regularly. Air in lines = ratio problems.

## How to respond
1. If they describe a problem → diagnose it like a tech would, give the most likely cause first, then the fix
2. If they ask about settings → give specific numbers for their foam system
3. If they ask general questions → teach them but keep it practical
4. If conditions are provided → reference them in your answer ("at 95°F ambient, you should...")
5. Always think about safety — if conditions are dangerous (high humidity, extreme temps), say so
6. If they share their equipment/chemical, tailor all advice to that specific setup`;

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const { messages, conditions } = await request.json() as {
      messages: ChatMessage[];
      conditions?: {
        ambient?: number;
        substrate?: number;
        humidity?: number;
        foamSystem?: string;
        substrateType?: string;
        shift?: string;
        recHoseTemp?: number;
        recDrumTemp?: number;
        recPressure?: number;
      };
    };

    if (!messages?.length) {
      return NextResponse.json(
        { success: false, error: { message: "No messages provided" } },
        { status: 400 }
      );
    }

    // Build condition context to inject
    let conditionContext = "";
    if (conditions) {
      const parts: string[] = [];
      if (conditions.ambient != null) parts.push(`Ambient: ${conditions.ambient}°F`);
      if (conditions.substrate != null) parts.push(`Substrate: ${conditions.substrate}°F`);
      if (conditions.humidity != null) parts.push(`Humidity: ${conditions.humidity}%`);
      if (conditions.foamSystem) {
        const name = conditions.foamSystem === "enverge_easyseal" ? "Enverge EasySeal .5" : conditions.foamSystem === "accufoam_af1" ? "AccuFoam AF1" : conditions.foamSystem;
        parts.push(`Foam: ${name}`);
      }
      if (conditions.substrateType) parts.push(`Substrate type: ${conditions.substrateType}`);
      if (conditions.shift) parts.push(`Shift: ${conditions.shift}`);
      if (conditions.recHoseTemp != null) parts.push(`Rec hose: ${conditions.recHoseTemp}°F`);
      if (conditions.recDrumTemp != null) parts.push(`Rec drum: ${conditions.recDrumTemp}°F`);
      if (parts.length > 0) {
        conditionContext = `\n\n[LIVE CONDITIONS FROM DIAL-IN: ${parts.join(" | ")}]`;
      }
    }

    // Fetch user's recent jobs for additional context
    const recentJobs = await prisma.foamJob.findMany({
      where: { userId: session.userId, companyId: session.companyId },
      orderBy: { date: "desc" },
      take: 3,
      select: {
        date: true,
        location: true,
        ambientTemp: true,
        humidity: true,
        hoseTempA: true,
        hoseTempB: true,
        problems: true,
        rating: true,
        foamSystem: { select: { manufacturer: true, product: true } },
      },
    });

    let jobContext = "";
    if (recentJobs.length > 0) {
      const jobLines = recentJobs.map((j) => {
        const parts: string[] = [];
        if (j.foamSystem) parts.push(`${j.foamSystem.manufacturer} ${j.foamSystem.product}`);
        if (j.ambientTemp != null) parts.push(`${j.ambientTemp}°F`);
        if (j.humidity != null) parts.push(`${j.humidity}% RH`);
        if (j.rating != null) parts.push(`rated ${j.rating}/5`);
        const probs = Array.isArray(j.problems) ? j.problems : [];
        if (probs.length > 0) parts.push(`issues: ${(probs as string[]).join(", ")}`);
        return `- ${j.location} (${new Date(j.date).toLocaleDateString()}): ${parts.join(", ")}`;
      });
      jobContext = `\n\n[INSTALLER'S RECENT JOBS:\n${jobLines.join("\n")}]`;
    }

    // Fetch user profile
    const user = await prisma.foamUser.findUnique({
      where: { id: session.userId },
      select: { name: true, role: true },
    });

    const userContext = user ? `\n\n[USER: ${user.name}, role: ${user.role}]` : "";

    const systemPrompt = FOAM_TECH_SYSTEM + conditionContext + jobContext + userContext;

    // Save user message to DB
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

    // Build the prompt: conversation history + latest message
    const conversationParts = messages.map((m) => {
      if (m.role === "user") return `Human: ${m.content}`;
      return `Assistant: ${m.content}`;
    });
    const cliPrompt = conversationParts.join("\n\n");

    // Stream response via Claude CLI (plain text mode — chunks arrive as stdout data)
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        const proc = spawn("claude", [
          "-p", cliPrompt,
          "--system-prompt", systemPrompt,
          "--model", "sonnet",
          "--verbose",
          "--output-format", "stream-json",
          "--no-session-persistence",
          "--max-turns", "1",
        ], {
          env: { ...process.env, TERM: "dumb" },
          stdio: ["ignore", "pipe", "pipe"],
        });

        let fullResponse = "";

        proc.stdout.on("data", (chunk: Buffer) => {
          const text = chunk.toString();
          const lines = text.split("\n").filter(Boolean);
          for (const line of lines) {
            try {
              const event = JSON.parse(line);
              // stream-json with --verbose emits various event types
              if (event.type === "assistant" && event.message?.content) {
                for (const block of event.message.content) {
                  if (block.type === "text" && block.text) {
                    fullResponse += block.text;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: block.text })}\n\n`)
                    );
                  }
                }
              } else if (event.type === "content_block_delta" && event.delta?.text) {
                fullResponse += event.delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                );
              } else if (event.type === "result" && event.result) {
                // Final text result
                const resultText = typeof event.result === "string" ? event.result : "";
                if (resultText && !fullResponse) {
                  fullResponse = resultText;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: resultText })}\n\n`)
                  );
                }
              }
            } catch {
              // Plain text fallback
              const trimmed = line.trim();
              if (trimmed) {
                fullResponse += trimmed + "\n";
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: trimmed + "\n" })}\n\n`)
                );
              }
            }
          }
        });

        proc.stderr.on("data", (chunk: Buffer) => {
          console.error("[FoamTech CLI stderr]", chunk.toString());
        });

        proc.on("close", async () => {
          // Save assistant response to DB
          if (fullResponse.trim()) {
            try {
              await prisma.foamChatMessage.create({
                data: {
                  userId: session.userId,
                  role: "assistant",
                  content: fullResponse.trim(),
                },
              });
            } catch (err) {
              console.error("[FoamTech DB save]", err);
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });

        proc.on("error", (err) => {
          console.error("[FoamTech CLI error]", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "FoamTech unavailable" })}\n\n`)
          );
          controller.close();
        });
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
    return NextResponse.json(
      { success: false, error: { message: "Chat failed" } },
      { status: 500 }
    );
  }
}

// GET: Fetch chat history for the user
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
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    console.error("[FoamTech GET]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to load history" } },
      { status: 500 }
    );
  }
}
