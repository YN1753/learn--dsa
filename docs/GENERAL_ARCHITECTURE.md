# GENERAL_ARCHITECTURE.md

> Interactive Computer Science Learning System -- General Architecture
> This document defines the reusable architectural rules for any CS fundamentals learning project.
> Applicable to: Operating Systems, Computer Networks, Data Structures, Computer Organization, and similar subjects.

---

## 1. System Identity

This is a **simulation-first interactive learning system**. It is NOT a content showcase, marketing page, or card-based homepage.

The core value is:

- **Simulation** -- users manipulate parameters and observe cause/effect
- **Visualization** -- abstract concepts rendered as interactive diagrams
- **Learning Flow** -- article → visualization → quiz, in that order

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.x (via `@tailwindcss/postcss`) |
| Fonts | Geist Sans + Geist Mono | via `next/font/google` |
| External UI | None | All components are hand-built |
| State Management | React useState/useContext | No Redux, no Zustand |
| Rendering | DOM + inline SVG | No Canvas, no WebGL |

### Key Principle

```
Zero external UI dependencies.
Only next, react, react-dom are runtime dependencies.
Everything else is hand-built with Tailwind utility classes.
```

---

## 2. Directory Structure

```
src/
├── app/
│   ├── globals.css              # CSS variables, theme, typography
│   ├── layout.tsx               # Root layout (server component)
│   ├── page.tsx                 # Homepage (topic listing)
│   └── topics/
│       └── {NN-slug}/           # N topic directories
│           ├── page.tsx         # Article + visualization + quiz (server component shell)
│           ├── *Visualization.tsx  # Interactive visualization (client component)
│           ├── QuizSection.tsx  # Quiz wrapper (client component)
│           └── quiz.json        # Quiz data (static JSON)
└── components/
    ├── ui/                      # Shell components (AppShell, Header, Sidebar, ThemeProvider)
    ├── visualization/           # VisualizationWrapper (shared step controller)
    └── quiz/                    # QuizRenderer (shared quiz engine)
```

### Topic Directory Naming Convention

```
{two-digit-number}-{kebab-case-slug}
```

Examples: `01-process`, `03-deadlock`, `07-dijkstra`

The number determines the order in the sidebar and homepage. The slug is the URL path segment.

---

## 3. Component Hierarchy

```
RootLayout (server)
├── <html lang="zh-CN">
│   ├── <head> inline script (FOUC prevention for dark mode)
│   └── <body>
│       └── ThemeProvider (client, context)
│           └── AppShell (client, layout orchestrator)
│               ├── Sidebar (client, navigation)
│               │   ├── collapsible (w-72 ↔ w-16)
│               │   ├── N topic links with numbered badges
│               │   └── mobile: overlay with backdrop
│               ├── Header (client, top bar)
│               │   ├── hamburger (mobile)
│               │   ├── collapse toggle (desktop)
│               │   └── theme toggle
│               └── <main> (scrollable content area)
│                   └── {page content}
```

### Layer Rules

| Layer | Component Type | Responsibility |
|---|---|---|
| `layout.tsx` | Server Component | Font loading, metadata, ThemeProvider + AppShell wrapping |
| `ThemeProvider` | Client Context | Theme state, localStorage persistence, FOUC-safe |
| `AppShell` | Client Component | Sidebar/Header orchestration, collapsed state |
| `Sidebar` | Client Component | Topic navigation, active state, responsive behavior |
| `Header` | Client Component | Collapse toggle, theme toggle, mobile menu |
| `page.tsx` | Server Component | Article content (JSX), imports client components |
| `*Visualization.tsx` | Client Component | Interactive simulation, wraps in VisualizationWrapper |
| `QuizSection.tsx` | Client Component | Thin wrapper, imports QuizRenderer + quiz.json |
| `VisualizationWrapper` | Client Component | Step navigation, play/pause, speed control |
| `QuizRenderer` | Client Component | Question display, answer selection, scoring |

---

## 4. Topic Page Standard

Every topic page MUST follow this exact structure:

