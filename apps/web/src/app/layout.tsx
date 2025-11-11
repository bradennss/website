import type { Metadata } from "next";
import localFont from "next/font/local";
import { memo, PropsWithChildren } from "react";
import { BASE_URL } from "~/const";
import { env } from "~/env";
import { PresenceController } from "~/presence/controller";
import { PresenceRenderer } from "~/presence/renderer";
import { cn } from "~/utils";
import { QueryClientProvider } from "../providers/query-client";
import "./globals.css";

const abcDiatype = localFont({
  src: [
    {
      path: "./fonts/abc-diatype-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/abc-diatype-italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/abc-diatype-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/abc-diatype-bold-italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-abc-diatype",
});

const abcDiatypeMono = localFont({
  src: [
    {
      path: "./fonts/abc-diatype-mono.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-abc-diatype-mono",
});

export const metadata: Metadata = {
  title: "Braden",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: "Braden",
  },
};

export const dynamic = "force-dynamic";

const RootLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <QueryClientProvider>
      <html lang="en">
        <body
          className={cn(
            "bg-background text-foreground antialiased",
            abcDiatype.variable,
            abcDiatypeMono.variable,
          )}
        >
          {children}
          <PresenceController serverUrl={env.PRESENCE_SERVER_URL} />
          <PresenceRenderer />
        </body>
      </html>
    </QueryClientProvider>
  );
});
RootLayout.displayName = "RootLayout";

export default RootLayout;
