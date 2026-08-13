# SitePack Studio — Design Direction

## Three possible directions

### Theme Name: Paper Utility
Very Brief Intro: A warm, editorial tool with black ink typography, bright highlighter yellow, and a tactile paper-like canvas. It makes a technical task feel approachable and legible.
Probability: 0.06

### Theme Name: Terminal Orchard
Very Brief Intro: A deep green command-center interface with acid-lime status signals and monospaced details. It frames downloading as a precise, dependable process.
Probability: 0.04

### Theme Name: Sky Parcel
Very Brief Intro: A pale blue shipping-label system with red-orange stamps and modular cards. It turns each archived website into a clearly labeled package.
Probability: 0.08

## Selected approach: Paper Utility

### Design Movement
Swiss editorial modernism softened by early web utility graphics and photocopied zine texture.

### Core Principles
1. Make the primary action feel immediate: one dominant URL field and one unambiguous action.
2. Use contrast as navigation: ink black for content, highlighter yellow for intent, muted paper for context.
3. Favor asymmetry and editorial rhythm over a centered SaaS card stack.
4. Expose process details so the archive workflow feels understandable and trustworthy.

### Color Philosophy
The canvas is warm unbleached paper rather than sterile white. A single ownable yellow marks action, progress, and emphasis like a physical highlighter. Charcoal ink keeps the interface serious and readable; muted olive and clay support secondary states without competing with the action color.

### Layout Paradigm
An offset two-column editorial composition: a narrow masthead rail and a broad workspace, with the hero form crossing the page like a printed cover line. The workflow panel uses a horizontal split on desktop and collapses into a stacked reading order on mobile.

### Signature Elements
- A hand-cut yellow archive blob behind the hero workspace.
- Dashed ink rules and small numbered index marks that feel like a printed instruction sheet.
- Compact file-type stamps for HTML, CSS, images, fonts, and ZIP output.

### Interaction Philosophy
Interactions should feel physical and direct. Buttons compress slightly on press, toggles snap into a yellow state, and the progress panel reveals one clear status at a time rather than flooding the user with technical noise.

### Animation
Use short, snappy transitions under 240ms. On load, index marks and the masthead drift in by a few pixels; the archive blob has a slow, low-amplitude float; form feedback uses opacity and translate only. Respect prefers-reduced-motion and keep all keyboard interactions instant.

### Typography System
Use Space Grotesk for display and interface labels, paired with IBM Plex Serif italic for explanatory copy. Headlines are uppercase with generous tracking; body copy is compact and editorial; metadata is small, monospaced, and high contrast.

### Brand Essence
SitePack Studio is the clear, friendly way to package a public webpage into a portable ZIP—built for designers, developers, and curious makers who want a clean local copy without a command line.

Personality: direct, curious, dependable.

### Brand Voice
Headlines sound like instructions printed in large type. CTAs are verbs, not hype. Microcopy answers the next question before the user needs to ask it.

Example lines:
- “PACK THE PAGE. TAKE IT WITH YOU.”
- “A clean archive, with the structure left visible.”

### Wordmark & Logo
The SitePack wordmark pairs a heavy geometric “S” with a small offset ZIP tab, forming a custom mark that reads as both a seal and a compressed folder. The symbol is a black stamp shape with a yellow corner notch; it is used independently in the header and favicon.

### Signature Brand Color
Highlighter Yellow — `#F6E84A` — a warm, electric paper yellow used for action states, the archive blob, progress, and the brand stamp.
