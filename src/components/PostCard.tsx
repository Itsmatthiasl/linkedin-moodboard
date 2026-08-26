"use client";

import { useTransition } from "react";
import { removePost } from "@/app/actions/boards";
import type { Post } from "@/lib/types";

export function PostCard({ post, boardId }: { post: Post; boardId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="group relative mb-4 break-inside-avoid rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <a
        href={post.linkedin_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${post.author_name}'s post on LinkedIn`}
        className="absolute inset-0 z-0 rounded-lg"
      />
      <div className="relative z-[1] flex flex-col gap-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200">
            {post.author_name.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{post.author_name}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
          {post.post_text}
        </p>
        {post.engagement_summary && (
          <p className="text-xs text-neutral-500">{post.engagement_summary}</p>
        )}
      </div>
      <button
        onClick={() => startTransition(() => removePost(post.id, boardId))}
        disabled={isPending}
        className="absolute right-2 top-2 z-[2] rounded-md bg-white/90 px-2 py-1 text-xs text-neutral-500 opacity-0 shadow transition hover:text-red-600 group-hover:opacity-100 disabled:opacity-50 dark:bg-neutral-800/90 dark:text-neutral-400"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}
