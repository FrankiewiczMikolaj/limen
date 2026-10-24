# HTML render evidence

The coordinator rendered `/Users/overment/Downloads/limen-learning-system.html` with the installed Chromium headless-shell build 1243. No browser window, virtual-display browser or main-screen browser opened.

Output SHA-256: `b27876c24894ef2c1004545a5ebb47d5bc93858da2796490feb360c481bdfb14`.

Command: `node /tmp/limen-learning-system-check/check.mjs`. Final exit: 0.

## Observed results

- Viewports 1440×1000, 900×900 and 390×844 have no document-width overflow. The narrow graph scrolls inside its own region.
- Every graph text label fits its node at all three widths.
- One title heading, five numbered choices, three skills and three open questions are present.
- All five disclosures open. Enter opens a focused disclosure.
- Internal source anchors resolve, ids are unique, and all 18 local source-file links exist.
- No runtime exception was observed. The only page request was the local HTML; no network resources were fetched.
- The document contains no JavaScript.
- The headless browser exited. Its temporary profile was removed.
- The coordinator opened and inspected the headless desktop, narrow-screen and file-shape screenshots through the file-read tool only.

The first render check found seven graph labels wider than their nodes; they were shortened. The first keyboard probe did not activate a disclosure; the probe was corrected to focus its headless target and dispatch the native Enter key. The final run passed both checks. No runtime code was changed.

Temporary raw evidence lived at `/tmp/limen-learning-system-check/` and is removed after filing. The requested HTML remains in Downloads.

## Not run

No product test suite, learning trial, transcript miner or scheduled audit ran. This work proves that the discussion document renders, not that the proposed system improves learning. The periodic limits and future costs remain proposals.
