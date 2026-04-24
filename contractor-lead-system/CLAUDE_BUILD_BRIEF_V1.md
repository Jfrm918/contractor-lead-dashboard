# Contractor Lead Conversion Dashboard — V1 Build Brief

## Objective
Build a modern, premium, mobile-friendly web app demo for a **contractor lead conversion service**.

This is **not** a generic AI dashboard.
This is a professional contractor-facing product that shows how missed calls and inbound leads get recovered, qualified, and pushed toward booked estimates.

The app must feel polished enough that Jason can:
- open it quickly on desktop
- open it easily on mobile
- later hand a simple link to a client
- show a real product, not a mockup deck

## Core Product Positioning
We help contractors convert more of the leads they already pay for by instantly following up on missed calls, qualifying prospects, and helping book more estimates.

## Primary UX Goal
The customer should understand the product within **10 seconds** of landing on the dashboard.

They should immediately see:
- how many leads came in
- how many missed calls were recovered
- which leads are hot
- whether estimates got booked
- recent conversations and alerts

## Research-Backed Design Direction
Use a **Liquid Glass / premium frosted interface style**, but use it with restraint.

Grounding for this direction:
- Apple’s 2025 Liquid Glass design language emphasizes translucency, dynamic highlights, rounded controls, and material that helps bring focus to content.
- Nielsen Norman Group notes glassmorphism can create depth and hierarchy, but overuse harms readability and accessibility.
- Dashboard UX guidance stresses intentional metrics, clear hierarchy, and avoiding clutter or forcing users to check many screens.

## Design Principles
1. **Modern, premium, calm**
   - Not startup-neon
   - Not cyberpunk
   - Not template-marketplace look
   - Not “AI agent” gimmick branding all over the screen

2. **Rounded, soft, dimensional**
   - Large border radius throughout
   - Soft shadows
   - Frosted/translucent surfaces
   - Thin glass strokes
   - Layered depth with restraint

3. **Content first, effect second**
   - Glass effect should support hierarchy, not overpower content
   - Text must remain easy to read
   - Blur and transparency should never reduce usability

4. **Interactive controls should feel alive**
   - Buttons need hover, focus, pressed, and active states
   - Each button/card should respond individually
   - Use subtle scale, lighting shift, glow, shadow, and tactile motion
   - Motion should be short and refined, not bouncy or childish

5. **Professional contractor software, not AI slop**
   Avoid:
   - oversized gradients everywhere
   - meaningless charts
   - random KPI cards with fake jargon
   - bot avatars
   - glowing blobs that interfere with legibility
   - cluttered sidebars
   - too many colors
   - harsh lines or square blocks

## Visual Direction
### Overall Look
- Premium liquid-glass UI
- Slightly dark, elegant base theme
- Subtle background lighting with soft color bloom
- Rounded edges everywhere
- No hard black outlines
- No hard 90-degree corners

### Suggested Palette
Use a restrained palette:
- background: charcoal / deep slate / deep blue-gray
- glass surfaces: translucent white + subtle cool tint
- accent: electric blue or cyan used sparingly
- success: clean green
- warning: amber
- danger: muted red
- text: bright white primary, soft gray secondary

### Materials
Use layered glass panels:
- translucent fills
- backdrop blur
- inner highlight
- 1px soft border
- soft elevation

Glass should be strongest on:
- top nav
- summary cards
- modal/dialog surfaces
- filter chips
- action buttons

### Typography
- Clean sans-serif
- Strong hierarchy
- Large confident page title
- Metric numbers should feel premium and easy to scan
- Keep copy minimal and sharp

## Interaction Requirements
Buttons and clickable cards must feel premium.

### Button Behavior
Every interactive element must support:
- hover state
- pressed state
- keyboard focus state
- disabled state

### Desired Motion Feel
- hover: slight lift or light shimmer
- press: subtle compress / push-in
- active: stronger fill or glow
- transitions: fast, smooth, expensive-feeling

### Do NOT do
- giant spring animations
- cartoon bounce
- laggy transitions
- flashy loading gimmicks

## Platform Requirements
### Access Model
Build as a **responsive web app**.

Requirements:
- looks excellent on desktop
- works cleanly on mobile
- can be bookmarked on desktop
- can be added to mobile home screen later
- single URL access path
- no complicated setup required for users

### V1 Authentication
For demo purposes, build a clean sign-in screen UI, but use a simple local/demo auth flow if needed.
No production auth complexity is required for the first demo.

## V1 Scope
Build the following pages/screens.

### 1. Sign-In Screen
Purpose: clean first impression.

Requirements:
- premium glass card centered on screen
- logo/product name placeholder
- email field
- password field
- sign-in button
- optional “Use demo account” button
- subtle background motion/light

