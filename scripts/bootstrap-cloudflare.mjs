import { writeFile } from "node:fs/promises";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!accountId || !token) throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required");

const apiBase = "https://api.cloudflare.com/client/v4";
async function cf(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    const message = payload.errors?.map((error) => error.message).join("; ") || `Cloudflare API ${response.status}`;
    throw new Error(message);
  }
  return payload.result;
}

const databaseName = "daydanhvan-db";
const databaseList = await cf(`/accounts/${accountId}/d1/database?name=${encodeURIComponent(databaseName)}&per_page=100`);
let database = Array.isArray(databaseList) ? databaseList.find((item) => item.name === databaseName) : undefined;
if (!database) {
  database = await cf(`/accounts/${accountId}/d1/database`, {
    method: "POST",
    body: JSON.stringify({ name: databaseName })
  });
}
const databaseId = database.uuid ?? database.id;
if (!databaseId) throw new Error("Cloudflare D1 database ID was not returned");

const bucketName = "daydanhvan-media";
const bucketResult = await cf(`/accounts/${accountId}/r2/buckets`);
const buckets = Array.isArray(bucketResult) ? bucketResult : bucketResult?.buckets ?? [];
if (!buckets.some((bucket) => bucket.name === bucketName)) {
  await cf(`/accounts/${accountId}/r2/buckets`, {
    method: "POST",
    body: JSON.stringify({ name: bucketName })
  });
}

let workerSubdomain = null;
try {
  const subdomain = await cf(`/accounts/${accountId}/workers/subdomain`);
  workerSubdomain = subdomain?.subdomain ?? null;
} catch {
  // A custom domain can still be used when workers.dev is disabled.
}

await writeFile(
  "cloudflare-resources.json",
  JSON.stringify({ accountId, databaseName, databaseId, bucketName, workerSubdomain }, null, 2)
);
console.log(`D1: ${databaseName} (${databaseId})`);
console.log(`R2: ${bucketName}`);
if (workerSubdomain) console.log(`workers.dev subdomain: ${workerSubdomain}`);
