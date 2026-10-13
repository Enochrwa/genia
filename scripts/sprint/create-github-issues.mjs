// Creates milestones (one per sprint) and issues (one per story) from docs/01-product/sprints/backlog.json.
// Dry run by default. Usage:
//   node scripts/sprint/create-github-issues.mjs                       (print what would be created)
//   GITHUB_TOKEN=... node scripts/sprint/create-github-issues.mjs --apply [--repo owner/name]
import { readFileSync } from "node:fs";

const apply = process.argv.includes("--apply");
const repoArg = process.argv.indexOf("--repo");
const repo = repoArg > -1 ? process.argv[repoArg + 1] : "Enochrwa/genia";
const token = process.env.GITHUB_TOKEN;
const { epics, sprints, stories } = JSON.parse(
  readFileSync("docs/01-product/sprints/backlog.json", "utf8"),
);

if (apply && !token) {
  console.error("GITHUB_TOKEN is required with --apply");
  process.exit(1);
}

const api = async (method, path, body) => {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
};

const moneyRe = /ledger|wallet|payment|payout|withdraw|deposit|treasury|reconcil|settle|MoMo/i;
const securityRe = /security|2FA|KYC|fraud|PIN|session|OTP|abuse|pen test/i;

const titleFor = (s) => `${s.id}: ${s.title}`;
const labelsFor = (s) => {
  const l = [`epic:${s.epic}`, `size:${s.points}`];
  if (moneyRe.test(s.title)) l.push("money");
  if (securityRe.test(s.title)) l.push("security");
  return l;
};

console.log(
  `${apply ? "Creating" : "Dry run:"} ${sprints.length} milestones and ${stories.length} issues in ${repo}`,
);
const milestoneNumbers = new Map();
for (const sp of sprints) {
  const title = `Sprint ${sp.n}: ${sp.name}`;
  if (!apply) {
    console.log(`milestone  ${title} (due ${sp.end})`);
    continue;
  }
  const m = await api("POST", "/milestones", {
    title,
    description: sp.goal,
    due_on: `${sp.end}T23:59:59Z`,
  });
  milestoneNumbers.set(sp.n, m.number);
}
for (const s of stories) {
  const body = [
    `**Epic:** ${s.epic} ${epics[s.epic]}`,
    `**Sprint:** ${s.sprint}`,
    `**Points:** ${s.points}`,
    `**Owner role:** ${s.role}`,
    `**Depends on:** ${s.deps.length ? s.deps.join(", ") : "none"}`,
    "",
    "## Acceptance criteria",
    s.acceptance,
    "",
    "See docs/01-product/sprints for the sprint plan and definition of done.",
  ].join("\n");
  if (!apply) {
    console.log(`issue      ${titleFor(s)} [${labelsFor(s).join(", ")}]`);
    continue;
  }
  await api("POST", "/issues", {
    title: titleFor(s),
    body,
    labels: labelsFor(s),
    milestone: milestoneNumbers.get(s.sprint),
  });
}
