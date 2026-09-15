import { NextRequest } from "next/server";

// Guards every mutating route against a malformed or empty request body
// (e.g. a client navigating away mid-submit truncates the stream) so it
// fails as a clean 400 instead of an unhandled 500.
export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
