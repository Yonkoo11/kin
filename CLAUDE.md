## SECURITY — KEYS NEVER IN REPO OR CONTEXT (BLOCKING)

The deployer + operator + RPC keys live ONLY in `~/.zshenv`. Hard rules:

- **NEVER read `~/.zshenv`, `~/.zshrc`, `~/.zprofile`, `~/.bashrc`, `~/.bash_profile`, `~/.netrc`, `~/.npmrc`, `~/.git-credentials`, SSH keys, `*.key`, `*.pem`, or any `keystore/*` file.** Not `Read`, not `cat`, not `head`, not `grep -v`. Project + global hooks block these.
- **NEVER print, echo, or log key values.** `echo $KEY`, `print(os.getenv("KEY"))`, `vm.toString(pk)`, `console.log(process.env.KEY)` are banned.
- **NEVER commit `.env*`, `*.key`, `*.pem`, `keystore/`, `secrets/`** — covered by `.gitignore`. Verify `git diff --cached` before every save point.
- **NEVER use `git add -A` for the first save point in a new project.** Add by explicit file name.
- **Foundry deploys use `vm.envUint("DEPLOYER_PRIVATE_KEY")`** — reads process env at runtime. Never hardcode. Never `--private-key 0x...` on the CLI either.
- **Python agents use `os.getenv("OPERATOR_PRIVATE_KEY")`** — same pattern. Never `dotenv.load_dotenv("~/.zshenv")`. Never shell out to echo env vars.
- **Check var presence without seeing value:** `[ -n "$VARNAME" ] && echo "set"` or `echo "${#VARNAME}"` (length only).
- **If a key ever surfaces in chat or output, STOP. Tell the user to rotate. Do not paginate the value back into context.**

Full playbook: `SECURITY.md`. Read it before any deploy or signing work.

---

# Kin — working rules

## How to talk to me (I do not read code)
- Plain English. Say "save point" not "commit", "publish" not "push", "version" not "branch".
- Describe changes by what I see in the app, not which files changed.
- Summarize terminal output in one sentence. Never paste raw output or stack traces.
- Save after every task automatically. Never ask.
- Fix failing tests silently. Never explain test frameworks.

## Phase 1 Gate (nothing else gets built until this passes)

**Core action:** for one real institution, search for its own death-notification page, read it, show
the exact facts a letter needs, draft the letter from those facts, send it from the estate inbox, and
update the card live when a reply arrives.

**Success test:** the UI displays `D1118-02D` (Wells Fargo's internal mail code, which is on their
public page), and that string appears nowhere in the source. A reply lands on the card in a second
browser window with no refresh.

**Status:** NOT STARTED

## Build order
Phase 1 (the core action above) → Phase 2 (the other counterparties, intake by forwarding, the chase
cron) → Phase 3 (product complete: auth, siblings, file upload, `/judge` tour) → Phase 4 (design).
**Open the live URL and do the core action before any styling.**

## Verified Facts (do not trust marketing copy, or a model's memory, over these)
Full list with how each was measured: `ai/memory.md`. The ones that break a build if forgotten:
- Packages are `@agentmail/convex` and `@firecrawl/firecrawl-convex`. `@convex-dev/firecrawl` is a 404.
- AgentMail free tier is **3 inboxes**. Use ONE shared inbox, route by thread + case token.
- Big banks do **not** accept death notification by email. Detect the channel; do not assume it.
- Firecrawl key is wired through typed component env in `defineApp({ env: {...} })`.
- Convex Auth v2 is "super alpha" per the organisers. Use `@convex-dev/auth` instead.

## Open Unknowns — never invent an endpoint or a schema to get past one
- Whether Firecrawl defeats the 403 hosts (ssa.gov, fidelity.com).
- Whether AgentMail plus-addressing works on the free tier.
- Whether a fresh agentmail.to sender reaches an institution or lands in spam.

## Sponsor Depth Targets
Convex 5/5 · Firecrawl 5/5 · AgentMail 5/5 · OpenAI 5/5. The committed V1 wins and their binary
acceptance tests are in `ai/sponsor-integration.md`. Nothing on that V1 list is optional.

## Definition of done
`ai/judging-scorecard.md`. Every row is either done with evidence named, or explicitly abandoned with
a reason written in the row. A row left blank at filing time is a criterion handed away.

## Hard scope refusals
No probate filing. No auto-send without a human click. No claiming a bank takes email when it does not.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
