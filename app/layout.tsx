import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { SITE_URL } from "@/lib/site";
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


const SITE_DESCRIPTION =
  "Paste text, images and files on one device and they appear live on every device you sign in to. Your clipboard history, synced to your account — no pairing, no cables.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clipvalley — your clipboard, synced across every device",
    template: "%s · Clipvalley",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Clipvalley",
    title: "Clipvalley — your clipboard, synced across every device",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Clipvalley — your clipboard, synced across every device",
    description: SITE_DESCRIPTION,
  },
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
