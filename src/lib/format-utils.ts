// Pure classification functions — no JSX, just class names and labels

export type BadgeType = "safe" | "caution" | "avoid";

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

export function classifyTimeOfDay(val: string): "day" | "night" | "flex" | null {
  const lower = val.toLowerCase();
  if (lower === "any time") return "flex";
  // Both morning and evening mentioned → flexible
  if ((lower.includes("morning") || lower.includes("afternoon")) && (lower.includes("evening") || lower.includes("bed"))) return "flex";
  if (lower.includes("morning") || lower.startsWith("afternoon")) return "day";
  if (lower.includes("evening") || lower.includes("bed")) return "night";
  return null;
}

export function getTimeLabel(type: "day" | "night" | "flex" | null): string {
  switch (type) {
    case "day": return "Morning";
    case "night": return "Evening";
    case "flex": return "Flexible";
    default: return "";
  }
}

export function classifyMeals(val: string): "yes" | "fat" | "no" | "optional" | null {
  const lower = val.toLowerCase();
  if (lower.includes("fat") || lower.includes("piperine")) return "fat";
  if (lower.startsWith("yes") || lower.includes("with breakfast")) return "yes";
  if (lower.includes("without") || lower.includes("empty stomach") || lower.includes("before food")) return "no";
  if (lower === "optional" || lower === "no preference") return "optional";
  return null;
}

export function getMealLabel(type: "yes" | "fat" | "no" | "optional" | null): string {
  switch (type) {
    case "fat": return "With fat";
    case "yes": return "With food";
    case "no": return "Empty stomach";
    case "optional": return "Optional";
    default: return "";
  }
}

export function getAdderallLabel(type: BadgeType): string {
  switch (type) {
    case "safe": return "Safe";
    case "caution": return "Caution";
    case "avoid": return "Avoid / separate";
  }
}

export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}
