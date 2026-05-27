# TOPIC_PROTOCOL.md

> Standard Data Protocol for Topic Generation
> This document defines the exact schema, structure, and rules for generating a topic.
> AI agents MUST follow this protocol to ensure every topic is structurally identical and simulation-first.

---

## 1. Topic Directory Structure

Every topic lives in `src/app/topics/{NN-slug}/` and contains exactly 4 files:

```
src/app/topics/{NN-slug}/
├── page.tsx                 # Server component: article shell
├── {Name}Visualization.tsx  # Client component: interactive simulation
├── QuizSection.tsx          # Client component: quiz wrapper
└── quiz.json                # Static data: 5 questions
```

### File Responsibilities

| File | Component Type | What It Contains |
|---|---|---|
| `page.tsx` | Server Component | Article text (JSX), imports visualization and quiz |
| `*Visualization.tsx` | Client Component | All interactive simulation logic, wrapped in VisualizationWrapper |
| `QuizSection.tsx` | Client Component | 3-line wrapper around QuizRenderer + quiz.json import |
| `quiz.json` | Static JSON | Array of 5 question objects |

### Naming Rules

| Element | Rule | Example |
|---|---|---|
| Directory | `{NN}-{kebab-case}` | `03-deadlock` |
| Visualization file | `{PascalCase}Visualization.tsx` | `DeadlockVisualization.tsx` |
| Visualization export | `{PascalCase}Visualization` | `DeadlockVisualization` |
| Quiz section export | `QuizSection` | Always the same |
| Quiz title | `"{TopicTitle} 知识测验"` | `"死锁 知识测验"` |

---

## 2. Metadata Schema

Each topic is registered in two shared arrays. The data shape is identical in both.

### Homepage Array (`src/app/page.tsx`)

```ts
{
  slug: string;        // "{NN}-{kebab-case}", e.g. "03-deadlock"
  title: string;       // Chinese title, e.g. "死锁"
  desc: string;        // One-line Chinese description, max 20 chars
  icon: string;        // Single emoji, e.g. "🔒"
  concepts: string[];  // 3-5 key concept tags, Chinese, e.g. ["互斥", "持有并等待", "不可抢占"]
}
```

### Sidebar Array (`src/components/ui/Sidebar.tsx`)

```ts
{
  slug: string;   // Same as homepage
  title: string;  // Same as homepage
  desc: string;   // Same as homepage
}
```

### Metadata Rules

- `slug` MUST match the directory name exactly
- `title` MUST be 2-6 Chinese characters
- `desc` MUST be a single sentence, max 20 characters
- `icon` MUST be a single emoji character
- `concepts` MUST have 3-5 items, each 2-4 Chinese characters
- The topic MUST appear in BOTH arrays in the SAME order (numbered sequential)

---

## 3. Article Section Structure

The article is written as JSX in `page.tsx`, wrapped in `<div className="article-content">`.

### Required Sections (in order)

```
1. 引言 (Introduction)
   - What is this concept?
   - Why does it matter?
   - Real-world analogy (1-2 sentences)

2. 核心概念 (Core Concepts)
   - Define the key terms
   - Explain the mechanisms
   - Use tables for comparisons where applicable

3. 工作原理 (How It Works)
   - Step-by-step explanation of the mechanism
   - Use code blocks for pseudocode or examples
   - Use blockquotes for key insights

4. 实际应用 (Practical Applications)
   - Real-world examples
   - Common scenarios

5. 总结 (Summary)
   - 3-5 bullet points recapping key takeaways
```

### Article JSX Template

```tsx
<div className="max-w-4xl mx-auto px-6 py-8">
  {/* Header */}
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
        {NN}
      </span>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>

  {/* Article */}
  <div className="article-content">
    <h2>引言</h2>
    {/* ... */}

    <h2>核心概念</h2>
    {/* ... */}

    <h2>工作原理</h2>
    {/* ... */}

    <h2>实际应用</h2>
    {/* ... */}

    <h2>总结</h2>
    {/* ... */}
  </div>

  {/* Visualization */}
  <div className="mt-8">
    <XxxVisualization />
  </div>

  {/* Quiz */}
  <div className="mt-8">
    <QuizSection />
  </div>
</div>
```

