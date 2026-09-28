import type { ReactNode } from "react";
import "./globals.css";
import { ClientRoot } from "../src/plinth/ClientRoot";

export const metadata = {
  title: "Meridian — compute platform",
  description: "Mock vendor product for the plinth demo. Everything here is invented.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", minHeight: "100vh" }}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
