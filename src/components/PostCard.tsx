"use client";

import { useTransition } from "react";
import { removePost } from "@/app/actions/boards";
import { extractLinkedInEmbedUrl } from "@/lib/linkedin";
import type { Post } from "@/lib/types";

export function PostCard({ post, boardId }: { post: Post; boardId: string }) {
  const [isPending, startTransition] = useTransition();
  const embedUrl = extractLinkedInEmbedUrl(post.linkedin_url);

  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          height={570}
          width="100%"
          frameBorder={0}
          allowFullScreen
          title="Embedded LinkedIn post"
          className="block"
        />
      ) : (
        <a
          href={post.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 text-sm text-neutral-500 hover:underline"
        >
          Couldn't embed this post — open it on LinkedIn
        </a>
      )}
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
