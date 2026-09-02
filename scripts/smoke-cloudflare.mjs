import { readFile } from "node:fs/promises";

const resources = JSON.parse(await readFile("cloudflare-resources.json", "utf8"));
if (!resources.workerSubdomain) {
  console.log("workers.dev subdomain unavailable; skipping public health smoke test");
  process.exit(0);
}
const url = `https://daydanhvan.${resources.workerSubdomain}.workers.dev/api/v1/health`;
let lastError;
for (let attempt = 1; attempt <= 8; attempt += 1) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const body = await response.json();
      if (body.ok === true && body.service === "daydanhvan-api") {
        console.log(`Health check passed: ${url}`);
        process.exit(0);
      }
    }
    lastError = new Error(`HTTP ${response.status}`);
  } catch (error) {
    lastError = error;
  }
  await new Promise((resolve) => setTimeout(resolve, 4000));
}
throw lastError ?? new Error("Cloudflare health check failed");
