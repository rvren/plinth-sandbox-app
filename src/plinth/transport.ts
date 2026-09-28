import {
  createFetchConfigSource,
  createFetchHeatmapSink,
  createFetchPersonalTransport,
  tokenIdentity,
  createLocalStorageStore,
  globalPrivacyControl,
  secureRandom,
} from "@plinth/sdk-browser";
import type { PlinthTransport } from "@plinth/sdk-react";
import { API_BASES, PUBLISHABLE_KEY } from "./keys";
import { egressLog } from "./egress-log";

/**
 * The composition root for the SDK's transport — the only place Meridian touches the
 * network on plinth's behalf. Each call is logged for the demo inspector.
 *
 * The tenant token comes from Meridian's own backend (app/api/tenant-token), which holds
 * the secret key; it is cached for the day it is valid.
 */

const tokens = new Map<string, { token: string; validUntil: number }>();

const tenantToken = async (tenantId: string, userId?: string): Promise<string | undefined> => {
  const id = `${tenantId}/${userId ?? ""}`;
  const cached = tokens.get(id);
  if (cached && cached.validUntil > Date.now()) return cached.token;
  try {
    const query = new URLSearchParams({ tenant: tenantId, ...(userId ? { user: userId } : {}) });
    const response = await fetch(`/api/tenant-token?${query}`, { cache: "no-store" });
    if (!response.ok) return undefined;
    const body = (await response.json()) as { token: string; validUntil: string };
    tokens.set(id, { token: body.token, validUntil: Date.parse(body.validUntil) });
    return body.token;
  } catch {
    return undefined;
  }
};

const OPT_OUT_KEY = "meridian.plinth.optOut";

export const isOptedOut = (): boolean => {
  try {
    return globalPrivacyControl() || localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return globalPrivacyControl();
  }
};

export const setOptOut = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* storage blocked: nothing to remember */
  }
};

/**
 * `userId`: the signed-in person's email (here, the demo persona's synthetic one). A tenant with per-user
 * personalization turned on then gets that user's own page (ADR-041); any other tenant
 * ignores it, and the token names no one.
 */
export const createTransport = (tenantId: string, userId?: string): PlinthTransport => {
  const options = async () => ({ apiBase: API_BASES, publishableKey: PUBLISHABLE_KEY, tenantToken: await tenantToken(tenantId, userId) });
  // The token is fetched before the first config load, so by the time the SDK asks who this
  // is, the cached one answers — synchronously, as identity() must.
  const cachedToken = () => tokens.get(`${tenantId}/${userId ?? ""}`)?.token;
  return {
    source: {
      load: async (opts) => {
        const envelope = await createFetchConfigSource(await options()).load(opts);
        egressLog.add({
          method: "GET",
          path: "/v1/sdk/config",
          bytes: 0,
          body: null,
          outcome: envelope ? "signed config received" : "no config (API unreachable or refused)",
        });
        return envelope;
      },
    },
    sink: {
      send: async (report) => {
        const body = JSON.stringify(report);
        egressLog.add({ method: "POST", path: "/v1/sdk/heatmap", bytes: body.length, body, outcome: "sent, never retried" });
        await createFetchHeatmapSink(await options()).send(report);
      },
    },
    store: createLocalStorageStore(),
    rng: secureRandom(),
    optedOut: isOptedOut,
    personal: {
      identity: () => tokenIdentity(cachedToken()),
      overlay: async (opts) => {
        const envelope = await createFetchPersonalTransport(await options()).overlay(opts);
        egressLog.add({ method: "GET", path: "/v1/sdk/me", bytes: 0, body: null, outcome: envelope ? "your own page, signed" : "none — the tenant's page" });
        return envelope;
      },
      send: async (batch) => {
        const body = JSON.stringify(batch);
        egressLog.add({ method: "POST", path: "/v1/sdk/events", bytes: body.length, body, outcome: "counted keys, never retried" });
        await createFetchPersonalTransport(await options()).send(batch);
      },
    },
  };
};