### 2. Overview Dashboard
This is the main screen.

Show these top metrics:
- Total Leads
- Missed Calls
- Recovered Leads
- Qualified Leads
- Estimates Booked
- Response Time

Include:
- date range control
- source filter (Google Ads, LSA, Organic, Referral)
- trade filter (HVAC, Plumbing, Roofing, Electrical, Insulation)

Main content blocks:
- **Lead Funnel card**
  - leads in
  - contacted
  - qualified
  - booked
- **Recovered Missed Calls card**
  - count and trend
- **Hot Leads panel**
  - highest-priority leads needing action
- **Recent Activity feed**
  - missed call recovered
  - lead replied
  - booking requested
  - owner alert sent
- **Today’s Conversations panel**
  - short preview of active text threads

### 3. Leads Inbox
A clean operational screen.

Requirements:
- searchable table/list of leads
- status pills
- source
- city
- service requested
- urgency
- last contact time
- booking status

Lead statuses:
- New
- Contacted
- Qualified
- Unqualified
- Booking Requested
- Booked
- Closed Lost

Clicking a lead opens a detail panel or full detail page.

### 4. Lead Detail / Conversation View
This screen must show the product value clearly.

Show:
- customer name
- phone
- source
- service requested
- city/service area
- urgency
- qualification answers
- booking intent
- owner alert history

Conversation thread should show:
- missed call event
- automatic text sent
- customer replies
- qualification prompts
- booking request / next step

This needs to feel like a real, premium customer communication screen.

### 5. Owner Alerts Screen
Show alerts that would go to the contractor.

Examples:
- Hot lead recovered
- Emergency service request
- Estimate requested
- Follow-up needed

Each alert card should contain:
- contact
- issue summary
- urgency
- action recommendation
- timestamp

### 6. Monthly Scorecard Screen
Show what the client would see month to month.

Include:
- total inbound leads
- missed calls
- recovered missed calls
- qualified leads
- booked estimates
- average response time
- lead source breakdown
- a simple ROI summary section

Use tasteful charts only where useful.
No chart spam.

## Data Requirements
Use high-quality seeded demo data so the product feels real.

Seed realistic contractors/home-service examples across trades.
Include:
- names
- cities
- services
- sources
- timestamps
- statuses
- conversations
- alert summaries

The data must feel believable, not generated junk.

## Recommended Tech Stack
Use whatever best supports clean delivery, but preferred stack:
- **Next.js** or high-quality React app structure
- **TypeScript**
- **Tailwind CSS**
- component system with strong customization
- **Framer Motion** for refined motion
- charts only if visually clean and restrained

If using a UI kit, customize heavily so it does not look stock.
Do not ship a default template look.

## Layout Guidance
### Desktop
- left sidebar or top/side hybrid nav
- large overview area
- modular card grid
- strong spacing
- wide breathing room

### Mobile
- stacked cards
- sticky top bar
- compact nav or bottom nav if clean
- readable metrics
- tap-friendly controls
- maintain premium look, not collapsed chaos

## Accessibility / Quality Bar
Must have:
- readable contrast
- visible focus states
- legible text over glass surfaces
- responsive layout
- no broken overflow on mobile
- no tiny touch targets
- no inaccessible ghost buttons

## What to Avoid
Do not build:
- an “AI chatbot app” look
- giant hero marketing page instead of product
- too many charts
- useless analytics
- a cluttered CRM clone
- harsh borders / square containers
- cheap gradient overload
- low-contrast frosted glass that is hard to read
- generic lorem ipsum cards

## Deliverable Standard
The result should feel like:
- premium SaaS product
- contractor-ready
- investor/demo ready
- visually modern enough to impress
- practical enough that a real client could understand it immediately

## Build Order
1. Create design system tokens and layout shell
2. Build sign-in screen
3. Build overview dashboard
4. Build leads inbox
5. Build lead detail / conversation screen
6. Build alerts screen
7. Build monthly scorecard
8. Refine hover/press states and motion
9. Polish mobile responsiveness
10. Replace any stock-looking areas with custom styling

## Final QA Standard
Before calling this complete, confirm:
- desktop looks premium
- mobile looks premium
- glass effect is tasteful, not messy
- interactions feel refined
- buttons feel individually responsive
- seeded data feels believable
- nothing looks like AI slop
- overall product feels sellable to a real contractor

## Tone of the Product
Quietly confident.
High-end.
Useful.
Fast.
Professional.
No hype.
No cheesy AI language.

## Important Instruction
This is a **real product demo**, not a concept board.
Make decisions that improve trust, clarity, and perceived value.
When in doubt, remove clutter and make the interface feel more expensive.