### Article Writing Rules

- All text in Chinese (zh-CN)
- Paragraphs: 2-4 sentences max. Never walls of text.
- Use `<table>` for any comparison (2+ items with attributes)
- Use `<blockquote>` for the single most important insight per section
- Use `<code>` for technical terms, `<pre><code>` for multi-line examples
- Every section MUST have at least one visual element (table, code block, or blockquote)
- Total article length: 800-1500 Chinese characters. Shorter is better.

---

## 4. Visualization Step Protocol

### Step Contract

Every visualization is a sequence of **discrete steps**. Each step is a self-contained view.

```
Step 0: ALWAYS an introduction/static overview
Step 1+: Interactive demos, simulations, comparisons
Final step: SHOULD be the most interactive (user controls the simulation)
```

### Step Count Rules

| Topic Complexity | Minimum Steps | Maximum Steps |
|---|---|---|
| Simple concept | 2 | 3 |
| Medium concept | 3 | 4 |
| Complex concept | 4 | 6 |

### Step Type Definitions

| Type | Code | Description | Interaction Level |
|---|---|---|---|
| `overview` | `INTRO` | Static visual showing the concept structure | None (read-only) |
| `demo` | `DEMO` | Pre-configured example, user watches | None or minimal |
| `interactive` | `INTERACT` | User manipulates inputs, observes output | High |
| `simulation` | `SIM` | Step-through process, user controls execution | High |
| `comparison` | `COMPARE` | Side-by-side or toggle between alternatives | Medium |

### Step Sequence Pattern

```
Step 0: INTRO    -- "Here is the structure/system"
Step 1: DEMO     -- "Watch how it works with this example"
Step 2: INTERACT -- "Now you try: change X and see what happens"
Step 3: SIM      -- "Run the full process step by step"
```

### Step Rendering Pattern

```tsx
{step === 0 && <IntroView />}
{step === 1 && <DemoView />}
{step === 2 && <InteractiveView />}
{step === 3 && <SimulationView />}
```

Each step view is a local sub-component defined in the same file. NEVER import step components from other files.

---

## 5. Quiz Difficulty Rules

### Question Distribution (per topic, 5 questions)

| Difficulty | Count | Description |
|---|---|---|
| Recall | 1-2 | "What is X?", "Which of the following defines Y?" |
| Comprehension | 2-3 | "Why does X happen?", "What is the purpose of Y?" |
| Application | 1-2 | "Given this scenario, what would happen?", "Which approach solves X?" |

### Question Quality Rules

- Each question MUST have exactly 4 options
- The correct answer MUST be at index 0 in the `options` array (the `answer` field is always `0`)
- Distractors (wrong options) MUST be plausible -- not obviously wrong
- Never use "All of the above" or "None of the above"
- Never ask about specific numbers unless the number is a core concept
- The `explanation` MUST teach WHY the answer is correct, not just restate it
- Questions MUST test understanding from the visualization, not just the article

### Quiz JSON Schema

```json
[
  {
    "question": "string -- the question text in Chinese",
    "options": ["string -- correct answer", "string -- distractor", "string -- distractor", "string -- distractor"],
    "answer": 0,
    "explanation": "string -- 1-2 sentence explanation of why the correct answer is correct"
  }
]
```

### Explanation Quality

BAD: "A 是正确的因为 A 就是正确答案。"
GOOD: "死锁的四个必要条件之一是互斥，即资源不能被多个进程同时使用。如果资源可以共享，就不会产生死锁。"

---

## 6. Naming Conventions

### File Naming

| Element | Convention | Example |
|---|---|---|
| Topic directory | `{NN}-{kebab-case-slug}` | `07-pipelining` |
| Visualization file | `{PascalCase}Visualization.tsx` | `PipelineVisualization.tsx` |
| Quiz section | `QuizSection.tsx` | Always this name |
| Quiz data | `quiz.json` | Always this name |

### Component Naming

