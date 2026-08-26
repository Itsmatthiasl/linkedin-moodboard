"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addPost } from "@/app/actions/boards";
import { NEW_BOARD_VALUE } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";
import type { Board } from "@/lib/types";

export function AddPostModal({
  boards,
  defaultBoardId,
}: {
  boards: Board[];
  defaultBoardId?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [boardSelection, setBoardSelection] = useState(
    defaultBoardId ?? boards[0]?.id ?? NEW_BOARD_VALUE
  );
  const [state, action] = useActionState(addPost, undefined);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setBoardSelection(defaultBoardId ?? boards[0]?.id ?? NEW_BOARD_VALUE);
    }
    if (!open && dialog.open) dialog.close();
  }, [open, defaultBoardId, boards]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        + Add post
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Add a post</h2>
          <form action={action} className="flex flex-col gap-3">
            <Field label="LinkedIn URL">
              <input
                name="linkedin_url"
                type="url"
                required
                placeholder="https://www.linkedin.com/posts/..."
                className={inputClass}
              />
            </Field>
            <Field label="Author name">
              <input name="author_name" required className={inputClass} />
            </Field>
            <Field label="Post text">
              <textarea
                name="post_text"
                required
                rows={5}
                placeholder="Paste the full post text"
                className={`${inputClass} resize-none`}
              />
            </Field>
            <Field label="Engagement (optional)">
              <input
                name="engagement_summary"
                placeholder="142 likes · 12 comments"
                className={inputClass}
              />
            </Field>
            <Field label="Board">
              <select
                name="board_id"
                value={boardSelection}
                onChange={(e) => setBoardSelection(e.target.value)}
                className={inputClass}
              >
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
                <option value={NEW_BOARD_VALUE}>+ New board…</option>
              </select>
            </Field>
            {boardSelection === NEW_BOARD_VALUE && (
              <Field label="New board name">
                <input
                  name="new_board_name"
                  required
                  autoFocus
                  className={inputClass}
                />
              </Field>
            )}
            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {state.error}
              </p>
            )}
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <SubmitButton pendingText="Saving…">Save post</SubmitButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
