/**
 * A record of every request the SDK transport makes, for the demo inspector.
 *
 * Meridian's own code, not the SDK's: it wraps the transport ports, so what it shows is
 * exactly what the transport was given to send.
 */

export type EgressEntry = {
  id: number;
  at: string;
  method: "GET" | "POST";
  path: string;
  bytes: number;
  body: string | null;
  outcome: string;
};

type Listener = (entries: readonly EgressEntry[]) => void;

let entries: EgressEntry[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

export const egressLog = {
  add(entry: Omit<EgressEntry, "id" | "at">): void {
    entries = [{ ...entry, id: nextId++, at: new Date().toISOString() }, ...entries].slice(0, 50);
    for (const listener of listeners) listener(entries);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(entries);
    return () => void listeners.delete(listener);
  },
};
