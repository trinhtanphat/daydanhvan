export type ReleaseAssetKind = "android-apk" | "android-aab" | "ios-adhoc" | "ios-appstore";

export type NormalizedReleaseAsset = {
  name: string;
  kind: ReleaseAssetKind;
  downloadUrl: string;
  size: number;
};

export type NormalizedRelease = {
  tagName: string;
  name: string;
  publishedAt: string | null;
  releaseUrl: string;
  assets: NormalizedReleaseAsset[];
};

type GitHubAsset = {
  name?: unknown;
  browser_download_url?: unknown;
  size?: unknown;
};

type GitHubRelease = {
  tag_name?: unknown;
  name?: unknown;
  published_at?: unknown;
  html_url?: unknown;
  assets?: unknown;
};

function classifyAsset(name: string): ReleaseAssetKind | null {
  if (/^daydanhvan-android-.+\.apk$/i.test(name)) return "android-apk";
  if (/^daydanhvan-android-.+\.aab$/i.test(name)) return "android-aab";
  if (/^daydanhvan-ios-adhoc-.+\.ipa$/i.test(name)) return "ios-adhoc";
  if (/^daydanhvan-ios-appstore-.+\.ipa$/i.test(name)) return "ios-appstore";
  return null;
}

export function normalizeRelease(payload: GitHubRelease): NormalizedRelease {
  const tagName = typeof payload.tag_name === "string" ? payload.tag_name : "unknown";
  const name = typeof payload.name === "string" && payload.name.trim() ? payload.name : tagName;
  const publishedAt = typeof payload.published_at === "string" ? payload.published_at : null;
  const releaseUrl = typeof payload.html_url === "string" ? payload.html_url : "";
  const assets = Array.isArray(payload.assets) ? payload.assets : [];

  const normalizedAssets: NormalizedReleaseAsset[] = [];
  for (const raw of assets as GitHubAsset[]) {
    const assetName = typeof raw.name === "string" ? raw.name : "";
    const downloadUrl = typeof raw.browser_download_url === "string" ? raw.browser_download_url : "";
    const kind = classifyAsset(assetName);
    if (!kind || !downloadUrl.startsWith("https://")) continue;
    normalizedAssets.push({
      name: assetName,
      kind,
      downloadUrl,
      size: typeof raw.size === "number" && Number.isFinite(raw.size) ? raw.size : 0
    });
  }

  return { tagName, name, publishedAt, releaseUrl, assets: normalizedAssets };
}

export async function fetchLatestRelease(): Promise<NormalizedRelease> {
  const response = await fetch("https://api.github.com/repos/trinhtanphat/daydanhvan/releases/latest", {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "daydanhvan-worker"
    },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!response.ok) {
    throw new Error(`github_release_http_${response.status}`);
  }
  return normalizeRelease(await response.json<GitHubRelease>());
}
