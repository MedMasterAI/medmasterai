import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/lib/sse';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  addClient(writer);

  writer.write(new TextEncoder().encode(`data: ${JSON.stringify({ progress: 0 })}\n\n`));

  req.signal.addEventListener('abort', () => {
    removeClient(writer);
    writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
