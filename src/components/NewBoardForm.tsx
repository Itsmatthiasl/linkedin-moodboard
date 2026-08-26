"use client";

import { useActionState, useRef, useState } from "react";
import { createBoard } from "@/app/actions/boards";
import { SubmitButton } from "@/components/SubmitButton";

export function NewBoardForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createBoard, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-dashed border-neutral-300 px-3 py-2 text-left text-sm text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:text-neutral-300"
      >
        + New board
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input
        name="name"
        placeholder="Board name"
        autoFocus
        required
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
      />
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <div className="flex gap-2">
        <SubmitButton pendingText="Creating…" className="flex-1 !py-1.5 text-xs">
          Create
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