```
1. Header: topic number badge + title + description
2. Article: <div className="article-content"> with educational text
3. Visualization: <XxxVisualization />
4. Quiz: <QuizSection />
```

### page.tsx Template

```tsx
import { XxxVisualization } from "./XxxVisualization";
import { QuizSection } from "./QuizSection";

export default function XxxPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Topic header with number badge, title, description */}
      {/* Article content in <div className="article-content"> */}
      {/* Visualization */}
      <XxxVisualization />
      {/* Quiz */}
      <QuizSection />
    </div>
  );
}
```

### Article Content Rules

- Written as JSX directly in `page.tsx` (NOT as separate .md files)
- Wrapped in `<div className="article-content">` for typography styles
- Must include: intuitive explanation, real-world analogy, technical details, summary
- Use `<h2>` for sections, `<h3>` for subsections, `<p>` for paragraphs
- Use `<table>` for comparison data, `<blockquote>` for key insights
- Use `<code>` for inline code, `<pre><code>` for code blocks
- All text in Chinese (zh-CN)

### Quiz Data Format (quiz.json)

```json
[
  {
    "question": "问题文本",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "answer": 0,
    "explanation": "解释为什么这个答案正确"
  }
]
```

- `answer` is always the 0-indexed correct option
- Each quiz MUST have exactly 5 questions
- Questions should test conceptual understanding, not memorization

### QuizSection.tsx Template

```tsx
"use client";
import { QuizRenderer } from "@/components/quiz/QuizRenderer";
import quizData from "./quiz.json";

export function QuizSection() {
  return <QuizRenderer questions={quizData} title="XXX 知识测验" />;
}
```

---

## 5. Visualization Specification

### Core Principle: Simulation-First

Visualizations are NOT decorative illustrations. They are **interactive simulations** where the user can:

- **Manipulate inputs** -- change parameters, toggle states, select options
- **Observe cause/effect** -- see how changing one value affects the system
- **Step through time** -- watch processes unfold step by step
- **Control pace** -- play, pause, speed up, step forward/backward

### VisualizationWrapper -- The Universal Controller

Every visualization MUST wrap its content in `<VisualizationWrapper>`.

```tsx
"use client";
import { useState } from "react";
import { VisualizationWrapper } from "@/components/visualization/VisualizationWrapper";

export function XxxVisualization() {
  const [step, setStep] = useState(0);

  return (
    <VisualizationWrapper
      title="XXX 可视化"
      totalSteps={N}
      onStepChange={setStep}
    >
      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {/* ... */}
    </VisualizationWrapper>
  );
}
```

### VisualizationWrapper API

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Displayed in the card header |
| `totalSteps` | `number` | Number of discrete steps (default 1) |
| `onStepChange` | `(step: number) => void` | Called when step changes |
| `children` | `React.ReactNode` | Step content (conditionally render based on step) |

### Built-in Controls (provided by VisualizationWrapper)

- **Reset** -- returns to step 0
- **Previous/Next** -- manual step navigation
- **Play/Pause** -- auto-advance through steps
- **Speed selector** -- 0.5x, 1x, 2x, 4x (interval = 1000/speed ms)

### Visualization Component Rules

1. MUST be a `"use client"` component
2. MUST import and wrap in `VisualizationWrapper`
3. MUST use `useState` for step synchronization
4. SHOULD have at least 2 steps (intro → interactive)
5. MUST include at least one interactive element where the user controls something
6. Sub-components are defined locally in the same file (NOT shared across topics)
7. All timers MUST use `useRef` for cleanup in `useEffect` return

### Step Design Guidelines

| Step Type | Purpose | Example |
|---|---|---|
| Intro/Explanation | Show the concept visually | "Here is how a process transitions between states" |
| Interactive Demo | User manipulates inputs | Change parameters, toggle features, select items |
| Comparison | Show before/after or alternatives | With vs without optimization |
| Simulation | Step-through process | Step-by-step algorithm execution |

---

## 6. Rendering Technology

### What We Use