| Element | Convention | Example |
|---|---|---|
| Page component | `export default function {Topic}Page()` | `PipelinePage` |
| Visualization component | `export function {Topic}Visualization()` | `PipelineVisualization` |
| Quiz section | `export function QuizSection()` | Always this name |
| Step sub-components | `{StepName}View` or `{ConceptName}Demo` | `IntroView`, `CacheDemo` |
| Helper sub-components | `{ConceptName}` | `PipelineDiagram`, `StateTable` |

### State Variable Naming

| Pattern | Convention | Example |
|---|---|---|
| Current step | `step` | `const [step, setStep] = useState(0)` |
| Selected item | `selected` | `const [selected, setSelected] = useState<string \| null>(null)` |
| Toggle state | `{noun}Active` or `show{Noun}` | `const [showDetails, setShowDetails] = useState(false)` |
| Input value | `{noun}Value` or `{noun}` | `const [inputValue, setInputValue] = useState("")` |
| Simulation state | `{noun}State` | `const [processState, setProcessState] = useState("idle")` |
| Collection | `{plural noun}` | `const [nodes, setNodes] = useState<Node[]>([])` |
| Index | `{noun}Index` | `const [currentIndex, setCurrentIndex] = useState(0)` |
| Boolean flag | `is{Adjective}` or `has{PastTense}` | `const [isRunning, setIsRunning] = useState(false)` |
| Timer ref | `intervalRef` or `timeoutRef` | `const intervalRef = useRef<NodeJS.Timeout>(null)` |

### CSS Class Naming (Tailwind)

- Use semantic color tokens: `bg-card`, `text-foreground`, `border-border`
- Use opacity for emphasis: `bg-primary/10`, `bg-success/20`
- Use `transition-colors duration-200` on all interactive elements
- Use `rounded-lg` for all containers, `rounded-full` for badges

---

## 7. Interaction Rules

### Mandatory Interactions

Every visualization MUST include at least one of these interaction types:

| Interaction | Implementation | When to Use |
|---|---|---|
| **Toggle** | Click to switch between states | Binary choices, on/off, show/hide |
| **Select** | Click to choose from options | Picking items, choosing modes |
| **Input** | Type or slider to set value | Numeric parameters, text input |
| **Step Execute** | Click to advance one step | Algorithm simulation, process walkthrough |
| **Auto Play** | Play/pause with speed control | Any time-based process |

### Interaction Feedback Rules

| Action | Visual Feedback |
|---|---|
| Click a button | `active:bg-primary/20` press effect |
| Toggle a state | Color change: `bg-secondary` → `bg-primary text-primary-foreground` |
| Select an item | Border highlight: `border-primary ring-2 ring-primary/20` |
| Correct action | `bg-success/20 text-success` flash |
| Wrong action | `bg-error/20 text-error` flash |
| Disabled button | `opacity-50 cursor-not-allowed` |

### Interactive Element Inventory

Use these standard interactive elements (do not invent new patterns):

```tsx
// Toggle button
<button
  onClick={() => setActive(!active)}
  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
  }`}
>

