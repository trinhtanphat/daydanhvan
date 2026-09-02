import { describe, expect, it } from "vitest";
import { normalizeRelease } from "./releases";

describe("normalizeRelease", () => {
  it("keeps only recognized install/distribution assets", () => {
    const normalized = normalizeRelease({
      tag_name: "v0.2.0",
      name: "Dạy đánh vần v0.2.0",
      published_at: "2026-09-02T00:00:00Z",
      html_url: "https://github.com/trinhtanphat/daydanhvan/releases/tag/v0.2.0",
      assets: [
        { name: "daydanhvan-android-v0.2.0.apk", browser_download_url: "https://example.test/app.apk", size: 101 },
        { name: "daydanhvan-android-v0.2.0.aab", browser_download_url: "https://example.test/app.aab", size: 102 },
        { name: "daydanhvan-ios-adhoc-v0.2.0.ipa", browser_download_url: "https://example.test/adhoc.ipa", size: 103 },
        { name: "daydanhvan-ios-appstore-v0.2.0.ipa", browser_download_url: "https://example.test/appstore.ipa", size: 104 },
        { name: "source-map.zip", browser_download_url: "https://example.test/map.zip", size: 105 }
      ]
    });

    expect(normalized.tagName).toBe("v0.2.0");
    expect(normalized.assets.map((asset) => asset.kind)).toEqual([
      "android-apk",
      "android-aab",
      "ios-adhoc",
      "ios-appstore"
    ]);
    expect(normalized.assets.every((asset) => asset.downloadUrl.startsWith("https://"))).toBe(true);
  });

  it("returns an empty asset list when a release has no supported binaries", () => {
    const normalized = normalizeRelease({
      tag_name: "v0.2.1",
      name: null,
      published_at: null,
      html_url: "https://github.com/trinhtanphat/daydanhvan/releases/tag/v0.2.1",
      assets: [{ name: "notes.txt", browser_download_url: "https://example.test/notes.txt", size: 3 }]
    });

    expect(normalized.name).toBe("v0.2.1");
    expect(normalized.assets).toEqual([]);
  });
});
