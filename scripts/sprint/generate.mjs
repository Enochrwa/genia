// Validates docs/01-product/sprints/backlog.json and generates the sprint documents.
// Usage: node scripts/sprint/generate.mjs          (write files)
//        node scripts/sprint/generate.mjs --check  (validate and fail if generated files are stale)
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const dir = "docs/01-product/sprints";
const check = process.argv.includes("--check");
const data = JSON.parse(readFileSync(join(dir, "backlog.json"), "utf8"));
const { meta, epics, sprints, stories, releaseTwo } = data;

// ---------- validation ----------
const errors = [];
const byId = new Map();
for (const s of stories) {
  if (byId.has(s.id)) errors.push(`duplicate story id ${s.id}`);
  byId.set(s.id, s);
  if (!meta.pointScale.includes(s.points))
    errors.push(`${s.id}: ${s.points} points is not on the scale ${meta.pointScale}`);
  if (!epics[s.epic]) errors.push(`${s.id}: unknown epic ${s.epic}`);
  if (!sprints[s.sprint]) errors.push(`${s.id}: unknown sprint ${s.sprint}`);
  if (!s.acceptance) errors.push(`${s.id}: missing acceptance criteria`);
  if (s.status !== undefined && !["done", "in-progress"].includes(s.status))
    errors.push(`${s.id}: unknown status ${s.status}`);
}
for (const s of stories) {
  for (const d of s.deps) {
    const dep = byId.get(d);
    if (!dep) errors.push(`${s.id}: dependency ${d} does not exist`);
    else if (dep.sprint > s.sprint)
      errors.push(
        `${s.id} (sprint ${s.sprint}) depends on ${d} planned later (sprint ${dep.sprint})`,
      );
  }
}
// cycle detection
const state = new Map();
function visit(id, path) {
  if (state.get(id) === 2) return;
  if (state.get(id) === 1) {
    errors.push(`dependency cycle: ${[...path, id].join(" -> ")}`);
    return;
  }
  state.set(id, 1);
  for (const d of byId.get(id)?.deps ?? []) if (byId.has(d)) visit(d, [...path, id]);
  state.set(id, 2);
}
for (const s of stories) visit(s.id, []);

const load = sprints.map((sp) =>
  stories.filter((s) => s.sprint === sp.n).reduce((a, s) => a + s.points, 0),
);
sprints.forEach((sp, i) => {
  const limit = Math.floor(sp.capacity * meta.commitmentLimit);
  if (load[i] > limit)
    errors.push(
      `sprint ${i}: committed ${load[i]} exceeds ${meta.commitmentLimit * 100}% of capacity ${sp.capacity} (limit ${limit})`,
    );
  if (load[i] === 0) errors.push(`sprint ${i}: no stories`);
});

// critical path: longest chain of dependent story points
const memo = new Map();
function chain(id) {
  if (memo.has(id)) return memo.get(id);
  const s = byId.get(id);
  let best = { pts: s.points, path: [id] };
  for (const d of s.deps) {
    const c = chain(d);
    if (c.pts + s.points > best.pts) best = { pts: c.pts + s.points, path: [...c.path, id] };
  }
  memo.set(id, best);
  return best;
}
let critical = { pts: 0, path: [] };
if (errors.length === 0)
  for (const s of stories) {
    const c = chain(s.id);
    if (c.pts > critical.pts) critical = c;
  }

