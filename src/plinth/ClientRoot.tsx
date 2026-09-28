"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/**
 * The provider reads the last verified config synchronously from device storage so the
 * first paint is already final. The server cannot see that storage, so the adaptive shell
 * renders on the client only (see PlinthProvider).
 */
const Root = dynamic(() => import("./Root"), { ssr: false });

export const ClientRoot = ({ children }: { children: ReactNode }) => <Root>{children}</Root>;