- **HTML/CSS (Tailwind)** -- primary rendering for all diagrams, tables, layouts
- **Inline SVG** -- icons only (arrows, play/pause, hamburger, chevron, sun/moon)
- **CSS transitions** -- `transition-all`, `transition-colors`, `duration-200` for smooth state changes
- **`animate-pulse`** -- used sparingly for attention indicators

### What We Do NOT Use

- No `<canvas>` element
- No WebGL / Three.js
- No CSS `@keyframes` animations
- No `requestAnimationFrame`
- No external animation libraries (framer-motion, react-spring, etc.)
- No D3.js or charting libraries

### Animation Pattern

All animation is **state-driven**:

```
User action / setInterval → setState → React re-render → CSS transition interpolates
```

Timer cleanup pattern (MUST follow):

```tsx
const intervalRef = useRef<NodeJS.Timeout>(null);

useEffect(() => {
  intervalRef.current = setInterval(() => { /* ... */ }, ms);
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [dependency]);
```

---

## 7. Design System / Theme

### Color Tokens (CSS Variables)

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind via `@theme inline`.

| Token | Light | Dark | Semantic Usage |
|---|---|---|---|
| `--background` | `#fafafa` | `#09090b` | Page background |
| `--foreground` | `#18181b` | `#fafafa` | Primary text |
| `--card` | `#ffffff` | `#18181b` | Card/panel backgrounds |
| `--primary` | `#2563eb` | `#3b82f6` | Active states, links, emphasis |
| `--secondary` | `#f4f4f5` | `#27272a` | Inactive backgrounds, code blocks |
| `--muted-foreground` | `#71717a` | `#a1a1aa` | Secondary text, descriptions |
| `--border` | `#e4e4e7` | `#27272a` | All borders |
| `--success` | `#22c55e` | `#4ade80` | Correct answers, completed states, positive outcomes |
| `--error` | `#ef4444` | `#f87171` | Wrong answers, error states, negative outcomes |
| `--warning` | `#f59e0b` | `#fbbf24` | Intermediate states, caution indicators |

### Tailwind Usage

```tsx
// Background
bg-background    bg-card    bg-primary/10    bg-secondary

// Text
text-foreground    text-muted-foreground    text-primary

// Border
border-border    border-primary

// Semantic
text-success    text-error    text-warning
bg-success/20    bg-error/20    bg-warning/20
```

### Color Semantics in Visualizations

| Color | Meaning |
|---|---|
| Primary (blue) | Active/selected state, current item, important values |
| Success (green) | Correct, positive outcome, completed operation |
| Error (red) | Wrong, negative outcome, error state |
| Warning (amber) | Intermediate state, caution, pending |
| Secondary (gray) | Inactive, disabled, default background |

### Typography

- Font: Geist Sans (body), Geist Mono (code)
- Headings: `font-weight: 700`, `letter-spacing: -0.02em`, `line-height: 1.2`
- Body text: `line-height: 1.8` (in `.article-content`)
- Code: `font-size: 0.875em`, `background: var(--secondary)`, `border-radius: 0.25rem`

---

## 8. Sidebar / Navigation Rules

### Structure

- Collapsible: `w-72` (expanded) ↔ `w-16` (collapsed, icon-only)
- State persisted to `localStorage` key `"sidebar-collapsed"`
- Desktop: static sidebar, always visible
- Mobile (< lg): overlay with backdrop, opened by hamburger button

### Content

- Site title link to `/`
- Home link with house icon
- Section label (hidden when collapsed)
- N topic links, each showing: numbered badge + title + description (description hidden when collapsed)
- Active topic highlighted with `bg-primary/10 text-primary`

### Collapse Behavior

- Header has a chevron toggle button (always visible on desktop)
- Sidebar header also has a chevron toggle (visible when expanded)
- When collapsed: only numbered circle badges are visible
- Hover on collapsed item shows `title` tooltip with full topic name

---

## 9. State Management Rules

### Allowed Patterns

