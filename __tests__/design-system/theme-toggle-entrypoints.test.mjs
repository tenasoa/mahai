import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = "C:\\Users\\Tenasoa\\Desktop\\Mah.AI\\mahai";

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readIfExists(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

test("shared theme toggle component exists and manages theme persistence", () => {
  const toggleComponent = readIfExists("components/layout/ThemeToggleButton.tsx");

  assert.notEqual(
    toggleComponent,
    "",
    "Expected a shared ThemeToggleButton component to exist",
  );
  assert.match(
    toggleComponent,
    /localStorage\.setItem\("theme", newTheme\)/,
    "Expected ThemeToggleButton to persist the theme choice",
  );
  assert.match(
    toggleComponent,
    /document\.documentElement\.setAttribute\("data-theme", newTheme\)/,
    "Expected ThemeToggleButton to update the document theme attribute",
  );
});

test("public navbar exposes the theme toggle in the logged-out shell", () => {
  const navbar = read("components/layout/LuxuryNavbar.tsx");

  assert.match(
    navbar,
    /import\s+\{\s*ThemeToggleButton\s*\}\s+from\s+"\.\/ThemeToggleButton"/,
    "Expected LuxuryNavbar to import ThemeToggleButton",
  );
  assert.match(
    navbar,
    /<ThemeToggleButton\s+variant="navbar"/,
    "Expected LuxuryNavbar to render the navbar theme toggle",
  );
});

test("auth pages share a layout-level theme toggle", () => {
  const authLayout = readIfExists("app/auth/layout.tsx");

  assert.notEqual(authLayout, "", "Expected app/auth/layout.tsx to exist");
  assert.match(
    authLayout,
    /import\s+\{\s*ThemeToggleButton\s*\}\s+from\s+"@\/components\/layout\/ThemeToggleButton"/,
    "Expected the auth layout to import ThemeToggleButton",
  );
  assert.match(
    authLayout,
    /<ThemeToggleButton\s+variant="floating"/,
    "Expected the auth layout to render the floating theme toggle",
  );
});
