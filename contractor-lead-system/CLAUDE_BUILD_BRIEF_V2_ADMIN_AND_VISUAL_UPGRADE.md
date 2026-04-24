# Contractor Lead Conversion Dashboard — V2 Admin + Visual Upgrade Brief

## Objective
Upgrade the existing V1 app into a more complete product with:
- a stronger premium visual system
- a more 3D-looking liquid-glass interface
- a **separate internal admin/operator view** for Jason
- a Tulsa skyline background integrated tastefully into both client and admin experiences

This should feel like a serious premium software product, not a demo template.

## Core Structure
The app now has two product surfaces:

### 1. Client Dashboard
What the contractor sees.
Purpose:
- leads
- missed call recovery
- booked estimates
- alerts
- scorecards

### 2. Admin / Operator Dashboard
What Jason sees.
Purpose:
- manage all clients
- monitor automation/workflow health
- oversee onboarding
- inspect lead flows
- track billing/status/support items
- switch between client accounts

## Visual Upgrade Direction
Keep the liquid-glass foundation, but push it further in a tasteful way.

### Required look and feel
- premium
- dimensional
- slightly more 3D
- smooth
- elegant
- dark luxury SaaS feel
- no hard straight lines
- no harsh edges
- rounded corners throughout
- interactive micro-motion on buttons, chips, toggles, cards, rows, and tabs

### Research-backed direction
Use these ideas in a restrained, professional way:
- Apple Liquid Glass: translucent surfaces, dynamic highlights, focus on content, material depth
- Glassmorphism best practices: layered blur, depth, hierarchy, but preserve readability
- Dashboard UX best practices: fast comprehension, limited metrics, real hierarchy, no clutter
- Subtle skeuomorphic affordance cues are acceptable only if they improve clarity and tactility; do not make it look old-fashioned or cheesy

## Background Requirement
Use a **Tulsa downtown skyview background** in both client and admin dashboards.

### Important rules
- it must feel premium, not like a wallpaper slapped behind the UI
- apply dark overlay, blur, and atmospheric tinting so the UI remains readable
- background should be visible enough to create identity, but not so strong it distracts from content
- support parallax/subtle motion if tasteful and lightweight

## 3D / Depth Ideas to Use
Use some of these, but keep them subtle:
- layered panel stacks
- slightly stronger shadow depth between background / shell / card / elevated card
- inner highlights on glass cards
- hover parallax tilt on select cards
- depth through blur, opacity, and spacing
- floating segmented controls or tab chips
- subtle glow reflections on primary controls
- soft shadow occlusion beneath raised surfaces

Do NOT do:
- gimmicky spinning 3D objects
- WebGL-heavy nonsense
- exaggerated tilt effects everywhere
- fake chrome/plastic UI

## Client Dashboard Upgrades
Keep all current client screens, but improve visual polish and make the flow feel more premium.

Upgrade:
- top summary cards
- filters
- activity feed
- conversations
- scorecard visuals
- sidebar/top nav
- transitions between sections

Add tasteful improvements such as:
- segmented page navigation
- more dimensional KPI cards
- richer empty/secondary states
- better visual grouping and spacing

## Admin / Operator Dashboard Requirements
Add a way to switch into an internal operator/admin mode.

### Admin overview should show
- total active clients
- trial / active / paused counts
- total inbound leads across all clients
- recovered leads across all clients
- booked estimates across all clients
- workflows needing attention
- open support tasks
- onboarding progress

### Admin client roster
Show a clean client list with:
- company name
- trade
- city
- status
- monthly plan
- workflow health
- last activity
- open issues count

### Admin client detail view
When opening a client, show:
- client summary
- assigned number / channel status
- workflow status
- lead volume snapshot
- open alerts
- onboarding checklist
- script / qualification rule summary
- recent conversations
- last scorecard sent

### Admin operations panels
Include sections/cards for:
- onboarding tracker
- automation health
- billing/status summary
- support/tasks queue
- script revision notes
- recent operator actions

### Admin purpose
Jason should feel like he is looking at the control center for the business, not just another copy of the client dashboard.

## Navigation
Use a clean system so the app can switch between:
- Client View
- Admin View

This can be a top-level mode switch, toggle, or segmented control.
It should feel elegant and obvious.

## Mobile Experience
Both client and admin views must still work on mobile.

Requirements:
- stacked sections
- readable cards
- clean navigation
- no cramped control clusters
- Tulsa background still visible but subdued

## Interaction Requirements
Every important control should feel premium.

Apply refined states to:
- sidebar items
- tabs
- table rows
- buttons
- chips
- cards
- filters
- toggles
- lead rows
- client rows

Desired interaction feel:
- hover lift
- subtle glass shimmer
- pressed compression
- active glow/fill shift
- excellent focus state

## Data Requirements
Expand seeded data to support admin mode.

Need realistic sample data for multiple contractor clients, such as:
- Tulsa Peak HVAC
- Red Fork Roofing
- Green Country Plumbing
- Route 66 Electric
- Apex Insulation Solutions

For each client include:
- status
- city/service area
- plan tier
- workflow health
- onboarding step completion
- lead totals
- booked estimates
- open tasks
- recent events

## Technical Guidance
Use the current app as base and upgrade it.

Preferred stack remains:
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion

Keep performance reasonable.
Do not bloat the app with unnecessary libraries.

## Tulsa Background Asset
Use this generated asset as the shared dashboard backdrop:
`/Users/jfrm918/.openclaw/media/tool-image-generation/tulsa-skyview-dashboard-bg---d494125f-eb60-40e5-aa31-864eba98a0be.png`

Copy it into the app’s public assets and integrate it into both dashboard modes.

## Final Quality Bar
Before calling complete, verify:
- admin view exists and feels distinct
- client view looks better than V1
- Tulsa skyline background is integrated tastefully
- UI feels more dimensional and premium
- buttons and controls feel interactive individually
- still readable and professional
- no AI-slop visual patterns
- no ugly spacing collapses on mobile

## Deliverable Standard
The result should feel like software Jason would proudly show a client and also use himself to run the business.