| Pattern | Use For |
|---|---|
| `useState` | Component-local state (step, input values, toggle states) |
| `useContext` (ThemeProvider) | Theme only |
| `localStorage` | Theme preference, sidebar collapsed state |
| Props | Parent-to-child data flow |
| `useRef` | Timer references, deferred callbacks |
| `useEffect` | Timer lifecycle, localStorage sync, mount detection |

### Forbidden Patterns

- No Redux, Zustand, Jotai, or any external state library
- No global state beyond ThemeProvider
- No shared visualization state between topics
- No URL state for visualization parameters (keep it simple)

---

## 10. UI / UX Core Principles

### 1. Simulation Over Decoration

Every visualization MUST be interactive. A static diagram is not a visualization. The user must be able to change something and see the result.

### 2. Step-by-Step Learning

Complex concepts are broken into discrete steps. The user controls the pace. Auto-play is available but never forced.

### 3. Article → Visualization → Quiz Flow

The learning flow within each topic is fixed:
1. Read the article (context and theory)
2. Interact with the visualization (hands-on understanding)
3. Take the quiz (verify comprehension)

### 4. Responsive First

- Mobile: sidebar is an overlay, content is full-width
- Desktop: sidebar is static, content is scrollable
- All visualizations work on both mobile and desktop
- No horizontal scrolling

### 5. Dark Mode is Mandatory

Every component MUST support both light and dark themes. Use semantic color tokens (`bg-card`, `text-foreground`), never hardcoded colors.

### 6. Minimal Dependencies

Only `next`, `react`, `react-dom` as runtime dependencies. No UI libraries. No animation libraries. No charting libraries. Everything is hand-built with Tailwind.

### 7. Consistent Visual Language

- Rounded corners: `rounded-lg` (8px)
- Spacing: Tailwind's 4px grid (p-3, p-4, gap-3, etc.)
- Transitions: `transition-colors duration-200` for interactive elements
- Cards: `bg-card border border-border rounded-lg`
- Buttons: `rounded-lg hover:bg-secondary transition-colors`

---

## 11. Prohibited Actions

### Never Do These

1. **Never add external UI dependencies** (no shadcn/ui, no MUI, no Ant Design)
2. **Never use Canvas or WebGL** for visualizations
3. **Never use CSS `@keyframes`** -- use state-driven transitions instead
4. **Never use `requestAnimationFrame`** -- use `setInterval` with proper cleanup
5. **Never hardcode colors** -- always use CSS variable tokens
6. **Never skip dark mode** -- every component must support both themes
7. **Never create shared visualization sub-components** -- each topic's sub-components are local
8. **Never make page.tsx a client component** -- articles are server components, interactivity is in imported client components
9. **Never skip VisualizationWrapper** -- all visualizations must use the shared step controller
10. **Never add article.md or demo.ts files** -- article content is inline JSX, demos are in visualization components
11. **Never use external charting libraries** (no recharts, no chart.js)
12. **Never add loading.tsx, error.tsx, or not-found.tsx** unless explicitly needed
13. **Never force auto-play** -- always give the user control
14. **Never leave timers uncleaned** -- every setInterval/setTimeout must have cleanup in useEffect return

### Never Change These

1. The topic page structure (header → article → visualization → quiz)
2. The VisualizationWrapper API (title, totalSteps, onStepChange, children)
3. The quiz.json format (question, options, answer, explanation)
4. The color token system (CSS variables in globals.css)
5. The sidebar topic ordering (numbered, sequential)

---

## 12. Autonomous Generation Rules

This system is designed for autonomous expansion by AI agents.

### When Adding a New Topic

1. Create directory: `src/app/topics/{NN-slug}/`
2. Create `page.tsx` -- server component with article content, imports visualization and quiz
3. Create `*Visualization.tsx` -- client component wrapping in VisualizationWrapper
4. Create `QuizSection.tsx` -- thin wrapper around QuizRenderer
5. Create `quiz.json` -- 5 multiple-choice questions
6. Add the topic to the `topics` array in `src/app/page.tsx` (homepage)
7. Add the topic to the `topics` array in `src/components/ui/Sidebar.tsx`
8. Verify `npm run build` passes
9. Commit

### When Improving a Visualization

