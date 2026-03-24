import type { Metadata } from "next";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#000",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        /
      </div>
    ),
    { ...size },
  );
}

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};
