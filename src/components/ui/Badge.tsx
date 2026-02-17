import React from "react";

interface BadgeProps {
  variant: string;
  children: React.ReactNode;
}

export const Badge = React.memo(function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
});
