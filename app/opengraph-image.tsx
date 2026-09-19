import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Clipvalley — your clipboard, synced across every device";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fcf8ff",
          backgroundImage:
            "radial-gradient(circle at 15% 40%, rgba(210, 187, 255, 0.55) 0%, rgba(210, 187, 255, 0) 55%), radial-gradient(circle at 85% 70%, rgba(233, 229, 255, 0.9) 0%, rgba(233, 229, 255, 0) 55%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={168} height={168} alt="" />
        <div style={{ marginTop: 28, fontSize: 96, fontWeight: 700, color: "#630ed4" }}>
          Clipvalley
        </div>
        <div style={{ marginTop: 12, fontSize: 38, color: "#4a4455" }}>
          Your clipboard, synced across every device
        </div>
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 16,
            fontSize: 26,
            fontWeight: 600,
            color: "#7c3aed",
          }}
        >
          <span>Text</span>
          <span>·</span>
          <span>Images</span>
          <span>·</span>
          <span>Files</span>
          <span>·</span>
          <span>Live sync</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
