# Anti Slop Audit 018 Follow-up - 2026-10-18

Finding 1 (LOW - R-26) is **RESOLVED**. Hover now highlights the active bar, dims the others, and shows a Ruma-colored tooltip with the date and rupiah value. Keyboard users can focus the plot and use the left/right arrows to inspect values; Escape clears the selection.

Finding 2 (LOW - R-03) is **RESOLVED IN CSS**. Dense ranges use a tighter bar gap, bars can shrink below the old 2px minimum, and the plot uses a zero-minimum flexible track inside a width-constrained chart card.

Verification: `npm run build` passes. The dashboard screenshot at the current 800px browser width shows the chart contained in its card. A phone-width browser preview was not available in this verification pass.
