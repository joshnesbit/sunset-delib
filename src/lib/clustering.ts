/*
 * Opinion-group analysis, the Pol.is recipe at school scale:
 * vote matrix -> mean-imputed PCA (2 components) -> k-means, k in {2,3,4} chosen by silhouette.
 * Consensus = >=60% agree (or disagree) inside EVERY group. Role split computed alongside.
 * Pure functions: the same file runs in the browser now and in a server function later.
 */
import type { Role, Statement } from '@/data/statements';
import type { Vote } from '@/lib/store';

export const MIN_VOTES = 10;
export const MIN_PARTICIPANTS = 25;
const BAR = 0.6;
const MIN_N = 3;
/** Sessions whose typical gap between votes is under this are set aside: nobody reads a card that fast. */
const FAST_MS = 1000;

export function fastVoters(votes: Vote[]): Set<string> {
  const by = new Map<string, number[]>();
  for (const v of votes) {
    if (v.at <= 0) continue;
    if (!by.has(v.pid)) by.set(v.pid, []);
    by.get(v.pid)!.push(v.at);
  }
  const out = new Set<string>();
  for (const [pid, ts] of by) {
    if (ts.length < MIN_VOTES) continue;
    ts.sort((a, b) => a - b);
    const gaps = ts.slice(1).map((t, i) => t - ts[i]).sort((a, b) => a - b);
    if (gaps[Math.floor(gaps.length / 2)] < FAST_MS) out.add(pid);
  }
  return out;
}

export type Tally = { n: number; agree: number; disagree: number; pass: number; pa: number; pd: number };
export type Distinct = { sid: string; pa: number; restPa: number; pd: number; restPd: number };
export type Group = { index: number; members: string[]; roles: Record<Role, number>; distinctive: Distinct[] };
export type RoleRow = { sid: string; parent: number; staff: number };
export type Analysis = {
  eligible: number;
  roles: Record<Role, number>;
  k: number;
  groups: Group[];
  points: { x: number; y: number; g: number }[];
  consensus: { sid: string; dir: 'agree' | 'disagree'; min: number }[];
  divisive: { sid: string; spread: number; byGroup: number[] }[];
  roleAgree: RoleRow[];
  roleDiffer: RoleRow[];
  staffEnough: boolean;
  setAside: number;
};

type VoteMap = Map<string, Map<string, number>>;
type Pt = [number, number];

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const d2 = (a: Pt, b: Pt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function buildMap(votes: Vote[], live: Set<string>): VoteMap {
  const m: VoteMap = new Map();
  for (const v of votes) {
    if (!live.has(v.sid)) continue;
    let row = m.get(v.pid);
    if (!row) m.set(v.pid, (row = new Map()));
    row.set(v.sid, v.v);
  }
  return m;
}

export function countEligible(participants: { id: string }[], statements: Statement[], votes: Vote[]): number {
  const m = buildMap(votes, new Set(statements.map((s) => s.id)));
  const fast = fastVoters(votes);
  return participants.filter((p) => !fast.has(p.id) && (m.get(p.id)?.size ?? 0) >= MIN_VOTES).length;
}

function tally(m: VoteMap, pids: string[], sid: string): Tally {
  let agree = 0, disagree = 0, pass = 0;
  for (const p of pids) {
    const v = m.get(p)?.get(sid);
    if (v === undefined) continue;
    if (v === 1) agree++;
    else if (v === -1) disagree++;
    else pass++;
  }
  const n = agree + disagree + pass;
  return { n, agree, disagree, pass, pa: n ? agree / n : 0, pd: n ? disagree / n : 0 };
}

function components(X: number[][], m: number, count: number): number[][] {
  const C = Array.from({ length: m }, () => new Array(m).fill(0));
  for (const row of X) for (let i = 0; i < m; i++) if (row[i]) for (let j = 0; j < m; j++) C[i][j] += row[i] * row[j];
  const out: number[][] = [];
  for (let c = 0; c < count; c++) {
    let v = Array.from({ length: m }, (_, i) => 1 + ((i * 7 + c * 3) % 11) / 10);
    for (let it = 0; it < 120; it++) {
      const w = new Array(m).fill(0);
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) w[i] += C[i][j] * v[j];
      for (const u of out) {
        const d = dot(w, u);
        for (let i = 0; i < m; i++) w[i] -= d * u[i];
      }
      const norm = Math.sqrt(dot(w, w)) || 1;
      v = w.map((x) => x / norm);
    }
    out.push(v);
  }
  return out;
}

