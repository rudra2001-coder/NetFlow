"use client";

import React from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  className?: string;
}

const sizeStyles: Record<"xs" | "sm" | "md" | "lg" | "xl", string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const bgColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index];
};

export const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  className = "",
}: AvatarProps) => {
  const initials = name ? getInitials(name) : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={`
          ${shape === "circle" ? "rounded-full" : "rounded-lg"}
          ${sizeStyles[size]}
          object-cover
          ${className}
        `}
      />
    );
  }

  const bgColor = name ? getColorFromName(name) : "bg-slate-400";

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium text-white
        ${shape === "circle" ? "rounded-full" : "rounded-lg"}
        ${sizeStyles[size]}
        ${bgColor}
        ${className}
      `}
      aria-label={name || "User avatar"}
    >
      {initials}
    </span>
  );
};

Avatar.displayName = "Avatar";

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
  }>;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AvatarGroup = ({
  avatars,
  max = 5,
  size = "md",
  className = "",
}: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapStyles: Record<"sm" | "md" | "lg", string> = {
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={`
            ${index > 0 ? overlapStyles[size] : ""}
            border-2 border-white rounded-full
          `}
        >
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${overlapStyles[size]}
            border-2 border-white rounded-full bg-slate-200
          `}
        >
          <Avatar name={`+${remainingCount}`} size={size} />
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = "AvatarGroup";
