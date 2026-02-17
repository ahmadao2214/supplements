// Pure classification functions — no JSX, just class names and labels

export type BadgeType = "safe" | "caution" | "avoid";
export type TierBadgeType = "tier1" | "tier2" | "tier3";

export function classifyAdderall(val: string): BadgeType {
  const lower = val.toLowerCase();
  if (lower.includes("yes")) return "safe";
  if (lower.includes("cautious") || lower.includes("caution")) return "caution";
  return "avoid";
}

export function classifySchedule(schedule: string): string {
  if (schedule.includes("Off Days")) return "schedule-off";
  if (schedule.includes("Adderall Days Only")) return "schedule-adderall";
  if (schedule.includes("Evening on Adderall")) return "schedule-evening";
  return "schedule-daily";
}

export function classifyTimeOfDay(val: string): "day" | "night" | null {
  const lower = val.toLowerCase();
  if (lower.includes("morning") || lower.startsWith("afternoon")) return "day";
  if (lower.includes("evening") || lower.includes("bed")) return "night";
  return null;
}

export function classifyMeals(val: string): "yes" | "fat" | "no" | "optional" | null {
  const lower = val.toLowerCase();
  if (lower.includes("fat")) return "fat";
  if (lower.startsWith("yes") || lower.includes("with breakfast")) return "yes";
  if (lower.includes("without") || lower.includes("empty stomach") || lower.includes("before food")) return "no";
  if (lower === "optional" || lower === "no preference") return "optional";
  return null;
}

export function getScheduleEmoji(schedule: string): string {
  if (schedule.includes("Off Days")) return "\u{1F504}";
  if (schedule.includes("Adderall Days Only")) return "\u{1F48A}";
  if (schedule.includes("Evening on Adderall")) return "\u{1F319}";
  return "\u{1F4C5}";
}

export function getAdderallEmoji(type: BadgeType): string {
  switch (type) {
    case "safe": return "\u2705";
    case "caution": return "\u26A0\uFE0F";
    case "avoid": return "\u{1F6AB}";
  }
}

export function getAdderallLabel(type: BadgeType): string {
  switch (type) {
    case "safe": return "Safe";
    case "caution": return "Caution";
    case "avoid": return "Avoid/Separate";
  }
}
