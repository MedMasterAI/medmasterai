// src/lib/sse.ts
let clients: any[] = [];

export function addClient(writer: any) {
  clients.push(writer);
}

export function removeClient(writer: any) {
  clients = clients.filter(c => c !== writer);
}

export function sendProgress(progress: number) {
  clients.forEach(writer => {
    writer.write(encodeSSE({ progress }));
  });
}

function encodeSSE(data: any) {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}
