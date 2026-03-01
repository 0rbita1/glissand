/**
 * Domain types for the note-saving system.
 * Kept separate from component prop types (components.types.ts)
 * to maintain a clear boundary between UI and data concerns.
 */

/** Represents the loading lifecycle of the persisted note. */
export type NoteLoadState = "idle" | "loading" | "ready" | "error";

/** Lightweight snapshot of a note's runtime state. */
export interface NoteState {
  content: string;
  loadState: NoteLoadState;
  lastModified: Date | null;
}
