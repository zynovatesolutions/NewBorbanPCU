import { GetAppConfigApi, SaveAppConfigApi } from "../ApiRequests";

const CONFIG_KEY = "gp-app-config-v1";

export const DEFAULT_APP_CONFIG = {
  appName: "Golden Plus PCU",
  logoUrl: "/GoldenPCU.svg",
  companyAddress: "",
  companyContact: "",
  thermalWidthMm: 80,
  thermalFontSizePx: 11,
  defaultPrintFormat: "a4", // a4 | thermal
};

const strOr = (value, fallback) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export function normalizeAppConfig(parsed = {}) {
  return {
    ...DEFAULT_APP_CONFIG,
    ...parsed,
    thermalWidthMm: Math.min(
      120,
      Math.max(48, Number(parsed?.thermalWidthMm) || DEFAULT_APP_CONFIG.thermalWidthMm)
    ),
    thermalFontSizePx: Math.min(
      16,
      Math.max(9, Number(parsed?.thermalFontSizePx) || DEFAULT_APP_CONFIG.thermalFontSizePx)
    ),
    defaultPrintFormat:
      parsed?.defaultPrintFormat === "thermal" ? "thermal" : "a4",
    logoUrl: strOr(parsed?.logoUrl, DEFAULT_APP_CONFIG.logoUrl),
    appName: strOr(parsed?.appName, DEFAULT_APP_CONFIG.appName),
    companyAddress:
      typeof parsed?.companyAddress === "string"
        ? parsed.companyAddress.trim()
        : "",
    companyContact:
      typeof parsed?.companyContact === "string"
        ? parsed.companyContact.trim()
        : "",
  };
}

export function loadAppConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_APP_CONFIG };
    return normalizeAppConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_APP_CONFIG };
  }
}

export function saveAppConfig(config) {
  const next = normalizeAppConfig(config);
  localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  return next;
}

/** Load from backend and mirror into localStorage for Counter Sale / receipts. */
export async function syncAppConfigFromServer() {
  const { data } = await GetAppConfigApi();
  const payload = data?.data?.payload;
  if (!payload || typeof payload !== "object") {
    return loadAppConfig();
  }
  return saveAppConfig(payload);
}

/** Persist to backend, then local cache. */
export async function persistAppConfig(config) {
  const { data } = await SaveAppConfigApi(normalizeAppConfig(config));
  const payload = data?.data?.payload;
  if (!payload || typeof payload !== "object") {
    throw new Error(data?.error?.msg || "Failed to save settings");
  }
  return saveAppConfig(payload);
}

export function getThermalPageStyle(widthMm = DEFAULT_APP_CONFIG.thermalWidthMm) {
  const w = Math.min(120, Math.max(48, Number(widthMm) || 80));
  return `
  @page { margin: 0; size: ${w}mm auto; }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
    }
  }
`;
}
