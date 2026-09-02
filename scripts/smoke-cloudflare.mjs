const url = "https://daydanhvan.qs3d.site/api/v1/health";
let lastError;
for (let attempt = 1; attempt <= 12; attempt += 1) {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (response.ok) {
      const body = await response.json();
      if (body.ok === true && body.service === "daydanhvan-api") {
        console.log(`Health check passed: ${url}`);
        process.exit(0);
      }
      lastError = new Error(`Unexpected health payload: ${JSON.stringify(body)}`);
    } else {
      lastError = new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    lastError = error;
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
throw lastError ?? new Error("Cloudflare custom-domain health check failed");
