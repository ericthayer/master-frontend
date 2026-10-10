// @ts-check
/** @type {import("../types").Module} */
export const vite = {
  id: "vite",
  title: "Environment configs with Vite",
  short: "Vite",
  hue: "var(--hue-vite)",
  icon: "M13 2L3 14h9l-1 8 10-12h-9z",
  tagline: "How a project runs on your laptop and how its settings change per environment.",
  outcome: "Install and run a Vite project, use environment variables safely, and read a vite.config file.",
  lessons: [
    {
      id: "dev-server",
      title: "What a dev server and build tool do",
      minutes: 8,
      summary: "Source files in, a fast local preview and an optimized production bundle out.",
      blocks: [
        { t: "p", text: "Browsers understand HTML, CSS and JavaScript. Projects are often written in TypeScript, JSX or Sass, split into hundreds of files, and depend on packages. A **build tool** like Vite turns that into something a browser can load quickly." },
        { t: "diagram", name: "vite", caption: "In development Vite serves files on demand and updates the page as you save. For production it bundles and minifies everything into the dist folder." },
        { t: "table", head: ["Mode", "Command", "What you get"], rows: [
          ["Development", "`npm run dev`", "Local server at http://localhost:5173 with instant updates"],
          ["Build", "`npm run build`", "Optimized files in `dist/`, ready to deploy"],
          ["Preview", "`npm run preview`", "Serves `dist/` locally at port 4173 to check the real build"],
        ] },
        { t: "callout", tone: "design", title: "Designer translation", text: "The dev server is Figma's prototype mode: it updates as you work. The build is the exported, compressed asset you hand off." },
        { t: "p", text: "**Hot Module Replacement (HMR)** is why Vite feels instant: when you save a CSS file, only that file is swapped in the open page, without a full reload or losing state." },
        { t: "quiz", q: "You want to check exactly what will be deployed, on your own machine. Which command?", options: ["npm run dev", "npm run build, then npm run preview", "npm install"], answer: 1, why: "dev serves source files with development helpers. build produces the real output and preview serves it." },
      ],
    },
    {
      id: "package-json",
      title: "package.json, npm and Node",
      minutes: 10,
      summary: "Where dependencies and scripts are declared.",
      blocks: [
        { t: "p", text: "**Node.js** runs JavaScript outside the browser; tools like Vite need it. **npm** comes with Node and installs packages. Every project lists its packages and commands in `package.json`." },
        { t: "code", lang: "json", code: "{\n  \"name\": \"design-portal\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"devDependencies\": {\n    \"vite\": \"^7.0.0\"\n  }\n}", caption: "npm run dev runs the command under scripts.dev" },
        { t: "steps", items: [
          { title: "Install dependencies", text: "Run once after cloning, and again when package.json changes. Creates node_modules/.", code: "npm install" },
          { title: "Start the dev server", text: "Leave this running in its own terminal tab. Stop it with Ctrl+C.", code: "npm run dev" },
          { title: "Check your Node version", text: "If a project fails to start, compare this to the version in .nvmrc or the README.", code: "node --version" },
        ] },
        { t: "callout", tone: "warn", title: "Never commit node_modules", text: "It holds thousands of downloaded files and is rebuilt by npm install. Projects list it in .gitignore so Git ignores it." },
        { t: "terms", items: [
          ["dependencies", "Packages the app needs at runtime."],
          ["devDependencies", "Packages only needed to build or test, like Vite."],
          ["package-lock.json", "Records exact installed versions so every machine matches. Commit it."],
          ["^7.0.0", "Allow any 7.x version at or above 7.0.0."],
        ] },
        { t: "quiz", q: "A teammate added a new package and you pulled their change. The dev server now errors with \"Cannot find module\". What do you run?", options: ["git reset", "npm install", "npm run build"], answer: 1, why: "The new package is listed in package.json but not yet downloaded to your node_modules." },
      ],
    },
    {
      id: "env-vars",
      title: "Environment variables and .env files",
      minutes: 12,
      summary: "Same code, different settings per environment, and keeping secrets out of Git.",
      blocks: [
        { t: "p", text: "Settings that differ between environments, like an API address or a feature flag, live in **environment variables** instead of the code. Vite reads them from `.env` files in the project root." },
        { t: "table", head: ["File", "Loaded", "Commit to Git?"], rows: [
          ["`.env`", "Always", "Yes, safe defaults only"],
          ["`.env.local`", "Always, overrides .env", "No, your machine only"],
          ["`.env.development`", "During npm run dev", "Yes"],
          ["`.env.production`", "During npm run build", "Yes, no secrets"],
        ] },
        { t: "code", lang: "bash", code: "# .env.development\nVITE_API_URL=http://localhost:8080\nVITE_SHOW_NEW_NAV=true\n\n# Not exposed to the browser: no VITE_ prefix\nDATABASE_PASSWORD=do-not-put-this-here", caption: "Only variables starting with VITE_ are available to front-end code." },
        { t: "code", lang: "js", code: "const api = import.meta.env.VITE_API_URL;\n\nif (import.meta.env.VITE_SHOW_NEW_NAV === \"true\") {\n  renderNewNav();\n}", caption: "Values are always strings, so compare to \"true\", not true." },
        { t: "callout", tone: "warn", title: "Anything in the browser is public", text: "VITE_ variables are written into the built JavaScript where anyone can read them. Never put passwords, private API keys or tokens in a VITE_ variable." },
        { t: "callout", tone: "design", title: "Designer translation", text: "Environment variables are like Figma variable modes: one design, different values per mode. Development and production are two modes of the same app." },
        { t: "quiz", q: "Which variable can your front-end code read through import.meta.env?", options: ["API_URL", "VITE_API_URL", "REACT_API_URL"], answer: 1, why: "Vite only exposes variables with the VITE_ prefix to client code, to stop secrets leaking by accident." },
      ],
    },
    {
      id: "vite-config",
      title: "Reading vite.config and common errors",
      minutes: 10,
      summary: "The settings file you will see in every Vite project.",
      blocks: [
        { t: "code", lang: "js", code: "import { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\n\nexport default defineConfig({\n  plugins: [react()],\n  base: \"/portal/\",\n  server: { port: 3000, open: true },\n  resolve: {\n    alias: { \"@\": \"/src\" },\n  },\n});", caption: "vite.config.js" },
        { t: "table", head: ["Setting", "Plain English"], rows: [
          ["`plugins`", "Add support for a framework or file type, like React or Vue."],
          ["`base`", "The URL path the site is served from. Wrong values cause blank pages and missing assets."],
          ["`server.port`", "Which port the dev server uses. The default is 5173."],
          ["`resolve.alias`", "Shortcuts for imports, so `@/components/Button` means `/src/components/Button`."],
        ] },
        { t: "h", text: "Errors you will meet" },
        { t: "table", head: ["Message", "Likely fix"], rows: [
          ["`Port 5173 is in use`", "Another dev server is running. Stop it, or Vite will try the next port."],
          ["`Failed to resolve import`", "A typo in a file path, or a missing npm install."],
          ["Blank page after deploy", "Check `base` matches the URL path the site is hosted at."],
          ["`import.meta.env.VITE_X` is undefined", "Restart the dev server after editing .env files, and check the VITE_ prefix."],
        ] },
        { t: "quiz", q: "You added a new value to .env but the app still sees undefined. What is the first thing to try?", options: ["Delete node_modules", "Restart the dev server", "Rename the file to env.txt"], answer: 1, why: "Vite reads .env files when the server starts. Changes need a restart to be picked up." },
      ],
    },
  ],
};
