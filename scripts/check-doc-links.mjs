// Verifies that relative links in Markdown files point at files or directories that exist.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const root = process.cwd();
const skip = new Set(["node_modules", ".git", "dist", ".next", "coverage"]);
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".md")) files.push(p);
  }
})(root);

const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let broken = 0;
for (const f of files) {
  const text = readFileSync(f, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const m of text.matchAll(linkRe)) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = target.split("#")[0];
    if (!path) continue;
    const abs = resolve(dirname(f), path);
    if (!existsSync(abs)) {
      console.error(`${f}: broken link -> ${target}`);
      broken++;
    }
  }
}
if (broken) {
  console.error(`${broken} broken link(s)`);
  process.exit(1);
}
console.log(`checked ${files.length} markdown files: all relative links resolve`);
