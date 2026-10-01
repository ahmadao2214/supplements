import { useEffect, useRef } from "react";
import type { ChoiceRequest } from "../components/ui/ChoiceDialog";
import { registerTools, getModelContext } from "../lib/webmcp/model-context";
import { createCartTools, type CartToolDeps, type ConfirmRequest } from "../lib/webmcp/cart-tools";

type Deps = Omit<CartToolDeps, "confirm"> & {
  ask: (request: ChoiceRequest) => Promise<string | null>;
};

/**
 * Registers the cart and template tools for as long as the island is mounted.
 * Tools are registered once; they read the latest state through a ref.
 */
export function useWebMcpTools(deps: Deps, enabled = true) {
  const latest = useRef(deps);
  latest.current = deps;

  useEffect(() => {
    if (!enabled || !getModelContext()) return;
    const controller = new AbortController();
    const confirm = ({ title, lines, note, choices, signal }: ConfirmRequest) =>
      latest.current.ask({
        title,
        fromAgent: true,
        signal,
        body: (
          <>
            {lines && lines.length > 0 && (
              <ul className="space-y-0.5 text-ink">
                {lines.map((l) => <li key={l}>{l}</li>)}
              </ul>
            )}
            {note && <p className="mt-2 text-ink-muted">{note}</p>}
          </>
        ),
        choices: choices.map((c) => ({
          value: c.value,
          label: c.label,
          variant: c.primary ? "primary" : "ghost",
          onSelect: c.onSelect,
        })),
      });

    const tools = createCartTools({
      getCart: () => latest.current.getCart(),
      setCart: (next) => latest.current.setCart(next),
      getPrices: () => latest.current.getPrices(),
      getTemplates: () => latest.current.getTemplates(),
      saveTemplate: (name, cart) => latest.current.saveTemplate(name, cart),
      deleteTemplate: (id) => latest.current.deleteTemplate(id),
      checkout: () => latest.current.checkout(),
      notify: (m) => latest.current.notify(m),
      confirm,
    });
    registerTools(tools, controller.signal);
    return () => controller.abort();
  }, [enabled]);
}
