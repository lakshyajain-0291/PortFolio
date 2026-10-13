# Systems Paper (default edition, `/` and ?template=paper)

Scope: whole surface, templates/paper. It is now the site's default edition.

Visitor mode:
- Persuade, then Read, on the home page. It is a portfolio about Lakshya.
- Read on each case study (?project=<slug>).

Audience and job:
- Recruiters shortlist, so they need role, availability, recent experience and the resume in seconds.
- Engineers verify the systems work on the case-study pages.

Proof: shared/content case studies, metrics with kind and source, references with link status.

Constraints:
- Self-hosted Source Serif 4 and Source Code Pro.
- Print stylesheet.
- No shadcn.
- The 3D model loads only on request, in its own chunk, on case-study pages.

## Direction contract

THESIS: A portfolio typeset as a short systems paper. The person comes first, and the work is evidence. Every number carries a kind and a source. It refuses the hero-plus-cards developer portfolio, the project-first portfolio, and the cream-and-terracotta editorial default.

OWN-WORLD:
- Palette: a clean white page, near-black ink and one citation blue.
- Type: Source Serif 4 for all prose, with optical sizes. Source Code Pro only for numbers, tables and identifiers.
- Structure: hairline rules, numbered sections, numbered figures and tables, a margin column on desktop, square corners.
- Excluded: no cards, no elevation shadows, no badges.

STORY:
- The reader learns who Lakshya is, what they are looking for, and where they have worked.
- They then see the selected work as short entries. Each system's figure plays its main flow on a loop.
- They open a case study for the architecture, flows, 3D model and evidence. They leave with the resume or an email.
- A colophon names the other editions; the Konami code and the end mark open them too.

FIRST VIEWPORT:
- A paper title block. The name is set as the title.
- Below it: the author line (role, IIT Jodhpur, class of 2027) and the availability sentence.
- An action line: Resume (PDF) first, then Email, GitHub and LinkedIn.
- A first-person About paragraph.
- The desktop margin carries "at a glance" facts (most recent role, education, top recognition) and then the Contents.

Signature interactions:
- On the home page, looping figure walkthroughs. They autoplay, show a segmented timeline you can jump through, and offer Pause. They hold on hover or focus, pause off screen, and do not autoplay under reduced motion.
- On case studies, a scroll story on desktop: the figure is pinned and each step lights it as it passes the reading line. Phones get the looping player instead.
- Citation previews on hover and focus.

FORM: The owner pinned the Systems Paper direction on 2026-10-13 and restructured it into a portfolio-first default the same day. It supersedes concept roll 70123c47.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
