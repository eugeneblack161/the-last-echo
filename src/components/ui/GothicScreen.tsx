"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface GothicScreenProps {
  children: ReactNode;
  image?: string;
  imageClassName?: string;
  overlayClassName?: string;
  className?: string;
}

export function GothicScreen({
  children,
  image = "/main-bg.png",
  imageClassName = "opacity-50",
  overlayClassName = "bg-black/45",
  className = "",
}: GothicScreenProps) {
  return (
    <main
      className={`relative h-screen w-screen overflow-hidden bg-black text-[#e7e2dc] ${className}`}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
      />

      <div className={`absolute inset-0 ${overlayClassName}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(92,31,31,0.18),transparent_55%)]" />

      <div className="relative z-10 h-full">{children}</div>
    </main>
  );
}