function kmeans(P: Pt[], k: number): number[] {
  let first = 0;
  P.forEach((p, i) => { if (p[0] > P[first][0]) first = i; });
  const cent: Pt[] = [[...P[first]] as Pt];
  while (cent.length < k) {
    let best = 0, bd = -1;
    P.forEach((p, i) => {
      const d = Math.min(...cent.map((c) => d2(p, c)));
      if (d > bd) { bd = d; best = i; }
    });
    cent.push([...P[best]] as Pt);
  }
  const assign = new Array(P.length).fill(-1);
  for (let it = 0; it < 60; it++) {
    let changed = false;
    P.forEach((p, i) => {
      let b = 0;
      for (let c = 1; c < k; c++) if (d2(p, cent[c]) < d2(p, cent[b])) b = c;
      if (b !== assign[i]) { assign[i] = b; changed = true; }
    });
    for (let c = 0; c < k; c++) {
      const mem = P.filter((_, i) => assign[i] === c);
      if (mem.length) cent[c] = [mem.reduce((s, p) => s + p[0], 0) / mem.length, mem.reduce((s, p) => s + p[1], 0) / mem.length];
    }
    if (!changed) break;
  }
  return assign;
}

function silhouette(P: Pt[], a: number[], k: number): number {
  let total = 0;
  P.forEach((p, i) => {
    const sum = new Array(k).fill(0), cnt = new Array(k).fill(0);
    P.forEach((q, j) => { if (i !== j) { sum[a[j]] += Math.sqrt(d2(p, q)); cnt[a[j]]++; } });
    const ai = cnt[a[i]] ? sum[a[i]] / cnt[a[i]] : 0;
    let bi = Infinity;
    for (let c = 0; c < k; c++) if (c !== a[i] && cnt[c]) bi = Math.min(bi, sum[c] / cnt[c]);
    total += (bi - ai) / Math.max(ai, bi) || 0;
  });
  return total / P.length;
}

