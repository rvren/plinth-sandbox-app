"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TENANTS, useDemo, type TenantId } from "../demo/DemoContext";

/**
 * Meridian's own navigation. Meridian is the vendor's product — a separate application
 * from the plinth console — and links only to its own pages.
 *
 * `data-plinth-key` marks elements the heatmap may attribute a click to. Only keys the
 * console registered count; anything else is recorded as "no click".
 */

const LINKS = [
  { href: "/", label: "Dashboard", key: "nav.dashboard" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const demo = useDemo();

  return (
    <aside
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        padding: "var(--space-4) var(--space-3)",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 var(--space-2) var(--space-4)" }}>
        <span
          aria-hidden
          style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, var(--color-accent), var(--color-positive))" }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: 0.2 }}>Meridian</span>
      </div>

      <nav aria-label="Meridian" style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              data-plinth-key={link.key}
              aria-current={active ? "page" : undefined}
              style={{
                fontSize: 14,
                padding: "7px var(--space-3)",
                borderRadius: 6,
                textDecoration: "none",
                background: active ? "var(--color-surface-raised)" : "transparent",
                color: active ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-3) var(--space-2) 0", display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="org" style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Organization
        </label>
        <select
          id="org"
          value={demo.tenant.id}
          onChange={(e) => demo.setTenant(e.target.value as TenantId)}
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 13,
          }}
        >
          {TENANTS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Enterprise · 240 seats</span>
      </div>
    </aside>
  );
};
