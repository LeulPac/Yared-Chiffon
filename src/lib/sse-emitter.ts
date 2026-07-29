/**
 * Global SSE emitter — keeps a Set of active controller streams.
 * When a submission arrives, we call emitSubmissionEvent() to push
 * a real-time event to every connected admin browser tab / mobile browser.
 *
 * NOTE: This module-level singleton works perfectly in Next.js dev mode
 * and on single-instance Vercel deployments (Edge-less).
 */

type SSEClient = {
  controller: ReadableStreamDefaultController;
  id: string;
};

// Use globalThis to survive hot-reload in dev
const g = globalThis as any;
if (!g.__sseClients) {
  g.__sseClients = new Set<SSEClient>();
}

const clients: Set<SSEClient> = g.__sseClients;

export function addSSEClient(client: SSEClient) {
  clients.add(client);
}

export function removeSSEClient(client: SSEClient) {
  clients.delete(client);
}

export function emitSSEEvent(event: string, data: object) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const dead: SSEClient[] = [];

  for (const client of clients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(payload));
    } catch {
      // Client disconnected — clean up
      dead.push(client);
    }
  }

  for (const d of dead) {
    clients.delete(d);
  }
}

export function getSSEClientCount() {
  return clients.size;
}
