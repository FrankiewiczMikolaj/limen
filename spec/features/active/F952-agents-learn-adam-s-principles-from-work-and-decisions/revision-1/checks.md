# Revision 1 render evidence

The revised `/Users/overment/Downloads/limen-learning-system.html` passed a Chromium headless-shell 1243 check. No browser window opened, including on the virtual display or main screen.

SHA-256: `4d676bb5af43978276e14689bf25f43b4e8b65764be51b0ef8aab0930ac9a02b`.

Command: `node /tmp/limen-learning-system-revise-1-check/check.mjs`. Final exit: 0.

- Widths 1440, 900 and 390 have no document overflow. Narrow screens scroll the graph inside its own region.
- All six graph nodes have contained text. Their labels follow task, global principles, area principles, feature map, decisions, code/tests.
- Exactly six shape/refine skills appear. Exactly the three refine skills are marked schedule-capable.
- The real decision example is eight nonblank lines and 60 whitespace-delimited words, within the proposed 100-word limit.
- The real feature-map example is 14 nonblank lines and 127 words, within the proposed 60-line/350-word limits.
- Three numbered, one-line open choices form the final section.
- Internal anchors resolve; ids are unique; all 14 local source links exist.
- Enter opens the source disclosure. No runtime or browser-log error was observed.
- The only page request was the local HTML. The page contains no JavaScript.
- The browser exited and its temporary profile was removed.
- The coordinator inspected the headless navigation, six-skill and feature-map screenshots with the file-read tool.

The first probe passed content and layout checks but timed out while awaiting the closing DevTools response after the browser had exited. The probe was changed to require actual process exit instead of that lost response. The final complete probe passed. No page change was needed for that check-harness issue.

Temporary raw evidence under `/tmp/limen-learning-system-revise-1-check/` is removed after filing; the HTML remains in Downloads. No product suite, learning pilot, scheduled refine job or transcript mining ran. This evidence proves the page renders and contains the requested design, not that the proposed learning system works.
