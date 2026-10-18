/**
 * Fast-moving facts about the Copilot desktop experience, GitHub and Netlify.
 * Lessons reference these instead of hard-coding them. Re-verify before launch and
 * quarterly; the player shows `verifiedOn` beside every lesson.
 *
 * Items marked `needsVerification` are deliberately generic until checked.
 */
export const reference = {
  verifiedOn: "UNVERIFIED — check before launch",
  needsVerification: true,
  copilotApp: "the Copilot desktop app",
  modelPickerHint:
    "Open the model picker in the chat panel. Pick a fast, general model for everyday edits and a stronger reasoning model for multi-file or tricky changes. Model names and availability change often and depend on your plan.",
  skillsHint:
    "Agent skills and plug-ins extend what Copilot can do (for example, working with forms, design tokens or deployment). Find them in the app's extensions or skills area and follow its install prompt.",
  githubSignup: "https://github.com/signup",
  copilotPlans: "https://github.com/features/copilot/plans",
  netlifySignup: "https://app.netlify.com/signup",
  netlifyImportHint:
    "In Netlify choose Add new site → Import an existing project → GitHub, pick your repository, keep the defaults for a plain HTML project and deploy.",
} as const;
