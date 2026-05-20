import React from "react";

interface SkeletonProps {
  variant?: "circle" | "text" | "card";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  // Compute default shape classes
  const shapeClasses =
    variant === "circle"
      ? "rounded-full"
      : variant === "card"
      ? "rounded-2xl"
      : "rounded-md";

  // Compute default dimensions if not provided
  const inlineStyles: React.CSSProperties = {};

  if (width !== undefined) {
    inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  } else if (variant === "circle") {
    inlineStyles.width = "40px";
  } else if (variant === "text") {
    inlineStyles.width = "100%";
  }

  if (height !== undefined) {
    inlineStyles.height = typeof height === "number" ? `${height}px` : height;
  } else if (variant === "circle") {
    inlineStyles.height = "40px";
  } else if (variant === "text") {
    inlineStyles.height = "16px";
  } else if (variant === "card") {
    inlineStyles.height = "160px";
  }

  return (
    <div
      className={`relative overflow-hidden bg-neutral-800/40 animate-pulse border border-neutral-800/20 ${shapeClasses} ${className}`}
      style={inlineStyles}
    >
      {/* Premium subtle linear sweep overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03) 50%, transparent)",
          animation: "shimmer 2s infinite linear",
          transform: "translateX(-100%)",
        }}
      />
    </div>
  );
}

export default Skeleton;
