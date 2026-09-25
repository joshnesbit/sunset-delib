/*
 * DEMO VOTES — synthetic, NOT FSK responses. Used only at /report?demo=1 so a room can
 * watch the clustering work. Never written to the store, never shown in the real report.
 */
import { SEED_STATEMENTS, type Lean, type Role } from '@/data/statements';
import type { Vote } from '@/lib/store';

type Arch = Record<Lean, number>;
const ARCHETYPES: Arch[] = [
  { more: 0.15, limits: 0.85, conditional: 0.7 },
  { more: 0.85, limits: 0.2, conditional: 0.55 },
  { more: 0.5, limits: 0.45, conditional: 0.85 },
];
const SHARED = new Set(['w4', 'f1', 't1', 'f2']);

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoData(): { participants: { id: string; role: Role }[]; votes: Vote[] } {
  const r = rng(20270301);
  const participants: { id: string; role: Role }[] = [];
  const votes: Vote[] = [];
  for (let i = 0; i < 72; i++) {
    const x = r();
    const role: Role = x < 0.68 ? 'parent' : x < 0.9 ? 'staff' : 'both';
    const arch = ARCHETYPES[role === 'staff' && r() < 0.5 ? 2 : Math.floor(r() * 3)];
    const id = 'demo-' + i;
    participants.push({ id, role });
    for (const s of SEED_STATEMENTS) {
      if (r() > 0.8) continue;
      const p = SHARED.has(s.id) ? 0.88 : arch[s.lean ?? 'conditional'];
      const y = r();
      const v = y < p ? 1 : y < p + (1 - p) * 0.25 ? 0 : -1;
      votes.push({ pid: id, sid: s.id, v: v as Vote['v'], at: 0 });
    }
  }
  return { participants, votes };
}