export function analyze(participants: { id: string; role: Role }[], statements: Statement[], votes: Vote[]): Analysis | null {
  const sids = statements.map((s) => s.id);
  const m = buildMap(votes, new Set(sids));
  const fast = fastVoters(votes);
  const setAside = participants.filter((p) => fast.has(p.id)).length;
  const people = participants.filter((p) => !fast.has(p.id) && (m.get(p.id)?.size ?? 0) >= MIN_VOTES);
  if (people.length < 6) return null;

  const roles: Record<Role, number> = { parent: 0, staff: 0, both: 0 };
  people.forEach((p) => roles[p.role]++);

  const means = sids.map((sid) => {
    let s = 0, c = 0;
    for (const p of people) { const v = m.get(p.id)!.get(sid); if (v !== undefined) { s += v; c++; } }
    return c ? s / c : 0;
  });
  const X = people.map((p) => sids.map((sid, j) => (m.get(p.id)!.get(sid) ?? means[j]) - means[j]));
  const [c1, c2] = components(X, sids.length, 2);
  const P: Pt[] = X.map((r) => [dot(r, c1), dot(r, c2)]);

  let best = { k: 2, a: kmeans(P, 2), s: -Infinity };
  for (let k = 2; k <= 4 && people.length >= k * MIN_N; k++) {
    const a = kmeans(P, k);
    const sizes = Array.from({ length: k }, (_, c) => a.filter((x) => x === c).length);
    if (Math.min(...sizes) < MIN_N) continue;
    const s = silhouette(P, a, k);
    if (s > best.s) best = { k, a, s };
  }
  const k = best.k;
  const order = Array.from({ length: k }, (_, c) => c).sort(
    (x, y) => best.a.filter((v) => v === y).length - best.a.filter((v) => v === x).length
  );
  const remap = best.a.map((c) => order.indexOf(c));
  const all = people.map((p) => p.id);

  const groups: Group[] = order.map((_, gi) => {
    const mem = people.filter((_, i) => remap[i] === gi);
    const ids = mem.map((p) => p.id);
    const rest = all.filter((id) => !ids.includes(id));
    const r: Record<Role, number> = { parent: 0, staff: 0, both: 0 };
    mem.forEach((p) => r[p.role]++);
    const distinctive = sids
      .map((sid) => ({ sid, g: tally(m, ids, sid), o: tally(m, rest, sid) }))
      .filter((x) => x.g.n >= MIN_N && x.o.n >= MIN_N)
      .map((x) => ({ sid: x.sid, pa: x.g.pa, restPa: x.o.pa, pd: x.g.pd, restPd: x.o.pd }))
      .sort((a, b) => Math.max(Math.abs(b.pa - b.restPa), Math.abs(b.pd - b.restPd)) - Math.max(Math.abs(a.pa - a.restPa), Math.abs(a.pd - a.restPd)))
      .slice(0, 3);
    return { index: gi, members: ids, roles: r, distinctive };
  });

  const consensus: Analysis['consensus'] = [];
  const divisive: Analysis['divisive'] = [];
  for (const sid of sids) {
    const ts = groups.map((g) => tally(m, g.members, sid));
    if (ts.some((t) => t.n < MIN_N)) continue;
    const minA = Math.min(...ts.map((t) => t.pa)), minD = Math.min(...ts.map((t) => t.pd));
    if (minA >= BAR) consensus.push({ sid, dir: 'agree', min: minA });
    else if (minD >= BAR) consensus.push({ sid, dir: 'disagree', min: minD });
    const byGroup = ts.map((t) => t.pa);
    const spread = Math.max(...byGroup) - Math.min(...byGroup);
    if (spread >= 0.3) divisive.push({ sid, spread, byGroup });
  }
  consensus.sort((a, b) => b.min - a.min);
  divisive.sort((a, b) => b.spread - a.spread);

  const parents = people.filter((p) => p.role !== 'staff').map((p) => p.id);
  const staff = people.filter((p) => p.role !== 'parent').map((p) => p.id);
  const staffEnough = staff.length >= MIN_N && parents.length >= MIN_N;
  const roleAgree: RoleRow[] = [], roleDiffer: RoleRow[] = [];
  if (staffEnough) {
    for (const sid of sids) {
      const a = tally(m, parents, sid), b = tally(m, staff, sid);
      if (a.n < MIN_N || b.n < MIN_N) continue;
      const row = { sid, parent: a.pa, staff: b.pa };
      if (a.pa >= BAR && b.pa >= BAR) roleAgree.push(row);
      else if (Math.abs(a.pa - b.pa) >= 0.25) roleDiffer.push(row);
    }
    roleAgree.sort((x, y) => Math.min(y.parent, y.staff) - Math.min(x.parent, x.staff));
    roleDiffer.sort((x, y) => Math.abs(y.parent - y.staff) - Math.abs(x.parent - x.staff));
  }

  return {
    eligible: people.length, roles, k, groups,
    points: P.map((p, i) => ({ x: p[0], y: p[1], g: remap[i] })),
    consensus, divisive: divisive.slice(0, 5),
    roleAgree: roleAgree.slice(0, 6), roleDiffer: roleDiffer.slice(0, 5), staffEnough, setAside,
  };
}