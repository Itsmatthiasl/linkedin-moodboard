"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/types";

export function BoardGrid({
  boardId,
  initialPosts,
  initialHasMore,
}: {
  boardId: string;
  initialPosts: Post[];
  initialHasMore: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(0);
    setHasMore(initialHasMore);
  }, [boardId, initialPosts, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/boards/${boardId}/posts?page=${nextPage}`);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    }
    setLoading(false);
  }, [boardId, page, loading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
        <h2 className="text-sm font-medium">No posts yet</h2>
        <p className="text-sm text-neutral-500">
          Add a post to start filling this board.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="columns-1 gap-4 md:columns-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} boardId={boardId} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-8" />}
    </div>
  );
}
