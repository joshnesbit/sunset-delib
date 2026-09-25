/*
 * Community Cloud: the "Sunset Schools Deliberation" backend.
 * Everything here is community-public: anyone with the app's ID can read it, and anonymous writes are open.
 * That's why statement approvals, hidden cards and group names only count when a steward created them.
 */
import { env } from '@/env';

/**
 * WHO CAN MODERATE. Put the sign-in emails (lowercase) of Josh and the FSK steward here.
 * Decisions are trusted only when their document is stamped with one of these.
 * If the platform stamps a display name instead of an email, list the exact sign-in names instead.
 */
export const STEWARDS: string[] = [];

const E = env as unknown as Record<string, string | undefined>;
export const cloudReady = Boolean(E.COMMUNITY_CLOUD_URL && E.APP_ID);

export type Doc<T> = {
  id: string;
  data: T;
  created_at?: string;
  member_name?: string;
  member_email?: string;
  member?: { email?: string; name?: string };
};

export async function cloudRequest<R = Record<string, unknown>>(
  action: string,
  collection: string,
  extra: Record<string, unknown> = {}
): Promise<R> {
  if (!cloudReady) throw new Error('Community Cloud is not connected.');
  const res = await fetch(E.COMMUNITY_CLOUD_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: E.APP_ID, app_key: E.APP_KEY, action, collection, ...extra }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error || `Couldn't reach the shared backend (${res.status}).`);
  return json as R;
}

/** Lists cap at 100, so page through a collection by createdAt until everything is in. */
export async function listAll<T extends { createdAt: number }>(collection: string): Promise<Doc<T>[]> {
  const out = new Map<string, Doc<T>>();
  let after = 0;
  for (let page = 0; page < 60; page++) {
    const { documents = [] } = await cloudRequest<{ documents?: Doc<T>[] }>('query', collection, {
      where: [{ field: 'createdAt', op: 'gte', value: after }],
      order: { field: 'createdAt', dir: 'asc', numeric: true },
      limit: 100,
    });
    let fresh = 0;
    for (const d of documents) if (!out.has(d.id)) { out.set(d.id, d); fresh++; }
    if (documents.length < 100 || !fresh) break;
    after = documents[documents.length - 1].data.createdAt;
  }
  return [...out.values()];
}

/** Who created a document, as the platform stamped it. */
export const stampOf = (d: Doc<unknown>) => (d.member_email ?? d.member?.email ?? d.member_name ?? '').toLowerCase();

export const isSteward = (who?: string | null) => !!who && STEWARDS.map((s) => s.toLowerCase()).includes(who.toLowerCase());