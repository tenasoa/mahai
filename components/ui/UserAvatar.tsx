"use client";

import { useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  initials: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function UserAvatar({
  src,
  initials,
  size = 36,
  className,
  style,
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1px solid var(--gold-line)",
          position: "relative",
          ...style,
        }}
        className={className}
      >
        <Image
          src={src}
          alt={initials}
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
          onError={() => setError(true)}
          unoptimized={src.startsWith("data:")}
        />
      </div>
    );
  }

  return (
    <div
      className={`sb-av ${className || ""}`}
      role="img"
      aria-label={initials}
      style={{
        width: size,
        height: size,
        fontSize: size > 40 ? "1rem" : "0.85rem",
        ...style,
      }}
    >
      {initials.toUpperCase() || "U"}
    </div>
  );
}
