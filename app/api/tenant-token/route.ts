import { regionOfKey } from "@plinth/contract/runtime";
/**
 * Meridian's backend, minting a plinth tenant token for its web app.
 *
 * This is the one server-side step a vendor adds: exchange the signed-in user's
 * organization for a day-scoped token, using a SECRET key that never reaches a browser.
 * (Meridian has no real login, so the organization comes from the demo's org switcher, and
 * the user from its persona switcher — a synthetic demo email on the reserved .example domain,
 * never a real person. plinth only ever sees an HMAC of it, and only for a tenant that turned
 * personalization on.)
 */

export const dynamic = "force-dynamic";

// DEVELOPMENT DEFAULT — matches the console's seeded test key. Real installs set PLINTH_SECRET_KEY.
const SECRET_KEY =
  process.env.PLINTH_SECRET_KEY ?? "sk_test_us_MrdnDevSLocalOnlySecretKeyDoNotUseInProduction00000";
// The key's region picks the API host, exactly as the browser SDK does.
const API = { us: process.env.PLINTH_API_US ?? "http://localhost:3200/api", eu: process.env.PLINTH_API_EU ?? "http://localhost:3201/api" }[
  regionOfKey(SECRET_KEY) ?? "us"
];

const TENANTS = new Set(["northwind", "contoso"]);

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const tenant = url.searchParams.get("tenant") ?? "";
  if (!TENANTS.has(tenant)) return Response.json({ error: "unknown organization" }, { status: 404 });
  const user = url.searchParams.get("user");
  if (user !== null && !/^[a-z]+@meridian\.example$/.test(user)) return Response.json({ error: "unknown user" }, { status: 404 });
  try {
    const response = await fetch(`${API}/v1/tenant-tokens`, {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET_KEY}`, "content-type": "application/json" },
      body: JSON.stringify(user ? { tenant, user } : { tenant }),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: "plinth refused the token request" }, { status: 502 });
    return Response.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "plinth unreachable" }, { status: 502 });
  }
};
