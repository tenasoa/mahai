import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = "C:\\Users\\Tenasoa\\Desktop\\Mah.AI\\mahai";

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const navbarCss = read("components/layout/LuxuryNavbar.module.css");
const footerCss = read("components/layout/LuxuryFooter.module.css");
const landingCss = read("app/landing.css");
const cursorTsx = read("components/layout/LuxuryCursor.tsx");
const footerTsx = read("components/layout/LuxuryFooter.tsx");

test("navbar module exposes the class names used by the component", () => {
  for (const className of [
    ".navScrolled",
    ".navTransparent",
    ".navLinkActive",
    ".dropdownLinkActive",
    ".dropdownButtonDanger",
    ".authLinkPrimary",
  ]) {
    assert.match(
      navbarCss,
      new RegExp(`\\${className}\\s*\\{`),
      `Expected ${className} to exist in LuxuryNavbar.module.css`,
    );
  }
});

test("footer module exposes the class names used by the component", () => {
  for (const className of [
    ".footerGrid",
    ".footerBrand",
    ".footerLogo",
    ".footerTagline",
    ".paymentBadge",
    ".footerColTitle",
    ".footerLinks",
    ".footerBottom",
    ".footerCopy",
    ".footerLegal",
    ".logoGem",
  ]) {
    assert.match(
      footerCss,
      new RegExp(`\\${className}\\s*\\{`),
      `Expected ${className} to exist in LuxuryFooter.module.css`,
    );
  }

  assert.match(
    footerTsx,
    /styles\.logoGem/,
    "Expected LuxuryFooter.tsx to use the module-scoped logo gem class",
  );
});

test("landing.css no longer hides the native pointer per component", () => {
  assert.doesNotMatch(
    landingCss,
    /cursor:\s*none\s*;/,
    "Landing styles should not scatter cursor:none declarations across CTA and footer elements",
  );
});

test("LuxuryCursor manages a global custom-cursor flag for consistent pointer behavior", () => {
  assert.match(
    cursorTsx,
    /setAttribute\("data-custom-cursor", "true"\)/,
    "Expected LuxuryCursor to enable a global custom cursor flag",
  );

  assert.match(
    cursorTsx,
    /removeAttribute\("data-custom-cursor"\)/,
    "Expected LuxuryCursor cleanup to remove the global custom cursor flag",
  );
});
