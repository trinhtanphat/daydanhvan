import app from "./index";
import { fetchLatestRelease } from "./releases";

app.get("/api/v1/releases/latest", async (c) => {
  try {
    const release = await fetchLatestRelease();
    c.header("Cache-Control", "public, max-age=120, s-maxage=300, stale-while-revalidate=300");
    return c.json(release);
  } catch {
    return c.json({ error: "release_metadata_unavailable" }, 502);
  }
});

export { ChatRoom } from "./index";
export default app;
