import React, { useEffect, useRef, useState } from "react";
import { FiImage, FiPrinter, FiSave } from "react-icons/fi";
import Header from "../../../components/Header/Header";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import { AppButton, AppCard, AppInput, LoadingState } from "../../../components/ui";
import {
  DEFAULT_APP_CONFIG,
  loadAppConfig,
  persistAppConfig,
  syncAppConfigFromServer,
} from "../../../utils/appConfig";
import { ErrorToast, SuccessToast, WarningToast } from "../../../utils/ShowToast";

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024; // ~1.5MB

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20";

const Config = () => {
  const cached = loadAppConfig();
  const fileRef = useRef(null);
  const [appName, setAppName] = useState(cached.appName);
  const [logoUrl, setLogoUrl] = useState(cached.logoUrl);
  const [companyAddress, setCompanyAddress] = useState(
    cached.companyAddress || ""
  );
  const [companyContact, setCompanyContact] = useState(
    cached.companyContact || ""
  );
  const [thermalWidthMm, setThermalWidthMm] = useState(
    String(cached.thermalWidthMm)
  );
  const [thermalFontSizePx, setThermalFontSizePx] = useState(
    String(cached.thermalFontSizePx)
  );
  const [defaultPrintFormat, setDefaultPrintFormat] = useState(
    cached.defaultPrintFormat
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await syncAppConfigFromServer();
        if (cancelled) return;
        setAppName(cfg.appName);
        setLogoUrl(cfg.logoUrl);
        setCompanyAddress(cfg.companyAddress || "");
        setCompanyContact(cfg.companyContact || "");
        setThermalWidthMm(String(cfg.thermalWidthMm));
        setThermalFontSizePx(String(cfg.thermalFontSizePx));
        setDefaultPrintFormat(cfg.defaultPrintFormat);
      } catch {
        // Keep local cache if backend is unreachable
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      WarningToast("Please select an image file");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      WarningToast("Logo image must be under 1.5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setLogoUrl(reader.result);
    };
    reader.onerror = () => ErrorToast("Failed to read logo file");
    reader.readAsDataURL(file);
  };

  const onSave = async (e) => {
    e.preventDefault();
    const width = Number(thermalWidthMm);
    const font = Number(thermalFontSizePx);
    if (!appName.trim()) {
      WarningToast("App name is required");
      return;
    }
    if (!Number.isFinite(width) || width < 48 || width > 120) {
      WarningToast("Thermal width must be between 48 and 120 mm");
      return;
    }
    if (!Number.isFinite(font) || font < 9 || font > 16) {
      WarningToast("Thermal font size must be between 9 and 16 px");
      return;
    }

    setSaving(true);
    try {
      await persistAppConfig({
        appName: appName.trim(),
        logoUrl: logoUrl.trim() || DEFAULT_APP_CONFIG.logoUrl,
        companyAddress: companyAddress.trim(),
        companyContact: companyContact.trim(),
        thermalWidthMm: width,
        thermalFontSizePx: font,
        defaultPrintFormat,
      });
      // Keep Counter Sale print-format preference in sync with default
      localStorage.setItem("gp-pos-print-format", defaultPrintFormat);
      SuccessToast("Settings saved");
    } catch (err) {
      ErrorToast(
        err?.response?.data?.error?.msg ||
          err?.message ||
          "Failed to save settings"
      );
    }
    setSaving(false);
  };

  const previewWidth = Math.min(
    120,
    Math.max(48, Number(thermalWidthMm) || 80)
  );
  const previewFont = Number(thermalFontSizePx) || 11;
  const isDataLogo = logoUrl.startsWith("data:");

  if (loading) {
    return (
      <BodyWrapper>
        <Header
          title="App Config"
          desc="Receipt branding and thermal print settings"
        />
        <LoadingState label="Loading settings…" />
      </BodyWrapper>
    );
  }

  return (
    <BodyWrapper>
      <Header
        title="App Config"
        desc="Receipt branding and thermal print settings for Counter Sale"
      >
        <AppButton
          type="button"
          variant="accent"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-2"
        >
          <FiSave className="text-base" />
          {saving ? "Saving…" : "Save settings"}
        </AppButton>
      </Header>

      <form onSubmit={onSave} className="pb-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
          <div className="space-y-5">
            <AppCard padding="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <FiImage />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Branding
                  </h2>
                  <p className="text-xs text-slate-500">
                    Shown on Counter Sale receipts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <AppInput
                  label="App / receipt name"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Golden Plus PCU"
                />

                <label className="block w-full">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Company address
                  </span>
                  <textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={2}
                    className={fieldClass}
                    placeholder="Shop / factory address"
                  />
                </label>

                <AppInput
                  label="Contact number"
                  value={companyContact}
                  onChange={(e) => setCompanyContact(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                />

                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Logo
                  </span>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                    <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:w-32">
                      <img
                        src={logoUrl || DEFAULT_APP_CONFIG.logoUrl}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_APP_CONFIG.logoUrl;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={onLogoFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        <FiImage className="text-lg text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          Upload logo
                        </span>
                        <span className="text-xs text-slate-500">
                          PNG, JPG, SVG · max 1.5 MB
                        </span>
                      </button>
                      <AppInput
                        label="Or logo path / URL"
                        value={isDataLogo ? "" : logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="/GoldenPCU.svg"
                        hint="Leave empty if you uploaded a file above."
                      />
                      {isDataLogo && (
                        <button
                          type="button"
                          onClick={() =>
                            setLogoUrl(DEFAULT_APP_CONFIG.logoUrl)
                          }
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Clear uploaded logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AppCard>

            <AppCard padding="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <FiPrinter />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Thermal printer
                  </h2>
                  <p className="text-xs text-slate-500">
                    Paper size and default Counter Sale format
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Paper width
                  </span>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {[58, 80].map((mm) => (
                      <button
                        key={mm}
                        type="button"
                        onClick={() => setThermalWidthMm(String(mm))}
                        className={[
                          "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                          Number(thermalWidthMm) === mm
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                        ].join(" ")}
                      >
                        {mm} mm
                      </button>
                    ))}
                  </div>
                  <AppInput
                    type="number"
                    min={48}
                    max={120}
                    step={1}
                    value={thermalWidthMm}
                    onChange={(e) => setThermalWidthMm(e.target.value)}
                    hint="Custom width allowed between 48–120 mm"
                  />
                </div>

                <AppInput
                  label="Font size (px)"
                  type="number"
                  min={9}
                  max={16}
                  step={1}
                  value={thermalFontSizePx}
                  onChange={(e) => setThermalFontSizePx(e.target.value)}
                  hint="Range 9–16"
                />

                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Default print format
                  </span>
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setDefaultPrintFormat("a4")}
                      className={[
                        "rounded-lg px-4 py-2 text-sm font-semibold transition",
                        defaultPrintFormat === "a4"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-800",
                      ].join(" ")}
                    >
                      A4
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultPrintFormat("thermal")}
                      className={[
                        "rounded-lg px-4 py-2 text-sm font-semibold transition",
                        defaultPrintFormat === "thermal"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-800",
                      ].join(" ")}
                    >
                      Thermal
                    </button>
                  </div>
                </div>
              </div>
            </AppCard>

            <div className="flex justify-end xl:hidden">
              <AppButton
                type="submit"
                variant="accent"
                disabled={saving}
                className="inline-flex items-center gap-2"
              >
                <FiSave className="text-base" />
                {saving ? "Saving…" : "Save settings"}
              </AppButton>
            </div>
          </div>

          <aside className="xl:sticky xl:top-4">
            <AppCard padding="p-5" className="bg-slate-50">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Live preview
                </h3>
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                  {previewWidth}mm · {previewFont}px
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0] p-4">
                <div
                  className="mx-auto bg-white p-3 text-black shadow-md"
                  style={{
                    width: `${previewWidth}mm`,
                    maxWidth: "100%",
                    fontSize: `${previewFont}px`,
                  }}
                >
                  <div className="border-b border-dashed border-black pb-2 text-center">
                    <img
                      src={logoUrl || DEFAULT_APP_CONFIG.logoUrl}
                      alt=""
                      className="mx-auto mb-1 h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="font-bold leading-tight">
                      {appName || "App name"}
                    </div>
                    {(companyAddress || companyContact) && (
                      <div className="mt-0.5 text-[10px] leading-snug text-slate-600">
                        {companyAddress ? <div>{companyAddress}</div> : null}
                        {companyContact ? (
                          <div>Tel: {companyContact}</div>
                        ) : null}
                      </div>
                    )}
                    <div className="mt-1 text-[10px] uppercase tracking-wide">
                      Sale Invoice
                    </div>
                  </div>
                  <div className="space-y-1 py-2 text-[0.95em]">
                    <div className="flex justify-between gap-2">
                      <span>Invoice #</span>
                      <span className="font-medium">1001</span>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-dashed border-slate-300 pt-1">
                      <span>Sample item × 1</span>
                      <span>1,200</span>
                    </div>
                    <div className="flex justify-between gap-2 font-semibold">
                      <span>Total</span>
                      <span>1,200</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Preview updates as you type. Save to apply for all users.
              </p>
            </AppCard>
          </aside>
        </div>
      </form>
    </BodyWrapper>
  );
};

export default Config;
