import { getLiveSnapshot, subscribeLive } from "@/server/live/pulse";
import { bootNexusRuntime } from "@/server/live/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await bootNexusRuntime();

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("snapshot", getLiveSnapshot());

      const unsubscribe = subscribeLive((patch) => {
        try {
          send("patch", patch);
        } catch {
          cleanup?.();
        }
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeat);
          cleanup?.();
        }
      }, 15_000);

      cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
