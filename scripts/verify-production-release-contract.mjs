import { readFile } from "node:fs/promises";

const canonicalOrigin = "https://daydanhvan.qs3d.site";

async function read(path) {
  return readFile(path, "utf8");
}

const [wrangler, mobileConfig, deployWorkflow, releaseWorkflow] = await Promise.all([
  read("wrangler.jsonc"),
  read("apps/mobile/src/config.ts"),
  read(".github/workflows/deploy-cloudflare.yml"),
  read(".github/workflows/mobile-release.yml")
]);

function requireMatch(label, value, pattern) {
  if (!pattern.test(value)) {
    throw new Error(`${label} does not satisfy production release contract`);
  }
}

requireMatch(
  "Cloudflare custom domain",
  wrangler,
  /"pattern"\s*:\s*"daydanhvan\.qs3d\.site"[\s\S]*?"custom_domain"\s*:\s*true/
);
requireMatch(
  "Mobile production origin",
  mobileConfig,
  /PRODUCTION_ORIGIN\s*=\s*"https:\/\/daydanhvan\.qs3d\.site"/
);
requireMatch(
  "Main-only Cloudflare deployment",
  deployWorkflow,
  /push:\s*\n\s*branches:\s*\[main\]/
);
requireMatch("Android APK release", releaseWorkflow, /daydanhvan-android-.*\.apk/);
requireMatch("Android AAB release", releaseWorkflow, /daydanhvan-android-.*\.aab/);
requireMatch("iOS Ad Hoc release", releaseWorkflow, /daydanhvan-ios-adhoc-.*\.ipa/);
requireMatch("iOS App Store release", releaseWorkflow, /daydanhvan-ios-appstore-.*\.ipa/);
requireMatch("Tag-scoped release", releaseWorkflow, /tags:\s*\n\s*-\s*"v\*"/);

console.log(`Production release contract verified for ${canonicalOrigin}`);
