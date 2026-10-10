/** Content model for the portal. Lessons are data; components render them. */

export type Tone = "design" | "tip" | "warn";
export type DiagramName = "trunk" | "pipeline" | "boxmodel" | "vite";

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "code"; lang: string; code: string; caption?: string }
  | { t: "callout"; tone: Tone; title: string; text: string }
  | { t: "terms"; items: Array<[term: string, definition: string]> }
  | { t: "steps"; items: Array<{ title: string; text: string; code?: string }> }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "diagram"; name: DiagramName; caption: string }
  | { t: "playground"; kind: "html"; html: string; css: string; task: string }
  | { t: "playground"; kind: "md"; md: string; task: string }
  | { t: "quiz"; q: string; options: string[]; answer: number; why: string };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  blocks: Block[];
}

export interface Module {
  id: string;
  title: string;
  short: string;
  hue: string;
  icon: string;
  tagline: string;
  outcome: string;
  lessons: Lesson[];
}

export type Route =
  | { view: "home" }
  | { view: "team" }
  | { view: "glossary"; term: string | null }
  | { view: "module"; module: Module }
  | { view: "lesson"; module: Module; lesson: Lesson; index: number };

export type ProgressEvent = CustomEvent<{ lessonKey: string; done: boolean }>;

/* ---- Subset of the artifact runtime used for synced progress (db + user). ---- */

/** Stored at progress/<viewerId>. Holds ids only, never names. */
export interface ProgressDoc {
  done: string[];
  last: string | null;
  updatedAt: string;
}

export interface DbSnapshot {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
}

export interface DbDocRef {
  get(): Promise<DbSnapshot>;
  set(data: Record<string, unknown>): Promise<void>;
  onSnapshot(next: (snap: DbSnapshot) => void, error?: (e: { code: string; message: string }) => void): () => void;
}

export interface DbCollectionRef {
  onSnapshot(next: (snap: { docs: DbSnapshot[] }) => void, error?: (e: { code: string; message: string }) => void): () => void;
}

export interface DbApi {
  doc(path: string): DbDocRef;
  collection(path: string): DbCollectionRef;
}

export interface UserProfile { id: string; name: string; avatarUrl: string }

export interface UserApi {
  id(): Promise<string | null>;
  isOwner(): Promise<boolean>;
  profiles(ids: readonly string[]): Promise<Record<string, UserProfile>>;
}

export type SyncState = "connecting" | "synced" | "local" | "read-only";

declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}
