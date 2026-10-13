# Content decisions

Owner decisions and verification behind the published portfolio content, recorded 2026-10-13. `public/data/portfolio.json` (schema v2, the single source of truth since 2026-10-13) follows this log.

## Sources

- **Canonical resume:** `public/resume/Resume_placement_offcampus.pdf` (byte-identical to `public/resume/resume.pdf`). Where the master CV or the JSON conflicted with it, they were changed to match it.
- **Unpublished but kept as sources:** `docs/resume-sources/master_cv.pdf`, `master_cv_1.tex` and `updated_portfolio.json`, moved out of `public/`.
- Repositories and READMEs were read through the GitHub API, read-only.

## Decisions

| Item | Decision | Evidence |
|---|---|---|
| 26 Miles load test | 500 concurrent users at p95 19 ms, zero errors | One-pager |
| libr | One project, canonical repo `libr-forum/libr`. BFT, "10+ nodes", "multithreaded" and "later grown into" removed. | libr README, `docs/libr_project_doc.txt` |
| Image Filtration | Only the README's facts are kept. The 4K, <3 s, 100%, 15+ edge cases and 96% claims are removed. | Repo README |
| Skill proficiency scores | Removed. The old templates hide their skill bars when no score exists. | No source |
| Coursework | The one-pager's list and grades. DSA has no grade. Calculus, Linear Algebra and Quantum Information are kept from the master CV. | One-pager (transcript), master CV |
| Leadership descriptions | Kept as written | Owner |
| Tech tags (Socket.io, Redis, vector embeddings, HTML/CSS) | Kept | Owner |
| Mini-K8ts autoscaling | Kept | Job autoscaler in `internal/scheduler/service.go`, report §4.10 |
| Mini-K8ts benchmarks | Measured, with method | Report §5: 50-node simulated cluster with an in-memory store, see `tests/scale_scheduler_test.go` |
| Mini-K8ts role | Lead engineer, team of 5, course project (CSL7510) | Owner, report cover |
| GitCury performance | Self-reported | One-pager |
| NIDS, C3P roles | Co-developer | Owner |
| FileNest | Repo `lakshyajain-0291/FileNest`, role Mentor, metrics are targets | README |
| 2nd Swap, NIDS demos | Offline, links removed | `2ndswap.in` NXDOMAIN; `ml-showcase-site.vercel.app` returns 404 |
| GitHub totals | 2,949 contributions, of which 1,476 are commits (2023 to 2026-10-13). This replaces "2800+ commits". | GitHub GraphQL |
| Language shares | Labelled "by repository count" | Computed over the featured repositories |
| careerRecommendations | Removed | Speculative |
| 26 Miles platform | Shown at CV level, with no diagram | Owner |
| Attribution | Role only; collaborators are not named | Owner |

## Still to confirm

- **Adobe demo:** `adobe-inter-iit.vercel.app` timed out from the build machine on 2026-10-13. It is shown as unchecked.
- **Diagram specs:** the specs for libr, Mini-K8ts and FileNest are confirmed with the owner one system at a time before they render.

## Added 2026-10-13 (second pass)

| Item | Decision | Evidence |
|---|---|---|
| libr moderation | Described as Byzantine fault-tolerant majority voting: with m moderators, up to ⌊(m − 1)/2⌋ faulty ones can neither block nor force a decision. The earlier "BFT across 10+ nodes" wording stays removed. | Co-authored paper `docs/projects-data/LIBR_paper (1).pdf` §V, §VII; replaces the older `libr (3).pdf` |
| libr availability | 99.1% shown as **projected** (analytical model: 5 moderators at 90%, 3 replicas at 95%), never as measured | Paper §VIII |
| libr registry | Ethereum contracts for configuration, elections and proof-of-service rewards, drawn as **planned** | Paper §VI; prototype simulates it |
| Mini-K8ts diagram | Confirmed. Where the report and the code differ (4 s detection vs 15 s default timeout; serializable binding vs default isolation), the report's stated behaviour is used, per the owner's instruction to use the report | Report §4–5, owner |
| Mini-K8ts ingress controller | Left out: not in the report or README | `cmd/ingress-controller` |
| FileNest | Rewritten from the co-authored design paper (tagging-vector hierarchy, DHT placement by creation-time hash, covering-radius pruning). Role "Mentor, then co-author of the design paper". README targets stay labelled as design targets. No measured numbers: the paper's evaluation sections are still empty | `docs/projects-data/FileNest (2)(1).pdf` §4; public repo holds only scaffolding |
| Papers as sources | Cited as unpublished manuscripts, with no link, because neither PDF is public | Owner-provided files |
| Adobe demo | Now marked live (HTTP 200 on 2026-10-13) | curl |
| Link status | Every experience and project link was checked; all 17 returned HTTP 200 and are recorded as `status` and `checkedAt` on each link in `public/data/portfolio.json`. LinkedIn returns 999 to bots and stays unchecked | curl |
| Portrait | Removed by the owner. `og:image` now points to an authored card, `public/og/atlas.png`, whose provenance is embedded in the PNG | Owner |
