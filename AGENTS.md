<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (PLANKTON)

- In-app pages live under the pathless `_platform` layout (sidebar + top bar); the marketing landing page `/` sits outside it. Why: landing needs its own full-bleed shell.
- Sidebar items are defined once in `src/lib/navigation.ts`. Why: sidebar, tests and future auth guards share one list.
- All placeholder content lives in `src/lib/sample-data.ts`, and any UI showing it must carry `<SampleBadge />` or `<PreviewNotice />`. Why: sample scores/AI replies must never look like real results; swapping in real data later touches one module.
- Controls whose backend isn't wired into a screen yet stay disabled with a "coming soon" tooltip or work locally and say so. Why: no button may pretend to perform a real action.
- Backend logic lives in `src/lib/*.functions.ts` (server functions with `requireSupabaseAuth`); AI/secret helpers in `src/lib/ai/*.server.ts`, loaded inside handlers. Why: keys stay on the server and every call re-checks the signed-in user.
- Credits, licence joins, session start and room joins run in security-definer database functions; students only get SELECT (plus own-line INSERT on session_messages). Why: balances and memberships can't be forged from the browser.
- AI replies, feedback reports and session completion are written by the server only; when AI fails the call returns an error code and nothing is invented. Why: simulated AI output must never look real.
- Uploads and recordings go through `/api/uploads/presentation` and `/api/transcribe`, which validate type, size and file bytes, then store in private owner-only buckets. Why: private student files and recordings are never exposed.
- Interface strings go through `useI18n().t()` in `src/lib/i18n.tsx` with English fallback; Korean learning content is never translated away. Why: six interface languages, Korean is the learning language.
