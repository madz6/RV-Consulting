import { eq } from "drizzle-orm";
import { db, artifacts } from "@/db";
import type { PackSnapshot } from "./composer";

export async function loadPack(id: number): Promise<{ version: number; status: string; snapshot: PackSnapshot } | null> {
  const [art] = await db.select().from(artifacts).where(eq(artifacts.id, id));
  if (!art) return null;
  return { version: art.version, status: art.status, snapshot: JSON.parse(art.snapshotJson) as PackSnapshot };
}
