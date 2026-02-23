import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const logoData = await readFile(
    join(process.cwd(), "public/images/logo-favicon-32.png")
  );
  const base64 = logoData.toString("base64");
  const src = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    (
      <img
        src={src}
        width={32}
        height={32}
        style={{ width: "100%", height: "100%" }}
      />
    ),
    { ...size }
  );
}