1. Read the existing visualization component
2. Add more interactive steps or improve existing ones
3. Ensure it still wraps in VisualizationWrapper
4. Ensure all timers are properly cleaned up
5. Test both light and dark modes
6. Verify build passes
7. Commit

### When Fixing a Bug

1. Identify the root cause
2. Make the minimal fix
3. Verify build passes
4. Commit

### Priority Order

```
1. Build stability (npm run build must pass)
2. Visualization interactivity (more simulation, less decoration)
3. Topic breadth (cover all topics before deepening any one)
4. Quiz quality (clear questions, good explanations)
5. UI polish (transitions, spacing, responsiveness)
```

### Expansion Strategy

- **Breadth first**: get all topics working before perfecting any one
- **Incremental**: add one feature/topic at a time
- **Never break**: always verify build before committing
- **Never delete**: add new content, don't remove existing working content
- **Checkpoint frequently**: commit after each completed topic or major improvement

---

## 13. Build & Development

### Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (uses --webpack flag)
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Path Aliases

```json
"@/*": ["./src/*"]
```

Usage: `import { X } from "@/components/ui/X"`

### TypeScript

- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx

### Build Verification

Before any commit, `npm run build` MUST succeed. The build catches:
- TypeScript errors
- Import resolution failures
- Server/client component boundary violations
- Missing exports

---

## 14. File Reference

### Shared Components

| File | Purpose |
|---|---|
| `src/components/ui/AppShell.tsx` | Layout orchestrator (sidebar + header + main) |
| `src/components/ui/Header.tsx` | Top bar with toggles |
| `src/components/ui/Sidebar.tsx` | Navigation sidebar with topic links |
| `src/components/ui/ThemeProvider.tsx` | Theme context + localStorage persistence |
| `src/components/visualization/VisualizationWrapper.tsx` | Step controller with play/pause/speed |
| `src/components/quiz/QuizRenderer.tsx` | Quiz engine with scoring |

### Config Files

| File | Purpose |
|---|---|
| `next.config.ts` | Next.js config (minimal: devIndicators: false) |
| `tsconfig.json` | TypeScript config (strict, bundler resolution) |
| `postcss.config.mjs` | PostCSS with @tailwindcss/postcss |
| `eslint.config.mjs` | ESLint flat config (next/core-web-vitals + typescript) |
| `globals.css` | CSS variables, theme, @theme inline, article typography |

### Topic Files (per topic)

| File | Purpose |
|---|---|
| `page.tsx` | Server component: article + visualization + quiz |
| `*Visualization.tsx` | Client component: interactive simulation |
| `QuizSection.tsx` | Client component: quiz wrapper |
| `quiz.json` | Static data: 5 quiz questions |

---

## 15. Adapting to a New Subject

To fork this architecture for a new CS subject (e.g., Operating Systems, Computer Networks, Data Structures):

### Steps

1. Copy the entire `src/` directory structure as-is
2. Copy all config files (`next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`)
3. Copy `globals.css` unchanged (design system is subject-agnostic)
4. Copy all shared components (`components/ui/`, `components/visualization/`, `components/quiz/`) unchanged
5. Replace `src/app/page.tsx` homepage content with the new subject's topic list
6. Replace `src/components/ui/Sidebar.tsx` topic array with the new subject's topics
7. Replace `src/app/layout.tsx` metadata (title, description) for the new subject
8. Replace all `src/app/topics/*/` directories with the new subject's topics
9. Each new topic follows the standard: `page.tsx` + `*Visualization.tsx` + `QuizSection.tsx` + `quiz.json`

### What Changes Per Subject

- Homepage topic list (`page.tsx`)
- Sidebar topic list (`Sidebar.tsx`)
- Metadata (`layout.tsx` title/description)
- Topic directories and their content
- Nothing else. All shared components, design system, and architecture remain identical.

### What NEVER Changes Between Subjects

- Component hierarchy
- VisualizationWrapper API
- QuizRenderer API
- Color token system
- Sidebar structure and behavior
- State management rules
- Rendering technology rules
- All prohibited actions
