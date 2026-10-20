# Anti Slop Audit 017 Follow-up - 2026-10-18

Finding 1 (LOW - R-19) is **RESOLVED**.

The date range now opens a Ruma-colored, two-month calendar popover with month navigation, highlighted start/end dates, a shaded range, keyboard date navigation, Escape/outside dismissal, and a 30-day shortcut. At phone widths it shows one month and keeps the popover within the viewport. Date limits still match the demo's latest 90 days.

Verification: production build passes. Browser selection of 2026-10-01 through 2026-10-10 updated dashboard totals (gross Rp542.000; recognized Rp212.000); Escape closes the picker; the same calendar fits at 390px viewport width. The dashboard was restored to the 30-day preset.
