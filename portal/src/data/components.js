// @ts-check
/** @type {import("../types").Module} */
export const components = {
  id: "components",
  title: "Reading a component library",
  short: "Components",
  hue: "var(--hue-comp)",
  icon: "M12 2l3 3-3 3-3-3z|M5 9l3 3-3 3-3-3z|M19 9l3 3-3 3-3-3z|M12 16l3 3-3 3-3-3z",
  tagline: "How your Figma components become code, and how to review them in Storybook.",
  outcome: "Read a component's props, find it in Storybook, and trace a design token from Figma to CSS.",
  lessons: [
    {
      id: "what-is-a-library",
      title: "Components, props and variants",
      minutes: 9,
      summary: "The same ideas you use in Figma, with different names.",
      blocks: [
        { t: "p", text: "A **component** in code is a reusable piece of UI with a name, inputs and output, just like a main component in Figma. A **component library** is the shared set of them that every product team builds from." },
        { t: "table", head: ["In Figma", "In code", "Example"], rows: [
          ["Main component", "Component", "`Button`"],
          ["Instance", "Usage of the component", "`<Button>Save</Button>`"],
          ["Variant property", "Prop with fixed options", "`variant=\"primary\"`"],
          ["Boolean property", "Boolean prop", "`disabled`"],
          ["Text property", "String prop or children", "`label=\"Save\"`"],
          ["Instance swap", "Slot or children", "`icon={<PlusIcon />}`"],
        ] },
        { t: "callout", tone: "design", title: "Designer translation", text: "When your variant properties and the code's props use the same names and options, handoff becomes a lookup instead of a translation. Agree the names with engineering before building variants." },
        { t: "terms", items: [
          ["Prop", "An input to a component, like a property on a Figma instance."],
          ["Slot", "A place in a component where other content can be inserted."],
          ["Design system", "Components, tokens, guidelines and the process that keeps them in sync."],
        ] },
        { t: "quiz", q: "A Figma button has a variant property \"Size\" with Small, Medium and Large. What does that usually become in code?", options: ["Three separate components", "A size prop with three allowed values", "A CSS file per size"], answer: 1, why: "Variant properties map to props with a fixed set of options, so one component handles every size." },
      ],
    },
    {
      id: "reading-props",
      title: "Reading a component's API",
      minutes: 10,
      summary: "Find out what a component can do by reading its props, without running it.",
      blocks: [
        { t: "p", text: "A component's **API** is the list of props it accepts. In TypeScript codebases, that list is written as a type at the top of the file, so you can read it like a spec." },
        { t: "code", lang: "ts", code: "interface ButtonProps {\n  variant?: \"primary\" | \"secondary\" | \"ghost\";\n  size?: \"sm\" | \"md\" | \"lg\";\n  disabled?: boolean;\n  icon?: ReactNode;\n  children: ReactNode;\n}", caption: "Button.tsx: ? means optional. The | symbol lists allowed values." },
        { t: "code", lang: "jsx", code: "<Button variant=\"primary\" size=\"sm\" icon={<PlusIcon />}>\n  New project\n</Button>", caption: "Using it: each prop is set like an HTML attribute." },
        { t: "h", text: "What to look for in a review" },
        { t: "list", items: [
          "Do the allowed values match the variants in Figma, with the same names?",
          "Which prop is the default when none is set? Check that it matches the design's default.",
          "Is there a state in Figma (loading, error, selected) that has no prop in code? That is a gap to raise.",
          "Web components use attributes the same way: `<fd-button variant=\"primary\">`.",
        ] },
        { t: "quiz", q: "The design has a \"Danger\" button variant, but the props only allow primary, secondary and ghost. What does that mean?", options: ["Danger is applied with CSS", "The danger variant is not built yet", "Ghost is the same as danger"], answer: 1, why: "If a value is not in the prop's type, the component cannot render it. Raise it with engineering." },
      ],
    },
    {
      id: "storybook",
      title: "Storybook: the living spec",
      minutes: 9,
      summary: "Browse, test and review every component state without the full app.",
      blocks: [
        { t: "p", text: "**Storybook** is a workshop app that shows each component on its own. Each saved example is a **story**: one component in one state, such as \"Button / Primary / Disabled\"." },
        { t: "steps", items: [
          { title: "Start it locally", text: "Most projects add a script for it. It opens at port 6006 by default.", code: "npm run storybook" },
          { title: "Pick a story", text: "The sidebar lists components and their states." },
          { title: "Use Controls", text: "The Controls panel lets you change props live, like editing instance properties in Figma." },
          { title: "Check accessibility", text: "If the a11y add-on is installed, its panel lists contrast and labeling problems for the story." },
        ] },
        { t: "callout", tone: "design", title: "Review here, not in the app", text: "Storybook shows states that are hard to reach in the product: error, empty, loading, extreme text lengths. Ask for a story for each state in your design." },
        { t: "p", text: "Teams often publish Storybook on every pull request, and tools like Chromatic compare screenshots of each story to catch unintended visual changes." },
        { t: "quiz", q: "What is a story?", options: ["A user journey document", "One component rendered in one specific state", "A release note"], answer: 1, why: "Stories are saved examples of a component with specific props, so every state can be reviewed and tested." },
      ],
    },
    {
      id: "tokens-to-code",
      title: "From Figma variables to CSS tokens",
      minutes: 11,
      summary: "How one token value travels from your file into every product.",
      blocks: [
        { t: "p", text: "Design tokens are named values like colors, spacing and radii. To keep design and code in sync, teams export them from Figma as JSON and generate CSS from that file." },
        { t: "code", lang: "json", code: "{\n  \"color\": {\n    \"accent\": { \"$type\": \"color\", \"$value\": \"#0b7a50\" },\n    \"text\": {\n      \"default\": { \"$type\": \"color\", \"$value\": \"{color.neutral.900}\" }\n    }\n  }\n}", caption: "tokens.json in the W3C Design Tokens format. {braces} reference another token." },
        { t: "code", lang: "css", code: ":root {\n  --color-accent: #0b7a50;\n  --color-text-default: var(--color-neutral-900);\n}", caption: "Generated tokens.css. A tool like Style Dictionary writes this from the JSON." },
        { t: "h", text: "Three tiers of tokens" },
        { t: "table", head: ["Tier", "Example", "Use"], rows: [
          ["Primitive", "`green-600`", "Raw palette. Components never use these directly."],
          ["Semantic", "`color-accent`", "Meaning. Themes swap these values."],
          ["Component", "`button-bg`", "Optional. One component's decisions."],
        ] },
        { t: "callout", tone: "warn", title: "Never hand-edit generated files", text: "If tokens.css is generated, edits there are overwritten on the next export. Change the source in Figma or tokens.json instead." },
        { t: "quiz", q: "Dark mode should change the accent color. Which tier of token should change?", options: ["Primitive", "Semantic", "Neither, use a new CSS file"], answer: 1, why: "Semantic tokens carry meaning. A theme maps the same semantic name to a different primitive value." },
      ],
    },
  ],
};
