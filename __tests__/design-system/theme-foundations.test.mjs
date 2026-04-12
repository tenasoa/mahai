import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = "C:\\Users\\Tenasoa\\Desktop\\Mah.AI\\mahai";
const globalsPath = path.join(repoRoot, "app", "globals.css");
const dashboardThemePath = path.join(repoRoot, "app", "dashboard-theme.css");

const globalsCss = fs.readFileSync(globalsPath, "utf8");
const dashboardThemeCss = fs.readFileSync(dashboardThemePath, "utf8");

const sharedRootTokens = [
  "--void-rgb",
  "--depth-rgb",
  "--card-hover",
  "--lift",
  "--glow-sm",
  "--glow-md",
  "--glow-lg",
  "--ruby-dim",
  "--ruby-line",
  "--sage-dim",
  "--sage-line",
  "--amber-dim",
  "--amber-line",
  "--blue",
  "--blue-dim",
  "--blue-line",
  "--glass",
  "--sh-gold",
  "--sh-ruby",
  "--ease-out",
  "--ease-elastic",
];

const darkTokens = [
  "--void-rgb",
  "--depth-rgb",
  "--card-hover",
  "--lift",
  "--glow-md",
  "--blue",
  "--blue-dim",
  "--blue-line",
  "--glass",
];

function extractBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  return match?.[1] ?? "";
}

test("globals.css defines the shared runtime tokens consumed by the app", () => {
  for (const token of sharedRootTokens) {
    assert.match(
      globalsCss,
      new RegExp(`${token}\\s*:`),
      `Expected ${token} to be defined in app/globals.css`,
    );
  }
});

test("globals.css redefines critical theme tokens in the dark theme block", () => {
  const darkBlock = extractBlock(globalsCss, '[data-theme="dark"]');
  assert.notEqual(darkBlock, "", 'Expected a [data-theme="dark"] block in app/globals.css');

  for (const token of darkTokens) {
    assert.match(
      darkBlock,
      new RegExp(`${token}\\s*:`),
      `Expected ${token} to be redefined in the dark theme block`,
    );
  }
});

test("dashboard-theme.css is a compatibility layer and no longer redefines the app theme root", () => {
  assert.doesNotMatch(
    dashboardThemeCss,
    /(^|\n)\s*:root\s*\{/,
    "dashboard-theme.css should not define a competing :root theme block",
  );

  assert.doesNotMatch(
    dashboardThemeCss,
    /\[data-theme="light"\]\s*\{/,
    'dashboard-theme.css should not define a competing [data-theme="light"] block',
  );
});