if (errors.length) {
  console.error("Backlog validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

// ---------- rendering ----------
const fmt = (d) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const pct = (a, b) => `${Math.round((a / b) * 100)}%`;
const nn = (n) => String(n).padStart(2, "0");
const files = new Map();

const totalPts = stories.reduce((a, s) => a + s.points, 0);
const donePts = (list) => list.filter((s) => s.status === "done").reduce((a, s) => a + s.points, 0);
const label = (s) =>
  s.status === "done" ? "Done" : s.status === "in-progress" ? "In progress" : "To do";
const totalCap = sprints.reduce((a, s) => a + s.capacity, 0);

// overview
{
  let md = `# Sprint Plan\n\n> Generated from [backlog.json](backlog.json) by \`scripts/sprint/generate.mjs\`. Edit the JSON, then run \`node scripts/sprint/generate.mjs\`. CI fails if the generated files are stale or the plan breaks its own rules.\n\n`;
  md += `## Summary\n\n`;
  md += `- Cadence: ${sprints.length} sprints of ${meta.sprintLengthDays / 7} weeks, ${fmt(sprints[0].start)} to ${fmt(sprints.at(-1).end)}\n`;
  md += `- Scope: ${stories.length} stories, ${totalPts} story points planned against ${totalCap} points of capacity (${pct(totalPts, totalCap)})\n`;
  md += `- Rule: commit at most ${meta.commitmentLimit * 100}% of capacity per sprint; the rest is buffer for bugs, reviews and surprises\n`;
  md += `- Team assumed: ${meta.team}\n`;
  md += `- Target: Rwanda private beta in sprint 14 (${fmt(sprints[14].start)}), public launch gate in sprint 15 (${fmt(sprints[15].end)}), subject to the legal gate\n\n`;
  md += `## Sprint overview\n\n| Sprint | Dates | Goal | Committed | Capacity | Load |\n|---|---|---|---:|---:|---:|\n`;
  for (const sp of sprints)
    md += `| [${sp.n}](sprint-${nn(sp.n)}.md) ${sp.name} | ${fmt(sp.start)} to ${fmt(sp.end)} | ${sp.goal} | ${load[sp.n]} | ${sp.capacity} | ${pct(load[sp.n], sp.capacity)} |\n`;
  md += `\n## Progress\n\n${donePts(stories)} of ${totalPts} points done (${pct(donePts(stories), totalPts)}).\n\n| Sprint | Done | In progress | To do |\n|---|---:|---:|---:|\n`;
  for (const sp of sprints) {
    const ss = stories.filter((s) => s.sprint === sp.n);
    const done = donePts(ss);
    const prog = ss.filter((s) => s.status === "in-progress").reduce((a, s) => a + s.points, 0);
    md += `| ${sp.n} | ${done} | ${prog} | ${load[sp.n] - done - prog} |\n`;
  }
  md += `\n## Release milestones\n\n| Milestone | Sprint | What it means |\n|---|---|---|\n`;
  md += `| M0 Foundations | 0 | Legal engaged, payout model signed, CI and scaffolds running |\n`;
  md += `| M1 Money core | 4 | Ledger, wallet and sandbox deposits work end to end |\n`;
  md += `| M2 Playable | 7 | A player can play and see results; staff can log in with 2FA |\n`;
  md += `| M3 Payable | 8 | Sandbox payouts complete; admin manages users and questions |\n`;
  md += `| M4 Controlled | 10 | Dual control, reconciliation, treasury caps, KYC and fraud flags |\n`;
  md += `| M5 Safe | 12 | Responsible play, security review, load, DR and legal pages done |\n`;
  md += `| M6 Private beta | 14 | Invited users, real money, low caps |\n`;
  md += `| M7 Launch gate | 15 | Launch checklist ticked and production deploy proven |\n\n`;
  md += `## Epics\n\n| Epic | Name | Stories | Points | Sprints |\n|---|---|---:|---:|---|\n`;
  for (const [k, name] of Object.entries(epics)) {
    const ss = stories.filter((s) => s.epic === k);
    const sp = [...new Set(ss.map((s) => s.sprint))].sort((a, b) => a - b);
    md += `| ${k} | ${name} | ${ss.length} | ${ss.reduce((a, s) => a + s.points, 0)} | ${sp.join(", ")} |\n`;
  }
  md += `\n## Critical path\n\nLongest chain of dependent work (${critical.pts} points): ${critical.path.map((id) => `${id}`).join(" -> ")}.\n\n`;
  md +=
    critical.path
      .map((id) => `- ${id}: ${byId.get(id).title} (sprint ${byId.get(id).sprint})`)
      .join("\n") + "\n\n";
  md += `Delays on this chain move the launch date. Protect it first when capacity drops.\n\n`;
  md += `## Capacity adjustments\n\n| Sprint | Note |\n|---|---|\n`;
  for (const sp of sprints)
    if (sp.capacityNote && !sp.capacityNote.startsWith("Normal"))
      md += `| ${sp.n} | ${sp.capacityNote} |\n`;
  md += `\nVerify public holidays against the official Rwandan calendar before each sprint planning.\n\n`;
  md += `## Plan assumptions and decisions\n\n`;
  md += `1. **MTN MoMo first.** Launch uses MTN MoMo only. Airtel Money collections and payouts (R-001, R-002) are a fast follow. If the owner needs Airtel at launch, add about two sprints.\n`;
  md += `2. **Legal gate.** Real money stays behind the country feature flag. If counsel's opinion or licensing is not complete by sprint 12, the beta and launch slip and the product can run in free-to-play mode (see \`docs/08-compliance\`).\n`;
  md += `3. **Payout model.** Sprint 0 must fix the meaning of "200%" and partial results (G-003). Game configuration (G-041) and prize logic depend on it.\n`;
  md += `4. **Migration.** Existing IHUGURE balances migrate only when provable against payment records (G-101).\n`;
  md += `5. **Content is capacity.** Question writing and review uses the content and operations person; if that role is missing, the pool targets in G-044 and G-055 will not be met.\n`;
  md += `6. **Estimates are relative.** Points use ${meta.pointScale.join(", ")}; 1 point is roughly half an ideal day. Re-estimate after sprint 2 using measured velocity.\n\n`;
  md += `## If the team is smaller\n\nThe plan scales with velocity. Planned work is ${totalPts} points.\n\n| Team | Velocity per sprint | Sprints needed (at 90% commitment) | Approx. duration |\n|---|---:|---:|---|\n`;
  md += `| Baseline team (this plan, includes ramp-up and holiday dips) | 34 peak | ${sprints.length} | about ${Math.round((sprints.length * 2) / 4.33)} months |\n`;
  for (const [label, v] of [
    ["2 full-time engineers", 22],
    ["1 full-time engineer", 12],
    ["1 part-time engineer (about 15 h per week)", 6],
  ]) {
    const n = Math.ceil(totalPts / (v * 0.9));
    md += `| ${label} | ${v} | ${n} | about ${Math.round((n * 2) / 4.33)} months |\n`;
  }
  md += `\nFor a solo or part-time team, cut scope instead of stretching dates: launch with one category, a smaller admin and manual payout approval first, and keep the money-critical items (ledger, payments, game integrity, reconciliation, legal gate) intact.\n\n`;
  md += `## Release 2 backlog (not scheduled)\n\nEpic-sized items; split and estimate them when they enter a sprint.\n\n| ID | Item | Points | Why |\n|---|---|---:|---|\n`;
  for (const r of releaseTwo) md += `| ${r.id} | ${r.title} | ${r.points} | ${r.why} |\n`;
  md += `\nSee also [process and ceremonies](README.md).\n`;
  files.set("sprint-plan.md", md);
}

// per sprint
for (const sp of sprints) {
  const ss = stories.filter((s) => s.sprint === sp.n);
  let md = `# Sprint ${sp.n}: ${sp.name}\n\n`;
  md += `- Dates: ${fmt(sp.start)} to ${fmt(sp.end)}\n- Capacity: ${sp.capacity} points; committed: ${load[sp.n]} (${pct(load[sp.n], sp.capacity)}); done: ${donePts(ss)}\n- Capacity note: ${sp.capacityNote}\n\n`;
  md += `## Sprint goal\n\n${sp.goal}.\n\n## Stories\n\n| ID | Epic | Story | Points | Owner role | Depends on | Status |\n|---|---|---|---:|---|---|---|\n`;
  for (const s of ss)
    md += `| ${s.id} | ${s.epic} | ${s.title} | ${s.points} | ${s.role} | ${s.deps.length ? s.deps.join(", ") : "none"} | ${label(s)} |\n`;
  md += `\n## Acceptance criteria\n\n`;
  for (const s of ss)
    md += `- **${s.id}**: ${s.acceptance}${s.note ? `\n  - Status note: ${s.note}` : ""}\n`;
  md += `\n## Sprint review demo\n\n${sp.demo}.\n\n## Risks\n\n${sp.risks}.\n\n`;
  const carry = ss.filter((s) => s.deps.some((d) => byId.get(d).sprint === sp.n));
  if (carry.length)
    md += `## Intra-sprint dependencies\n\nThese stories depend on work finishing earlier in the same sprint, so sequence them accordingly: ${carry.map((s) => s.id).join(", ")}.\n\n`;
  md += `## Exit criteria\n\n- Every story meets the [definition of done](README.md#definition-of-done)\n- Sprint goal demonstrated at review\n- Money-critical changes reviewed by a second engineer\n- Docs and ADRs updated where behaviour changed\n- Retrospective actions recorded\n\n`;
  md += `Navigation: ${sp.n > 0 ? `[previous](sprint-${nn(sp.n - 1)}.md) | ` : ""}[plan](sprint-plan.md)${sp.n < sprints.length - 1 ? ` | [next](sprint-${nn(sp.n + 1)}.md)` : ""}\n`;
  files.set(`sprint-${nn(sp.n)}.md`, md);
}

// ---------- write or check ----------
let stale = 0;
for (const [name, content] of files) {
  const p = join(dir, name);
  if (check) {
    if (!existsSync(p) || readFileSync(p, "utf8") !== content) {
      console.error(`stale: ${p}`);
      stale++;
    }
  } else writeFileSync(p, content);
}
if (check) {
  const known = new Set([...files.keys(), "README.md", "backlog.json"]);
  for (const f of readdirSync(dir))
    if (!known.has(f) && !/^sprint-\d\d-review\.md$/.test(f)) {
      console.error(`unexpected file: ${f}`);
      stale++;
    }
  if (stale) {
    console.error("Run: node scripts/sprint/generate.mjs");
    process.exit(1);
  }
}
console.log(
  `${check ? "validated" : "generated"} ${files.size} files; ${stories.length} stories, ${totalPts}/${totalCap} points, critical path ${critical.pts} points`,
);
