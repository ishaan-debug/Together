import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SocketContextProvider } from "@/contexts/SocketContext";

import "@/styles/main.scss";
import "@/styles/base/typography.scss";
import "@/styles/base/removeFocusBorder.scss";
import "@/styles/base/inputs.scss";

// Downloaded at build time and served with the app, so it also works offline.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Together",
  description: "Video calls in the browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

// The provider lives in the root layout so the call survives navigating from / to /video.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <SocketContextProvider>{children}</SocketContextProvider>
      </body>
    </html>
  );
}
