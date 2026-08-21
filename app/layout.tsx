import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const ICON_NAMES = [
  "add",
  "arrow_back",
  "arrow_forward",
  "bookmark",
  "check",
  "close",
  "cloud_off",
  "content_copy",
  "delete",
  "description",
  "download",
  "edit",
  "image",
  "link",
  "lock",
  "logout",
  "mail",
  "open_in_new",
  "person",
  "search",
  "settings",
  "subject",
  "sync",
  "visibility",
  "visibility_off",
].join(",");

const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" +
  `&icon_names=${ICON_NAMES}&display=block`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clipvalley.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clipvalley — your clipboard, everywhere",
    template: "%s · Clipvalley",
  },
  description:
    "Paste text or an image on one device, sign in on another, copy it back. No pairing, no cables.",
  verification: {
    google: "TSRruGAR7le1R3zEZuhfoXHr3XSzL-Tb83thF4gLYE8",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf8ff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_HREF} />
      </head>
      <body className="min-h-screen bg-background font-sans text-on-background">
        {children}
      </body>
    </html>
  );
}
