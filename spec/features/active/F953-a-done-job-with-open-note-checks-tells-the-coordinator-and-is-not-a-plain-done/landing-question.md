# F953 landing: one decision for the coordinator

The candidate is not landed. Adam asked to land after an independent review (Sol xhigh), and no review passed.

- Reviews 1, 2 and 3 (`review-1.md` to `review-3.md`) each FAILed on one proven case in the "proven needs a command that ran" check: a quoted command, a command after a failed `&&`, and a command after an early `exit`. Acceptance 1, 3 and 4 passed in all three reviews.
- Each finding is fixed and has a test. After review 3, Limen stopped modeling shell control flow. A command now counts only from one recorded call that exited 0 and is a single chain joined by `&&` or `|` (`evidence.md`, 37 cases in `evidence/ran-probe.txt`). No review has seen this rule.
- Cost so far: three Sol xhigh reviews of about 10 minutes each. The package ceiling ("a second FAIL ends the loop") was passed once, on Adam's instruction to land after a review.

Decide one: start review 4 of the chain rule at the branch tip, then land on PASS; land on your own judgment and say why; or narrow acceptance 2.
