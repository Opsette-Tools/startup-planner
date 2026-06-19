// Loads the Opsette logo and caches it as a data URL + intrinsic dimensions.
//
// jsPDF's addImage needs the raw image bytes; a network <img> can race the
// render. Fetching once and caching the base64 data URL guarantees the bytes
// are in memory before we draw. We also read the natural width/height so the
// PDF can preserve the logo's aspect ratio.

const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
const LOGO_URL = `${base}opsette-logo.png`;

export interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
}

let cached: LoadedLogo | null = null;
let inflight: Promise<LoadedLogo | null> | null = null;

export function loadOpsetteLogo(): Promise<LoadedLogo | null> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;

  inflight = fetch(LOGO_URL)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<LoadedLogo | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const img = new Image();
            img.onload = () => {
              cached = { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
              resolve(cached);
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }),
    )
    .catch(() => {
      // Never block the export on a logo failure — fall back to no logo.
      inflight = null;
      return null;
    });

  return inflight;
}
