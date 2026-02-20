import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#083D77",
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: "#EBEBD3",
            letterSpacing: -2,
          }}
        >
          4K
        </span>
      </div>
    ),
    { ...size }
  );
}
