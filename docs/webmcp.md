# WebMCP tools

The site offers tools to AI agents running in the browser through
[WebMCP](https://webmachinelearning.github.io/webmcp/) (`document.modelContext`).
Browsers without WebMCP see no difference: nothing registers and the tool code
isn't downloaded.

Status as of October 2026: a W3C Community Group draft that is still changing.
Chrome 149–156 and Edge 150+ run origin trials. Firefox's position is neutral
and WebKit's is opposed.

## Tools

| Tool | Pages | Changes state? | Confirmation |
|---|---|---|---|
| `search_supplements` | all | no | — |
| `get_supplement_details` | all | no | — |
| `get_cart` | home | no | — |
| `list_templates` | home | no | — |
| `update_cart` | home | cart | Allow / Decline in the page |
| `clear_cart` | home | cart | Allow / Decline |
| `apply_template` | home | cart | Allow / Decline; if the cart has items and no `mode` is given, the user picks Replace or Add |
| `save_cart_as_template` | home | saved templates | Only when overwriting an existing name; otherwise a notice |
| `delete_template` | home | saved templates | Allow / Decline |
| `prepare_checkout` | home | — | Shows a summary; only the user's click opens Swanson |

The spec no longer has a built-in way for a tool to ask the user
(`requestUserInteraction` was removed in June 2026), so confirmation happens
in the page itself (`ChoiceDialog`). Agent requests are labelled "Request from
an AI agent" and open with Decline focused, so a stray Enter key can't approve
them.

## Where the code lives

- `src/lib/webmcp/model-context.ts` — feature detection (`document.modelContext`, with a fallback to the deprecated `navigator.modelContext`) and registration
- `src/lib/webmcp/catalog-tools.ts` — read-only tools, registered from `src/layouts/Layout.astro`
- `src/lib/webmcp/cart-tools.ts` — cart and template tools, built from injected dependencies so they can be tested without a browser
- `src/hooks/useWebMcpTools.tsx` — registers the cart tools while the main island is mounted

## Trying it

**Unit tests:** `bun test` covers every tool against fake dependencies.

**Chrome, locally:**
1. Use Chrome 146 or later and enable `chrome://flags/#enable-webmcp-testing`.
2. Run `bun run dev` and open the site.
3. Install the Model Context Tool Inspector extension (linked from
   [Chrome's WebMCP docs](https://developer.chrome.com/docs/ai/webmcp)) or open
   the DevTools WebMCP panel to list and call the tools.

**Production:** register the deployed origin for the
[WebMCP origin trial](https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241)
and set `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` in Netlify's environment. The layout
adds the `<meta http-equiv="origin-trial">` tag when it's set.

**Polyfill or bridge:** `@mcp-b/global` installs `document.modelContext` and
connects it to desktop MCP clients through its browser extension. It has to
load before the page scripts, because tools register at page load.
