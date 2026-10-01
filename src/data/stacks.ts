import { supplements } from "./supplements";

export interface Stack {
  id: string;
  name: string;
  /** Supplement slugs; each loads with quantity 1 */
  slugs: string[];
}

/** Built-in starter templates, listed before the user's saved ones. */
export const stacks: Stack[] = [
  {
    id: "main",
    name: "Main stack",
    slugs: [
      // Core
      "omega-3-fish-oil",
      "magnesium-l-threonate",
      "l-theanine",
      "zinc",
      "vitamin-d3",
      "b-complex",
      "l-tyrosine",
      "bacopa-monnieri",
      // Add-On picks
      "lions-mane-mushroom",
      "probiotics",
      "vitamin-k2",
      "saffron-extract",
    ],
  },
];

const idBySlug = new Map(supplements.map((s) => [s.slug, s.id]));

export function stackItems(stack: Stack): [number, number][] {
  return stack.slugs.flatMap((slug) => {
    const id = idBySlug.get(slug);
    return id ? [[id, 1] as [number, number]] : [];
  });
}
