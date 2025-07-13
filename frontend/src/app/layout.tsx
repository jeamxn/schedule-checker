import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";

import Providers from "@front/providers";

export const metadata: Metadata = {
  title: "시간 맞추기 · 키우기",
  description: "시간 맞추기 · 키우기는 친구들과 함께 시간을 맞추고, 일정을 관리할 수 있는 웹 애플리케이션입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko" className="h-full w-full overflow-x-hidden bg-background">
      <body className="antialiased h-full w-full bg-backround">
        <Providers>
          <div className="w-full h-full flex flex-row">
            <div className="w-full h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
};


export default RootLayout;