// Numbered selector
{items.map((item, i) => (
  <button
    key={i}
    onClick={() => setSelected(i)}
    className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
      selected === i
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-muted-foreground"
    }`}
  >
    {i + 1}
  </button>
))}

// Binary toggle (0/1)
<button
  onClick={() => toggleBit(i)}
  className={`w-10 h-10 rounded-lg font-mono text-lg font-bold transition-colors ${
    bits[i]
      ? "bg-success text-white"
      : "bg-secondary text-muted-foreground"
  }`}
>
  {bits[i]}
</button>

// Range slider
<input
  type="range"
  min={0}
  max={100}
  value={value}
  onChange={(e) => setValue(Number(e.target.value))}
  className="w-full accent-primary"
/>

// Execute step button
<button
  onClick={executeStep}
  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
>
  执行一步
</button>
```

---

## 8. State Naming Rules

### Top-Level State (every visualization)

```tsx
const [step, setStep] = useState(0);           // ALWAYS first
// Then topic-specific state below
```

### State Grouping Order

```tsx
// 1. Step state (always first)
const [step, setStep] = useState(0);

// 2. Selection state
const [selected, setSelected] = useState<number | null>(null);

// 3. Input state
const [inputValue, setInputValue] = useState("");

// 4. Simulation state
const [isRunning, setIsRunning] = useState(false);
const [currentPhase, setCurrentPhase] = useState("idle");

// 5. Data state
const [items, setItems] = useState<Item[]>(initialItems);

// 6. Timer refs (always last)
const intervalRef = useRef<NodeJS.Timeout>(null);
```

### State Shape Rules

- NEVER use objects when a primitive will do (`useState("idle")` not `useState({ status: "idle" })`)
- NEVER use `any` type -- always define explicit types
- Use `null` for "nothing selected" (`useState<string | null>(null)`)
- Use string unions for finite states (`useState<"idle" | "running" | "done">("idle")`)
- Derive values from state instead of storing duplicates (use `const derived = state.filter(...)` instead of storing a separate count)

---

## 9. Visualization Categories

Every topic's visualization falls into one of these categories. The category determines the step structure and interaction pattern.

### Category A: Structure Explorer

**Purpose:** Show the parts of a system and how they relate.

**Pattern:**
```
Step 0: INTRO -- labeled diagram of the structure
Step 1: INTERACT -- click parts to see details, highlight connections
```

**Examples:** Memory hierarchy, CPU components, network stack, tree structure

**Template:**
```tsx
// Step 0: Static labeled diagram
// Step 1: Clickable parts with detail panel
```

### Category B: Process Simulator

**Purpose:** Walk through a multi-step process in time.

**Pattern:**
```
Step 0: INTRO -- overview of all phases
Step 1: SIM -- step-through execution, one phase per click
Step 2: SIM -- different scenario or variant
```

**Examples:** Instruction cycle, packet routing, algorithm execution, scheduling

**Template:**
```tsx
// Step 0: Timeline/phase overview
// Step 1: Cycle-by-cycle execution with current phase highlighted
// Step 2: Different input or algorithm variant
```

### Category C: Parameter Playground

**Purpose:** Let the user change inputs and observe how the output changes.

**Pattern:**
```
Step 0: INTRO -- show the formula/relationship
Step 1: INTERACT -- sliders/toggles to change parameters, output updates live
Step 2: COMPARE -- show two configurations side by side
```

**Examples:** Cache hit rate vs size, CPI calculation, bandwidth vs latency

**Template:**
```tsx
// Step 0: Formula or relationship diagram
// Step 1: Input controls + real-time output display
// Step 2: Side-by-side comparison with different settings
```

### Category D: State Machine

**Purpose:** Show how a system transitions between states.

**Pattern:**
```
Step 0: INTRO -- state diagram with all states and transitions
Step 1: INTERACT -- click to trigger transitions, watch state change
Step 2: SIM -- auto-play through a sequence of events
```

**Examples:** Process states, TCP connection, page replacement, deadlock detection

**Template:**
```tsx
// Step 0: State diagram (nodes = states, edges = transitions)
// Step 1: Event buttons that trigger transitions
// Step 2: Auto-play event sequence
```

### Category E: Algorithm Visualizer

**Purpose:** Show an algorithm's logic step by step.

**Pattern:**
```
Step 0: INTRO -- show the data structure before algorithm runs
Step 1: SIM -- execute one step of the algorithm
Step 2: INTERACT -- user provides input, algorithm runs on it
```

**Examples:** Sorting, scheduling, page replacement, routing

**Template:**
```tsx
// Step 0: Initial data state
// Step 1: Step-through with highlighted current operation
// Step 2: User input → algorithm execution
```

### Category Selection Guide

| If the topic is about... | Use Category |
|---|---|
| A system with parts | A (Structure Explorer) |
| A process that happens in steps | B (Process Simulator) |
| A relationship between variables | C (Parameter Playground) |
| A system with states and transitions | D (State Machine) |
| An algorithm with logic | E (Algorithm Visualizer) |

---

## 10. Simulation Design Patterns

### Pattern 1: Cycle Stepper

For processes that happen in discrete cycles.

```tsx
const [cycle, setCycle] = useState(0);
const [isRunning, setIsRunning] = useState(false);
const intervalRef = useRef<NodeJS.Timeout>(null);

const nextCycle = () => setCycle((c) => Math.min(c + 1, maxCycles));
const reset = () => { setCycle(0); setIsRunning(false); };

useEffect(() => {
  if (isRunning) {
    intervalRef.current = setInterval(nextCycle, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }
}, [isRunning]);

// Render: show current state at `cycle`, highlight active elements
```

### Pattern 2: Toggle Matrix

For systems where each element can be in one of N states.

```tsx
const [states, setStates] = useState<string[]>(Array(n).fill("off"));

const toggle = (index: number) => {
  setStates((prev) => {
    const next = [...prev];
    next[index] = next[index] === "off" ? "on" : "off";
    return next;
  });
};

// Render: grid of buttons, each colored by its state
```

### Pattern 3: Input-Output Processor

For concepts where input transforms into output through a mechanism.

```tsx
const [input, setInput] = useState(defaultInput);
const output = useMemo(() => computeOutput(input), [input]);

// Render: input controls on left, output display on right
```

### Pattern 4: Event-Driven State Machine

For systems that transition between states based on events.

```tsx
const [state, setState] = useState<State>("idle");
const [eventLog, setEventLog] = useState<string[]>([]);

const sendEvent = (event: Event) => {
  const nextState = transition(state, event);
  setState(nextState);
  setEventLog((prev) => [...prev, `${state} → ${event} → ${nextState}`]);
};

// Render: state diagram with current state highlighted, event buttons
```

### Pattern 5: Collection Manager

For data structures or systems with multiple interacting entities.

```tsx
const [items, setItems] = useState<Item[]>(initialItems);
const [selectedId, setSelectedId] = useState<string | null>(null);

const addItem = (item: Item) => setItems((prev) => [...prev, item]);
const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
const updateItem = (id: string, changes: Partial<Item>) =>
  setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));

// Render: visual list/grid of items, click to select, buttons to modify
```

### Pattern 6: Comparison Toggle

For showing the difference between two approaches.

```tsx
const [mode, setMode] = useState<"A" | "B">("A");

// Render: toggle switch at top, content changes based on mode
// Both modes show the same concept but with different approaches
```

### Timer Rules (All Patterns)

- ALWAYS store interval/timeout in `useRef`
- ALWAYS clean up in `useEffect` return
- NEVER start a timer without a corresponding stop mechanism
- Default speed: 1000ms per step
- Let VisualizationWrapper handle step auto-advance; only use timers for internal animations

---

## 11. Generation Checklist

When generating a new topic, verify each item:

### Files

- [ ] Directory created: `src/app/topics/{NN-slug}/`
- [ ] `page.tsx` exists, is a server component (no "use client")
- [ ] `*Visualization.tsx` exists, is a client component ("use client")
- [ ] `QuizSection.tsx` exists, imports QuizRenderer and quiz.json
- [ ] `quiz.json` exists with exactly 5 questions

### page.tsx

- [ ] Imports visualization and quiz section
- [ ] Has topic header with number badge, title, description
- [ ] Article wrapped in `<div className="article-content">`
- [ ] Article has all 5 required sections (引言, 核心概念, 工作原理, 实际应用, 总结)
- [ ] Article length is 800-1500 Chinese characters
- [ ] Visualization rendered after article
- [ ] Quiz rendered after visualization

### *Visualization.tsx

- [ ] Has "use client" directive
- [ ] Imports and wraps in VisualizationWrapper
- [ ] Has `const [step, setStep] = useState(0)` as first state
- [ ] Has 2-6 steps
- [ ] Step 0 is an intro/overview
- [ ] At least one step is interactive (user controls something)
- [ ] All sub-components defined locally in the same file
- [ ] All timers use useRef with cleanup in useEffect return
- [ ] Uses semantic color tokens (no hardcoded colors)
- [ ] Works in both light and dark mode

### quiz.json

- [ ] Exactly 5 questions
- [ ] Each question has exactly 4 options
- [ ] `answer` is always 0
- [ ] `explanation` teaches why, not just what
- [ ] Mix of recall (1-2), comprehension (2-3), application (1-2)

### Registration

- [ ] Topic added to `src/app/page.tsx` topics array
- [ ] Topic added to `src/components/ui/Sidebar.tsx` topics array
- [ ] Order matches between homepage, sidebar, and directory numbering
- [ ] `npm run build` passes
