import { isAdminAuthenticated } from "@/lib/auth";
import { addSSEClient, removeSSEClient } from "@/lib/sse-emitter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/events
 *
 * Server-Sent Events endpoint.  The admin dashboard connects here once
 * and receives push events whenever a customer submits a form — even from
 * a completely different device / phone.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clientId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let client: { controller: ReadableStreamDefaultController; id: string } | null = null;

  const stream = new ReadableStream({
    start(controller) {
      client = { controller, id: clientId };
      addSSEClient(client);

      // Send an initial "connected" ping so the browser knows the stream is alive
      const ping = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(ping));

      // Keep-alive heartbeat every 25 seconds (prevents mobile proxies / browsers
      // from closing idle connections)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Store the interval on the client ref so we can clear it on close
      (client as any)._heartbeat = heartbeat;
    },

    cancel() {
      if (client) {
        clearInterval((client as any)._heartbeat);
        removeSSEClient(client);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering (important on some hosts)
    },
  });
}
