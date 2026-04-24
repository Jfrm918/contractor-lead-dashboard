# Research Notes — Contractor Lead Dashboard V1

## Why this research was done
To avoid building a dashboard that looks like generic AI sludge and to ground the UI brief in current design patterns and dashboard best practices.

## Sources reviewed
1. Apple Newsroom — "Apple introduces a delightful and elegant new software design" (June 9, 2025)
2. Nielsen Norman Group — "Glassmorphism: Definition and Best Practices"
3. Pencil & Paper — "Dashboard Design UX Patterns Best Practices"
4. Podium Phones product page
5. Smith.ai home-services answering page
6. HighLevel pricing page

## Key takeaways used in the build brief

### 1. Liquid Glass direction is real, but restraint matters
Apple’s design language emphasizes:
- translucency
- dynamic highlights
- rounded controls
- material depth that brings focus to content

Use this as inspiration for the interface feel, not as an excuse to over-style everything.

### 2. Glassmorphism can help hierarchy, but overuse kills readability
NN/g’s guidance supports using translucent layers to create depth and hierarchy, but warns that overuse causes accessibility and usability issues.

Applied decision:
- use glass mainly on cards, nav, modals, and buttons
- keep text crisp and high-contrast
- avoid low-contrast overlays and excessive blur

### 3. Good dashboards are about fast understanding, not visual noise
Dashboard best-practice guidance stresses:
- intentional metric selection
- at-a-glance understanding
- reduced screen-hopping
- realistic data handling

Applied decision:
- make the overview screen understandable in 10 seconds
- avoid chart spam and fake KPIs
- emphasize lead funnel, missed calls, booked estimates, hot leads, and recent activity

### 4. The market already sells adjacent products
Evidence from live market pages:
- Podium promotes automatic missed-call text-back and AI-supported follow-up
- Smith.ai sells qualification, routing, and scheduling for home services
- HighLevel provides resellable calling/automation/AI infrastructure

Applied decision:
- build the product as a contractor lead-conversion system, not a generic AI dashboard
- make the UI feel like a premium operational product for contractors

## Additional visual takeaways for V2
- Apple’s Liquid Glass direction reinforces using dynamic highlights, material depth, and translucency as a way to focus content rather than obscure it.
- Glassmorphism works best when paired with clear hierarchy, high contrast text, and controlled blur. Too much blur/transparency degrades readability.
- Premium dashboard design benefits from fewer stronger surfaces instead of many weak cards. Distinct panel levels create a more 3D feel without gimmicks.
- Subtle real-world affordance cues can help controls feel tactile, but heavy skeuomorphism quickly becomes dated and cluttered.
- The best premium dashboards use background imagery as atmosphere, not content. A location-based skyline can add identity if darkened and subordinated to the UI.

## Build implications
- responsive web app first
- strong desktop and mobile layout quality
- simple access path later via URL/login
- no native app complexity in V1
- believable seeded data
- premium interaction states for every button/card
- deeper layered surfaces and stronger elevation hierarchy for a more 3D premium feel
- background image must support the UI, not compete with it
- separate client and operator/admin views are necessary because the client sees their business while Jason needs to see the whole operation
