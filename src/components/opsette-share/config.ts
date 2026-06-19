// Opsette Share — per-app configuration for StartUp Planner.
// See ../../../_shared/opsette-share/INTEGRATION.md.

import type { OpsetteShareConfig } from "./config.template";

export type { OpsetteShareConfig };

export const opsetteShareConfig: OpsetteShareConfig = {
  appName: "StartUp Planner",
  tagline: "Build a realistic startup budget by industry, then export a clean PDF.",
  url: "https://tools.opsette.io/startup-planner/",
  logoSrc: "opsette-logo.png",
};
