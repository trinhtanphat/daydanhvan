import { readFile, writeFile } from "node:fs/promises";

const base = JSON.parse(await readFile("wrangler.jsonc", "utf8"));
const resources = JSON.parse(await readFile("cloudflare-resources.json", "utf8"));
base.d1_databases = [
  {
    binding: "DB",
    database_name: resources.databaseName,
    database_id: resources.databaseId,
    migrations_dir: "migrations"
  }
];
base.r2_buckets = [
  {
    binding: "MEDIA",
    bucket_name: resources.bucketName
  }
];
await writeFile("wrangler.generated.json", JSON.stringify(base, null, 2));
console.log("Generated wrangler.generated.json with D1 and R2 bindings");
