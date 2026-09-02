export const PRODUCTION_ORIGIN = "https://daydanhvan.qs3d.site";

export function getApiBaseUrl(override = process.env.EXPO_PUBLIC_API_URL): string {
  const candidate = override?.trim().replace(/\/$/, "");
  return candidate || PRODUCTION_ORIGIN;
}

export function getHealthUrl(override = process.env.EXPO_PUBLIC_API_URL): string {
  return `${getApiBaseUrl(override)}/api/v1/health`;
}
