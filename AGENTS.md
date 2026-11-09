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

- Private inbox reads and review updates use authenticated clients and database role policies; never rely on an email check in the browser for authorization.
- Owner roles are assigned only by an Auth confirmation trigger using the verified owner identity; users cannot edit their own roles.
- App emails use managed sending only after sender-domain setup; do not create email queues or email tables.
- Keep entities compatibility aliases exact-match only; prefix aliases break modern htmlparser2 subpath exports while legacy React Email imports still need the pinned version.
- Recover failed dynamic page imports with one session-storage-bounded full reload; router resets cannot clear the browser's rejected import cache, and repeated failures must retain manual recovery instead of looping.
- Owner-entry links use document navigation to load a fresh route graph instead of reusing a potentially rejected lazy sign-in import.
- Public forms submit through validated server functions that save first, then send fixed-recipient owner alerts; email failures never discard saved requests and email bodies contain only references to protect sensitive details.
