import type { PinnedKey, Region } from "@plinth/contract";

/**
 * How Meridian reaches plinth. These values are what the console's "Install SDK"
 * page hands a vendor.
 *
 * DEVELOPMENT VALUES. The publishable key matches the console's seeded test key (origin
 * http://localhost:3100 only); the pinned key matches its dev signing key. A real install
 * creates its keys on the console's API keys page.
 */
/** One API host per region; the SDK picks one from the region written into the key. */
export const API_BASES: Partial<Record<Region, string>> = {
  us: process.env.NEXT_PUBLIC_PLINTH_API_US ?? "http://localhost:3200/api",
  eu: process.env.NEXT_PUBLIC_PLINTH_API_EU ?? "http://localhost:3201/api",
};
export const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_PLINTH_KEY ?? "pk_test_us_MrdnDevPLocalOnlyPublishableKeyDoNotUseInProduction";
/** Active + next development signing keys (console → Install SDK → Signing keys). */
export const PINNED_KEYS: readonly PinnedKey[] = [
  { keyId: "k-dKM0HwJ1dSEj", publicKey: "dKM0HwJ1dSEjNDKUwMX_BwqPfY2pVoZKhRMpWK3nz_o" },
  { keyId: "k-PsPt3vDO1USb", publicKey: "PsPt3vDO1USbdWoTmYdM6ztCvYaBwxafxrgkJSX_PGw" },
];
