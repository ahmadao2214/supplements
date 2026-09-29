export const tierLabels: Record<number, string> = {
  1: "Core",
  2: "Add-On",
  3: "Optional",
};

export const tierDescriptions: Record<number, string> = {
  1: "Start here — highest impact",
  2: "Strong additions to core stack",
  3: "Situational — individual needs",
};

export const DEFAULT_COLS = [
  "name",
  "dosage",
  "frequency",
  "timeOfDay",
  "withAdderall",
  "purchaseUrl",
];

export const allColumns: { key: string; label: string }[] = [
  { key: "tier", label: "Tier" },
  { key: "name", label: "Supplement" },
  { key: "category", label: "Category" },
  { key: "treats", label: "Treats" },
  { key: "dosage", label: "Dosage" },
  { key: "frequency", label: "Frequency" },
  { key: "timeOfDay", label: "Time" },
  { key: "withMeals", label: "Meals" },
  { key: "withAdderall", label: "Adderall" },
  { key: "schedule", label: "Schedule" },
  { key: "benefits", label: "Benefits" },
  { key: "sideEffects", label: "Side Effects" },
  { key: "notes", label: "Notes" },
  { key: "purchaseUrl", label: "Cart" },
];
