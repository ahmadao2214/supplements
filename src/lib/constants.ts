export const tierLabels: Record<number, string> = {
  1: "Core",
  2: "Add-On",
  3: "Optional",
};

export const tierDescriptions: Record<number, string> = {
  1: "Start here — highest impact for ADHD + Adderall",
  2: "Strong additions once core stack is stable",
  3: "Situational — add based on individual needs",
};

export const DEFAULT_COLS = [
  "tier",
  "name",
  "treats",
  "dosage",
  "timeOfDay",
  "withMeals",
  "withAdderall",
  "schedule",
];

export const allColumns: { key: string; label: string }[] = [
  { key: "tier", label: "Priority" },
  { key: "name", label: "Supplement" },
  { key: "category", label: "Category" },
  { key: "treats", label: "Treats" },
  { key: "dosage", label: "Dosage" },
  { key: "frequency", label: "Frequency" },
  { key: "timeOfDay", label: "Time of Day" },
  { key: "withMeals", label: "With Meals?" },
  { key: "withAdderall", label: "With Adderall?" },
  { key: "schedule", label: "Schedule" },
  { key: "benefits", label: "Benefits" },
  { key: "sideEffects", label: "Side Effects" },
  { key: "notes", label: "Notes" },
  { key: "purchaseUrl", label: "Buy" },
];
